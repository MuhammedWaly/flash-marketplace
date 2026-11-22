using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Order;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Admin.Finance.Queries.GetMerchantFinances
{
    public class GetMerchantFinancesQueryHandler(IAppDbContext context)
        : IRequestHandler<GetMerchantFinancesQuery, Result<List<MerchantFinanceDto>>>
    {
        public async Task<Result<List<MerchantFinanceDto>>> Handle(
            GetMerchantFinancesQuery request,
            CancellationToken cancellationToken)
        {
            var merchantsQuery = context.Merchants.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.Trim().ToLower();
                merchantsQuery = merchantsQuery.Where(m =>
                    m.StoreName.ToLower().Contains(search) ||
                    m.OwnerName.ToLower().Contains(search) ||
                    m.Email.ToLower().Contains(search));
            }

            var merchants = await merchantsQuery
                .OrderByDescending(m => m.Balance)
                .ThenBy(m => m.StoreName)
                .ToListAsync(cancellationToken);

            var salesStats = await context.OrderItems
                .AsNoTracking()
                .Where(oi => oi.Order != null && oi.Order.Status == OrderStatus.Delivered)
                .GroupBy(oi => oi.MerchantId)
                .Select(g => new
                {
                    MerchantId = g.Key,
                    TotalSales = g.Sum(x => x.TotalPrice),
                    TotalCommission = g.Sum(x => x.CommissionAmount),
                    TotalEarnings = g.Sum(x => x.MerchantEarnings),
                    OrdersCount = g.Select(x => x.OrderId).Distinct().Count()
                })
                .ToDictionaryAsync(x => x.MerchantId, cancellationToken);

            var result = merchants.Select(m =>
            {
                salesStats.TryGetValue(m.Id, out var stats);

                return new MerchantFinanceDto
                {
                    MerchantId = m.Id,
                    StoreName = m.StoreName,
                    OwnerName = m.OwnerName,
                    Email = m.Email,
                    PhoneNumber = m.PhoneNumber,
                    LogoUrl = m.LogoUrl,
                    CommissionRate = m.CommissionRate,
                    Balance = m.Balance,
                    TotalSales = stats?.TotalSales ?? 0m,
                    TotalCommissionPaid = stats?.TotalCommission ?? 0m,
                    TotalEarnings = stats?.TotalEarnings ?? 0m,
                    CompletedOrdersCount = stats?.OrdersCount ?? 0,
                    IsApproved = m.IsApproved,
                    IsActive = m.IsActive
                };
            }).ToList();

            return result;
        }
    }
}

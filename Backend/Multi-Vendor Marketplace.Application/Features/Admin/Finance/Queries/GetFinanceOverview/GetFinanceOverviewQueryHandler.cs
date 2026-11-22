using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Order;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Admin.Finance.Queries.GetFinanceOverview
{
    public class GetFinanceOverviewQueryHandler(IAppDbContext context)
        : IRequestHandler<GetFinanceOverviewQuery, Result<FinanceOverviewDto>>
    {
        public async Task<Result<FinanceOverviewDto>> Handle(
            GetFinanceOverviewQuery request,
            CancellationToken cancellationToken)
        {
            var totalOrdersCount = await context.Orders.CountAsync(cancellationToken);
            var completedOrdersCount = await context.Orders.CountAsync(o => o.Status == OrderStatus.Delivered, cancellationToken);

            var totalGmv = await context.Orders
                .Where(o => o.Status == OrderStatus.Delivered)
                .SumAsync(o => (decimal?)o.TotalAmount, cancellationToken) ?? 0m;

            var totalPlatformCommission = await context.OrderItems
                .Where(oi => oi.Order != null && oi.Order.Status == OrderStatus.Delivered)
                .SumAsync(oi => (decimal?)oi.CommissionAmount, cancellationToken) ?? 0m;

            var totalMerchantEarnings = await context.OrderItems
                .Where(oi => oi.Order != null && oi.Order.Status == OrderStatus.Delivered)
                .SumAsync(oi => (decimal?)oi.MerchantEarnings, cancellationToken) ?? 0m;

            var totalVendorBalances = await context.Merchants
                .SumAsync(m => (decimal?)m.Balance, cancellationToken) ?? 0m;

            var activeMerchantsCount = await context.Merchants
                .CountAsync(m => m.IsApproved && m.IsActive, cancellationToken);

            var pendingMerchantsCount = await context.Merchants
                .CountAsync(m => !m.IsApproved, cancellationToken);

            return new FinanceOverviewDto
            {
                TotalGmv = totalGmv,
                TotalPlatformCommission = totalPlatformCommission,
                TotalMerchantEarnings = totalMerchantEarnings,
                TotalVendorBalances = totalVendorBalances,
                TotalOrdersCount = totalOrdersCount,
                CompletedOrdersCount = completedOrdersCount,
                ActiveMerchantsCount = activeMerchantsCount,
                PendingMerchantsCount = pendingMerchantsCount
            };
        }
    }
}

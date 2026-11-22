using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Common.Models;
using Multi_Vendor_Marketplace.Application.Features.Orders.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Orders.Queries.GetMyOrders
{
    public class GetMyOrdersQueryHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<GetMyOrdersQuery, Result<PagedResult<OrderDto>>>
    {
        public async Task<Result<PagedResult<OrderDto>>> Handle(GetMyOrdersQuery request, CancellationToken cancellationToken)
        {
            var userId = currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Error.Unauthorized("User.Unauthorized", "User is not authenticated.");
            }

            var pageNumber = request.PageNumber > 0 ? request.PageNumber : 1;
            var pageSize = request.PageSize > 0 ? request.PageSize : 5;

            var customer = await context.Customers
                .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);

            if (customer is null)
            {
                return new PagedResult<OrderDto>([], 0, pageNumber, pageSize);
            }

            var query = context.Orders
                .AsNoTracking()
                .Where(o => o.CustomerId == customer.Id);

            var totalCount = await query.CountAsync(cancellationToken);

            var orders = await query
                .Include(o => o.Resturant)
                .Include(o => o.OrderItems)
                .OrderByDescending(o => o.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new OrderDto(
                    o.Id,
                    o.OrderNumber,
                    o.CustomerId,
                    o.ResturantId,
                    o.Resturant != null ? o.Resturant.Name : null,
                    o.Status.ToString(),
                    o.PaymentStatus.ToString(),
                    o.SubTotal,
                    o.ShippingFee,
                    o.TotalAmount,
                    o.ShippingAddress,
                    o.PaymentMethod,
                    o.CreatedAt,
                    o.OrderItems.Select(i => new OrderItemDto(
                        i.Id,
                        i.ProductId,
                        i.ProductName,
                        i.UnitPrice,
                        i.Quantity,
                        i.TotalPrice
                    )).ToList()
                ))
                .ToListAsync(cancellationToken);

            return new PagedResult<OrderDto>(orders, totalCount, pageNumber, pageSize);
        }
    }
}

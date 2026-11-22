using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Common.Models;
using Multi_Vendor_Marketplace.Application.Features.Orders.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Resturants;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Orders.Queries.GetRestaurantOrders
{
    public class GetRestaurantOrdersQueryHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<GetRestaurantOrdersQuery, Result<PagedResult<OrderDto>>>
    {
        public async Task<Result<PagedResult<OrderDto>>> Handle(GetRestaurantOrdersQuery request, CancellationToken cancellationToken)
        {
            var resturant = await context.Resturants
                .FirstOrDefaultAsync(r => r.Id == request.ResturantId, cancellationToken);

            if (resturant is null)
            {
                return ResturantError.NotFound;
            }

            // Resource-Based Data Ownership check
            if (!currentUserService.IsAdmin && resturant.OwnerId != currentUserService.UserId)
            {
                return Error.Forbidden("Order.NotOwner", "You do not have permission to view orders for this restaurant.");
            }

            var pageNumber = request.PageNumber > 0 ? request.PageNumber : 1;
            var pageSize = request.PageSize > 0 ? request.PageSize : 10;

            var query = context.Orders
                .AsNoTracking()
                .Where(o => o.ResturantId == request.ResturantId);

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

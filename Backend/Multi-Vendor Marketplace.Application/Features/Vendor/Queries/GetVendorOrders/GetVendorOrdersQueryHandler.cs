using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Common.Models;
using Multi_Vendor_Marketplace.Application.Features.Orders.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Order;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Vendor.Queries.GetVendorOrders
{
    public class GetVendorOrdersQueryHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<GetVendorOrdersQuery, Result<PagedResult<OrderDto>>>
    {
        public async Task<Result<PagedResult<OrderDto>>> Handle(GetVendorOrdersQuery request, CancellationToken cancellationToken)
        {
            var userId = currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Error.Unauthorized("User.Unauthorized", "User is not authenticated.");
            }

            var restaurant = await context.Resturants
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.OwnerId == userId, cancellationToken);

            if (restaurant is null)
            {
                return Error.NotFound("Vendor.RestaurantNotFound", "No restaurant was found associated with your vendor account.");
            }

            var pageNumber = request.PageNumber > 0 ? request.PageNumber : 1;
            var pageSize = request.PageSize > 0 ? request.PageSize : 10;

            var query = context.Orders
                .AsNoTracking()
                .Where(o => o.ResturantId == restaurant.Id);

            var statusFilter = request.Status?.Trim().ToLowerInvariant();
            query = statusFilter switch
            {
                "pending" or "placed" => query.Where(o => o.Status == OrderStatus.Pending),
                "preparing" or "processing" or "confirmed" => query.Where(o => o.Status == OrderStatus.Processing),
                "active" => query.Where(o => o.Status == OrderStatus.Processing || o.Status == OrderStatus.Shipped),
                "outfordelivery" or "shipped" => query.Where(o => o.Status == OrderStatus.Shipped),
                "completed" or "delivered" => query.Where(o => o.Status == OrderStatus.Delivered),
                "cancelled" => query.Where(o => o.Status == OrderStatus.Cancelled),
                _ => query
            };

            var totalCount = await query.CountAsync(cancellationToken);

            var orders = await query
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                .OrderByDescending(o => o.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var orderDtos = orders.Select(o =>
            {
                var customerName = o.Customer != null
                    ? $"{o.Customer.FirstName} {o.Customer.LastName}".Trim()
                    : null;
                var customerPhone = o.Customer?.PhoneNumber;

                DeliveryLocationDto? deliveryLoc = null;
                if (o.Customer != null && (o.Customer.Latitude.HasValue || !string.IsNullOrWhiteSpace(o.ShippingAddress)))
                {
                    deliveryLoc = new DeliveryLocationDto(
                        o.Customer.Latitude,
                        o.Customer.Longitude,
                        !string.IsNullOrWhiteSpace(o.ShippingAddress)
                            ? o.ShippingAddress
                            : o.Customer.DeliveryAddressTitle
                    );
                }

                return new OrderDto(
                    o.Id,
                    o.OrderNumber,
                    o.CustomerId,
                    o.ResturantId,
                    restaurant.Name,
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
                    )).ToList(),
                    customerName,
                    customerPhone,
                    deliveryLoc
                );
            }).ToList();

            return new PagedResult<OrderDto>(orderDtos, totalCount, pageNumber, pageSize);
        }
    }
}

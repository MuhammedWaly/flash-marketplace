using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Vendor.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Order;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Vendor.Queries.GetVendorStats
{
    public class GetVendorStatsQueryHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<GetVendorStatsQuery, Result<VendorStatsDto>>
    {
        public async Task<Result<VendorStatsDto>> Handle(GetVendorStatsQuery request, CancellationToken cancellationToken)
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

            var merchant = await context.Merchants
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.UserId == userId, cancellationToken);

            var todayUtc = DateTime.UtcNow.Date;

            var ordersQuery = context.Orders
                .AsNoTracking()
                .Where(o => o.ResturantId == restaurant.Id);

            var todayOrdersCount = await ordersQuery
                .CountAsync(o => o.CreatedAt >= todayUtc, cancellationToken);

            var pendingOrdersCount = await ordersQuery
                .CountAsync(o => o.Status == OrderStatus.Pending, cancellationToken);

            var activeOrdersCount = await ordersQuery
                .CountAsync(o => o.Status == OrderStatus.Processing || o.Status == OrderStatus.Shipped, cancellationToken);

            var completedOrdersCount = await ordersQuery
                .CountAsync(o => o.Status == OrderStatus.Delivered, cancellationToken);

            var totalOrdersCount = await ordersQuery
                .CountAsync(cancellationToken);

            var totalRevenue = merchant?.Balance ?? 0m;

            return new VendorStatsDto(
                restaurant.Id,
                restaurant.Name,
                totalRevenue,
                todayOrdersCount,
                pendingOrdersCount,
                activeOrdersCount,
                restaurant.AverageRating,
                restaurant.ReviewCount,
                restaurant.IsOpen,
                completedOrdersCount,
                totalOrdersCount
            );
        }
    }
}

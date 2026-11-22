using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Order;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Orders.Commands.UpdateOrderStatus
{
    public class UpdateOrderStatusCommandHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService,
        IOrderNotificationService orderNotificationService) : IRequestHandler<UpdateOrderStatusCommand, Result<Updated>>
    {
        public async Task<Result<Updated>> Handle(UpdateOrderStatusCommand command, CancellationToken cancellationToken)
        {
            var order = await context.Orders
                .Include(o => o.Resturant)
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == command.OrderId, cancellationToken);

            if (order is null)
            {
                return OrderError.NotFound;
            }

            // Resource-Based Data Ownership check: Admin or Restaurant Owner
            if (order.Resturant is not null && !currentUserService.IsAdmin && order.Resturant.OwnerId != currentUserService.UserId)
            {
                return Error.Forbidden("Order.NotOwner", "You do not have permission to modify the status of this order.");
            }

            // Financial settlement upon delivery
            if (command.NewStatus == OrderStatus.Delivered && order.Status != OrderStatus.Delivered)
            {
                if (order.Resturant is not null)
                {
                    var merchant = await context.Merchants
                        .FirstOrDefaultAsync(m => m.UserId == order.Resturant.OwnerId, cancellationToken);

                    if (merchant is not null)
                    {
                        var merchantTotalEarnings = order.OrderItems.Sum(i => i.MerchantEarnings);
                        if (merchantTotalEarnings > 0)
                        {
                            merchant.AdjustBalance(merchantTotalEarnings);
                        }
                    }
                }
            }

            var updateResult = order.UpdateStatus(command.NewStatus);
            if (updateResult.IsError)
            {
                return updateResult.Errors;
            }

            await context.SaveChangesAsync(cancellationToken);

            // Broadcast real-time status update to the Customer via SignalR
            var customerUserId = await context.Customers
                .Where(c => c.Id == order.CustomerId)
                .Select(c => c.UserId)
                .FirstOrDefaultAsync(cancellationToken);

            await orderNotificationService.NotifyOrderStatusChangedAsync(
                order.Id,
                order.CustomerId,
                customerUserId,
                command.NewStatus,
                order.Resturant?.Name ?? "المطعم",
                cancellationToken
            );

            return Result.Updated;
        }
    }
}

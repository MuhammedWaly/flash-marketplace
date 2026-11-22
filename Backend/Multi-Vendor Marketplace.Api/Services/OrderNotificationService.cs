using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Multi_Vendor_Marketplace.Api.Hubs;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Orders.Dtos;
using Multi_Vendor_Marketplace.Domain.Order;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Api.Services
{
    public class OrderNotificationService(
        IHubContext<OrderHub, IOrderClient> hubContext,
        ILogger<OrderNotificationService> logger) : IOrderNotificationService
    {
        public async Task NotifyNewOrderAsync(Guid restaurantId, OrderDto order, CancellationToken cancellationToken = default)
        {
            try
            {
                var groupName = $"restaurant_{restaurantId}";
                logger.LogInformation("Broadcasting new order {OrderId} (#{OrderNumber}) to restaurant group {GroupName}", order.Id, order.OrderNumber, groupName);

                await hubContext.Clients.Group(groupName).OrderReceived(order);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to broadcast new order {OrderId} to restaurant {RestaurantId}", order.Id, restaurantId);
            }
        }

        public async Task NotifyOrderStatusChangedAsync(
            Guid orderId,
            Guid customerId,
            string? customerUserId,
            OrderStatus newStatus,
            string restaurantName,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var payload = new OrderStatusChangedPayload(
                    orderId,
                    newStatus.ToString(),
                    (int)newStatus,
                    restaurantName,
                    DateTime.UtcNow
                );

                logger.LogInformation("Broadcasting status update for order {OrderId} -> {NewStatus} to customer {CustomerId}", orderId, newStatus, customerId);

                // 1. Broadcast to order-specific listeners
                await hubContext.Clients.Group($"order_{orderId}").OrderStatusChanged(payload);

                // 2. Broadcast to customer group listeners
                await hubContext.Clients.Group($"customer_{customerId}").OrderStatusChanged(payload);

                // 3. Broadcast to customer User ID group if known
                if (!string.IsNullOrEmpty(customerUserId))
                {
                    await hubContext.Clients.Group($"user_{customerUserId}").OrderStatusChanged(payload);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to broadcast status update for order {OrderId}", orderId);
            }
        }
    }
}

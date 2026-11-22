using Multi_Vendor_Marketplace.Application.Features.Orders.Dtos;
using Multi_Vendor_Marketplace.Domain.Order;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Common.Interfaces
{
    public interface IOrderNotificationService
    {
        Task NotifyNewOrderAsync(Guid restaurantId, OrderDto order, CancellationToken cancellationToken = default);
        Task NotifyOrderStatusChangedAsync(Guid orderId, Guid customerId, string? customerUserId, OrderStatus newStatus, string restaurantName, CancellationToken cancellationToken = default);
    }
}

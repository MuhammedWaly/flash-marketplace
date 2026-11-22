using Multi_Vendor_Marketplace.Application.Features.Orders.Dtos;
using System;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Api.Hubs
{
    public interface IOrderClient
    {
        Task OrderReceived(OrderDto order);
        Task OrderStatusChanged(OrderStatusChangedPayload payload);
    }

    public record OrderStatusChangedPayload(
        Guid OrderId,
        string NewStatus,
        int StatusCode,
        string RestaurantName,
        DateTime UpdatedAt
    );
}

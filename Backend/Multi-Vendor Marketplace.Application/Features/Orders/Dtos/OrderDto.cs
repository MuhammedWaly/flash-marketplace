using System;
using System.Collections.Generic;

namespace Multi_Vendor_Marketplace.Application.Features.Orders.Dtos
{
    public record DeliveryLocationDto(
        double? Latitude,
        double? Longitude,
        string? AddressTitle
    );

    public record OrderDto(
        Guid Id,
        string OrderNumber,
        Guid CustomerId,
        Guid? ResturantId,
        string? ResturantName,
        string Status,
        string PaymentStatus,
        decimal SubTotal,
        decimal ShippingFee,
        decimal TotalAmount,
        string? ShippingAddress,
        string? PaymentMethod,
        DateTime CreatedAt,
        List<OrderItemDto> Items,
        string? CustomerName = null,
        string? CustomerPhone = null,
        DeliveryLocationDto? DeliveryLocation = null
    )
    {
        public Guid OrderId => Id;
    }

    public record OrderItemDto(
        Guid Id,
        Guid DishId,
        string ProductName,
        decimal UnitPrice,
        int Quantity,
        decimal TotalPrice
    );
}

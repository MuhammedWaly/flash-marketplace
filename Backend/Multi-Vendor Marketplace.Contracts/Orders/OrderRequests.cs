using System;
using System.Collections.Generic;

namespace Multi_Vendor_Marketplace.Contracts.Orders
{
    public record CheckoutRequest(
        string ShippingAddress,
        string? PaymentMethod = "CashOnDelivery"
    );

    public record UpdateOrderStatusRequest(
        int Status
    );

    public record UpdateOrderStatusByNameRequest(
        string Status
    );

    public record RateOrderRequest(
        int Rating,
        string? Comment
    );

    public record OrderResponse(
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
        List<OrderItemResponse> Items
    );

    public record OrderItemResponse(
        Guid Id,
        Guid DishId,
        string ProductName,
        decimal UnitPrice,
        int Quantity,
        decimal TotalPrice
    );
}

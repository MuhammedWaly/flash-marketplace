using System;

namespace Multi_Vendor_Marketplace.Application.Features.Payments.Dtos
{
    public record CheckoutSessionDto(
        string SessionId,
        string CheckoutUrl,
        Guid OrderId
    );

    public record PaymentStatusDto(
        Guid OrderId,
        string OrderNumber,
        string OrderStatus,
        string PaymentStatus,
        decimal Amount,
        string Currency,
        string? StripePaymentIntentId,
        string? FailureReason,
        DateTime CreatedAt,
        DateTime? UpdatedAt
    );
}

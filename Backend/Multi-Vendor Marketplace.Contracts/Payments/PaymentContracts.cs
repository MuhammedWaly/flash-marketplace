using System;

namespace Multi_Vendor_Marketplace.Contracts.Payments
{
    public record CreateCheckoutSessionRequest(
        Guid OrderId
    );

    public record CheckoutSessionResponse(
        string SessionId,
        string CheckoutUrl,
        Guid OrderId
    );

    public record PaymentStatusResponse(
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

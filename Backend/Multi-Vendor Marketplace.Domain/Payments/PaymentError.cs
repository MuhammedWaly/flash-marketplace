using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.Payments
{
    public static class PaymentError
    {
        public static readonly Error NotFound =
            Error.NotFound("Payment.NotFound", "Payment record was not found.");

        public static readonly Error AlreadyPaid =
            Error.Conflict("Payment.AlreadyPaid", "This order has already been paid.");

        public static readonly Error InvalidAmount =
            Error.Validation("Payment.InvalidAmount", "Payment amount must be greater than zero.");

        public static readonly Error SellerNotReady =
            Error.Conflict("Payment.SellerNotReady", "The seller has not completed Stripe onboarding and cannot receive payments yet.");

        public static readonly Error UnauthorizedCustomer =
            Error.Unauthorized("Payment.UnauthorizedCustomer", "You are not authorized to pay for this order.");

        public static readonly Error OrderNotEligible =
            Error.Conflict("Payment.OrderNotEligible", "Order is not in an eligible state for payment.");

        public static readonly Error WebhookSignatureInvalid =
            Error.Validation("Payment.WebhookSignatureInvalid", "Stripe webhook signature verification failed.");
    }
}

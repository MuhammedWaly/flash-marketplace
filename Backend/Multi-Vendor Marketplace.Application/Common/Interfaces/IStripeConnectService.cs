using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Common.Interfaces
{
    public record StripeAccountStatusDto(
        string AccountId,
        bool IsConnected,
        bool ChargesEnabled,
        bool PayoutsEnabled,
        bool DetailsSubmitted,
        string? RequirementsMessage
    );

    public record StripeCheckoutItem(
        string Name,
        decimal UnitPrice,
        int Quantity
    );

    public record CreateStripeCheckoutSessionParams(
        Guid OrderId,
        string OrderNumber,
        decimal TotalAmount,
        string Currency,
        decimal PlatformFee,
        string? DestinationStripeAccountId,
        string? CustomerEmail,
        List<StripeCheckoutItem> Items,
        string SuccessUrl,
        string CancelUrl
    );

    public record StripeCheckoutSessionResult(
        string SessionId,
        string CheckoutUrl,
        string? PaymentIntentId
    );

    public interface IStripeConnectService
    {
        bool AllowTestCheckoutWithoutSeller { get; }

        Task<string> CreateExpressConnectedAccountAsync(
            string email,
            string businessName,
            CancellationToken cancellationToken = default
        );

        Task<string> CreateAccountOnboardingLinkAsync(
            string stripeAccountId,
            string refreshUrl,
            string returnUrl,
            CancellationToken cancellationToken = default
        );

        Task<StripeAccountStatusDto> GetAccountStatusAsync(
            string stripeAccountId,
            CancellationToken cancellationToken = default
        );

        Task<StripeCheckoutSessionResult> CreateDestinationCheckoutSessionAsync(
            CreateStripeCheckoutSessionParams parameters,
            CancellationToken cancellationToken = default
        );

        StripeWebhookEventResult VerifyAndParseWebhookEvent(
            string json,
            string signatureHeader,
            string? webhookSecret = null
        );
    }

    public record StripeWebhookEventResult(
        string EventId,
        string EventType,
        string? SessionId,
        string? PaymentIntentId,
        Guid? OrderId,
        decimal? AmountTotal,
        string? Currency,
        string? FailureReason,
        bool IsPaymentSuccess,
        bool IsPaymentFailure,
        bool IsRefund
    );
}

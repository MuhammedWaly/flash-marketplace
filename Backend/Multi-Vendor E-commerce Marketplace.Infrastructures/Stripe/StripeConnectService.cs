using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Stripe;
using Stripe.Checkout;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Infrastructures.Stripe
{
    public class StripeConnectService : IStripeConnectService
    {
        private readonly StripeSettings _settings;
        private readonly ILogger<StripeConnectService> _logger;
        private readonly AccountService _accountService;
        private readonly AccountLinkService _accountLinkService;
        private readonly SessionService _sessionService;

        public StripeConnectService(
            IOptions<StripeSettings> settings,
            ILogger<StripeConnectService> logger)
        {
            _settings = settings.Value;
            _logger = logger;

            var client = new StripeClient(_settings.SecretKey);
            _accountService = new AccountService(client);
            _accountLinkService = new AccountLinkService(client);
            _sessionService = new SessionService(client);
        }

        public bool AllowTestCheckoutWithoutSeller => _settings.AllowTestCheckoutWithoutSeller;

        public async Task<string> CreateExpressConnectedAccountAsync(
            string email,
            string businessName,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var options = new AccountCreateOptions
                {
                    Type = "express",
                    Email = email,
                    BusinessProfile = new AccountBusinessProfileOptions
                    {
                        Name = businessName,
                    },
                    Capabilities = new AccountCapabilitiesOptions
                    {
                        CardPayments = new AccountCapabilitiesCardPaymentsOptions { Requested = true },
                        Transfers = new AccountCapabilitiesTransfersOptions { Requested = true },
                    }
                };

                var account = await _accountService.CreateAsync(options, cancellationToken: cancellationToken);
                _logger.LogInformation("Successfully created Stripe Express Account {AccountId} for {Email}", account.Id, email);
                return account.Id;
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Failed to create Stripe Express account for {Email}: {Message}", email, ex.Message);
                throw;
            }
        }

        public async Task<string> CreateAccountOnboardingLinkAsync(
            string stripeAccountId,
            string refreshUrl,
            string returnUrl,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var options = new AccountLinkCreateOptions
                {
                    Account = stripeAccountId,
                    RefreshUrl = refreshUrl,
                    ReturnUrl = returnUrl,
                    Type = "account_onboarding",
                };

                var link = await _accountLinkService.CreateAsync(options, cancellationToken: cancellationToken);
                return link.Url;
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Failed to create account onboarding link for {AccountId}: {Message}", stripeAccountId, ex.Message);
                throw;
            }
        }

        public async Task<StripeAccountStatusDto> GetAccountStatusAsync(
            string stripeAccountId,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var account = await _accountService.GetAsync(stripeAccountId, cancellationToken: cancellationToken);

                string? requirementsMessage = null;
                if (account.Requirements?.CurrentlyDue?.Count > 0)
                {
                    requirementsMessage = $"Pending requirements: {string.Join(", ", account.Requirements.CurrentlyDue)}";
                }

                return new StripeAccountStatusDto(
                    account.Id,
                    IsConnected: true,
                    ChargesEnabled: account.ChargesEnabled,
                    PayoutsEnabled: account.PayoutsEnabled,
                    DetailsSubmitted: account.DetailsSubmitted,
                    RequirementsMessage: requirementsMessage
                );
            }
            catch (StripeException ex)
            {
                _logger.LogWarning(ex, "Failed to retrieve Stripe account status for {AccountId}: {Message}", stripeAccountId, ex.Message);
                return new StripeAccountStatusDto(
                    stripeAccountId,
                    IsConnected: false,
                    ChargesEnabled: false,
                    PayoutsEnabled: false,
                    DetailsSubmitted: false,
                    RequirementsMessage: ex.Message
                );
            }
        }

        public async Task<StripeCheckoutSessionResult> CreateDestinationCheckoutSessionAsync(
            CreateStripeCheckoutSessionParams parameters,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var currency = string.IsNullOrWhiteSpace(parameters.Currency) ? _settings.Currency : parameters.Currency.ToLowerInvariant();
                long totalAmountInSmallestUnit = (long)Math.Round(parameters.TotalAmount * 100);
                long platformFeeInSmallestUnit = (long)Math.Round(parameters.PlatformFee * 100);

                // Build line items
                var lineItems = new List<SessionLineItemOptions>();
                foreach (var item in parameters.Items)
                {
                    lineItems.Add(new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = currency,
                            UnitAmount = (long)Math.Round(item.UnitPrice * 100),
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = item.Name,
                            },
                        },
                        Quantity = item.Quantity,
                    });
                }

                // Balance difference (e.g. delivery/shipping fee)
                long itemsSumInSmallestUnit = lineItems.Sum(li => li.PriceData.UnitAmount!.Value * li.Quantity!.Value);
                if (totalAmountInSmallestUnit > itemsSumInSmallestUnit)
                {
                    lineItems.Add(new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = currency,
                            UnitAmount = totalAmountInSmallestUnit - itemsSumInSmallestUnit,
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = "Delivery Fee / خدمة التوصيل",
                            },
                        },
                        Quantity = 1,
                    });
                }

                var paymentIntentData = new SessionPaymentIntentDataOptions
                {
                    Metadata = new Dictionary<string, string>
                    {
                        { "order_id", parameters.OrderId.ToString() },
                        { "order_number", parameters.OrderNumber }
                    }
                };

                if (!string.IsNullOrWhiteSpace(parameters.DestinationStripeAccountId))
                {
                    paymentIntentData.ApplicationFeeAmount = platformFeeInSmallestUnit;
                    paymentIntentData.TransferData = new SessionPaymentIntentDataTransferDataOptions
                    {
                        Destination = parameters.DestinationStripeAccountId,
                    };
                }

                var options = new SessionCreateOptions
                {
                    Mode = "payment",
                    CustomerEmail = parameters.CustomerEmail,
                    LineItems = lineItems,
                    PaymentIntentData = paymentIntentData,
                    Metadata = new Dictionary<string, string>
                    {
                        { "order_id", parameters.OrderId.ToString() },
                        { "order_number", parameters.OrderNumber }
                    },
                    SuccessUrl = parameters.SuccessUrl,
                    CancelUrl = parameters.CancelUrl,
                };

                var session = await _sessionService.CreateAsync(options, cancellationToken: cancellationToken);
                return new StripeCheckoutSessionResult(session.Id, session.Url, session.PaymentIntentId);
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Failed to create destination checkout session for Order {OrderId}: {Message}", parameters.OrderId, ex.Message);
                throw;
            }
        }

        public StripeWebhookEventResult VerifyAndParseWebhookEvent(
            string json,
            string signatureHeader,
            string? webhookSecret = null)
        {
            var secret = !string.IsNullOrWhiteSpace(webhookSecret) ? webhookSecret : _settings.WebhookSecret;

            Event stripeEvent;
            try
            {
                stripeEvent = EventUtility.ConstructEvent(json, signatureHeader, secret);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Stripe Webhook signature validation failed: {Message}", ex.Message);
                throw;
            }

            string? sessionId = null;
            string? paymentIntentId = null;
            Guid? orderId = null;
            decimal? amountTotal = null;
            string? currency = null;
            string? failureReason = null;
            bool isPaymentSuccess = false;
            bool isPaymentFailure = false;
            bool isRefund = false;

            if (stripeEvent.Data.Object is Session session)
            {
                sessionId = session.Id;
                paymentIntentId = session.PaymentIntentId;
                currency = session.Currency;
                if (session.AmountTotal.HasValue)
                {
                    amountTotal = session.AmountTotal.Value / 100m;
                }

                if (session.Metadata != null && session.Metadata.TryGetValue("order_id", out var orderIdStr) && Guid.TryParse(orderIdStr, out var parsedId))
                {
                    orderId = parsedId;
                }

                if (stripeEvent.Type == EventTypes.CheckoutSessionCompleted ||
                    stripeEvent.Type == EventTypes.CheckoutSessionAsyncPaymentSucceeded)
                {
                    isPaymentSuccess = true;
                }
                else if (stripeEvent.Type == EventTypes.CheckoutSessionAsyncPaymentFailed ||
                         stripeEvent.Type == EventTypes.CheckoutSessionExpired)
                {
                    isPaymentFailure = true;
                    failureReason = $"Checkout session ended with status: {session.Status}";
                }
            }
            else if (stripeEvent.Data.Object is PaymentIntent paymentIntent)
            {
                paymentIntentId = paymentIntent.Id;
                currency = paymentIntent.Currency;
                amountTotal = paymentIntent.Amount / 100m;

                if (paymentIntent.Metadata != null && paymentIntent.Metadata.TryGetValue("order_id", out var orderIdStr) && Guid.TryParse(orderIdStr, out var parsedId))
                {
                    orderId = parsedId;
                }

                if (stripeEvent.Type == EventTypes.PaymentIntentSucceeded)
                {
                    isPaymentSuccess = true;
                }
                else if (stripeEvent.Type == EventTypes.PaymentIntentPaymentFailed)
                {
                    isPaymentFailure = true;
                    failureReason = paymentIntent.LastPaymentError?.Message ?? "Payment failed.";
                }
            }
            else if (stripeEvent.Data.Object is Charge charge)
            {
                paymentIntentId = charge.PaymentIntentId;
                currency = charge.Currency;
                amountTotal = charge.Amount / 100m;

                if (charge.Metadata != null && charge.Metadata.TryGetValue("order_id", out var orderIdStr) && Guid.TryParse(orderIdStr, out var parsedId))
                {
                    orderId = parsedId;
                }

                if (stripeEvent.Type == EventTypes.ChargeRefunded)
                {
                    isRefund = true;
                }
                else if (stripeEvent.Type == EventTypes.ChargeFailed)
                {
                    isPaymentFailure = true;
                    failureReason = charge.FailureMessage ?? "Charge failed.";
                }
            }

            return new StripeWebhookEventResult(
                stripeEvent.Id,
                stripeEvent.Type,
                sessionId,
                paymentIntentId,
                orderId,
                amountTotal,
                currency,
                failureReason,
                isPaymentSuccess,
                isPaymentFailure,
                isRefund
            );
        }
    }
}

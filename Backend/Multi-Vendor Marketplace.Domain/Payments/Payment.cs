using System;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.Payments
{
    public class Payment : AuditableEntity
    {
        public Guid OrderId { get; private set; }
        public Order.Order? Order { get; private set; }

        public Guid CustomerId { get; private set; }
        public Customer.Customer? Customer { get; private set; }

        public Guid MerchantId { get; private set; }
        public Merchant.Merchant? Merchant { get; private set; }

        public string? StripeCheckoutSessionId { get; private set; }
        public string? StripePaymentIntentId { get; private set; }

        public decimal Amount { get; private set; }
        public string Currency { get; private set; } = "egp";
        public decimal PlatformFee { get; private set; }
        public decimal MerchantEarnings { get; private set; }

        public PaymentRecordStatus Status { get; private set; } = PaymentRecordStatus.Pending;
        public string? FailureReason { get; private set; }

        private Payment()
        {
        }

        private Payment(
            Guid id,
            Guid orderId,
            Guid customerId,
            Guid merchantId,
            decimal amount,
            string currency,
            decimal platformFee,
            decimal merchantEarnings,
            string? stripeCheckoutSessionId = null)
            : base(id)
        {
            OrderId = orderId;
            CustomerId = customerId;
            MerchantId = merchantId;
            Amount = amount;
            Currency = currency.ToLowerInvariant();
            PlatformFee = platformFee;
            MerchantEarnings = merchantEarnings;
            StripeCheckoutSessionId = stripeCheckoutSessionId;
            Status = PaymentRecordStatus.Pending;
        }

        public static Result<Payment> Create(
            Guid id,
            Guid orderId,
            Guid customerId,
            Guid merchantId,
            decimal amount,
            string currency,
            decimal platformFee,
            decimal merchantEarnings,
            string? stripeCheckoutSessionId = null)
        {
            if (orderId == Guid.Empty)
            {
                return Error.Validation("Payment.OrderIdRequired", "Order ID is required.");
            }

            if (customerId == Guid.Empty)
            {
                return Error.Validation("Payment.CustomerIdRequired", "Customer ID is required.");
            }

            if (merchantId == Guid.Empty)
            {
                return Error.Validation("Payment.MerchantIdRequired", "Merchant ID is required.");
            }

            if (amount <= 0)
            {
                return PaymentError.InvalidAmount;
            }

            return new Payment(
                id,
                orderId,
                customerId,
                merchantId,
                amount,
                string.IsNullOrWhiteSpace(currency) ? "egp" : currency.Trim(),
                platformFee,
                merchantEarnings,
                stripeCheckoutSessionId?.Trim()
            );
        }

        public void SetCheckoutSession(string checkoutSessionId)
        {
            StripeCheckoutSessionId = checkoutSessionId?.Trim();
            UpdatedAt = DateTime.UtcNow;
        }

        public void MarkAsSucceeded(string? paymentIntentId = null)
        {
            Status = PaymentRecordStatus.Succeeded;
            if (!string.IsNullOrWhiteSpace(paymentIntentId))
            {
                StripePaymentIntentId = paymentIntentId.Trim();
            }
            FailureReason = null;
            UpdatedAt = DateTime.UtcNow;
        }

        public void MarkAsFailed(string failureReason, string? paymentIntentId = null)
        {
            Status = PaymentRecordStatus.Failed;
            FailureReason = failureReason;
            if (!string.IsNullOrWhiteSpace(paymentIntentId))
            {
                StripePaymentIntentId = paymentIntentId.Trim();
            }
            UpdatedAt = DateTime.UtcNow;
        }

        public void MarkAsCancelled()
        {
            Status = PaymentRecordStatus.Cancelled;
            UpdatedAt = DateTime.UtcNow;
        }

        public void MarkAsRefunded()
        {
            Status = PaymentRecordStatus.Refunded;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}

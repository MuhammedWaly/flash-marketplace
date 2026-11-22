namespace Multi_Vendor_Marketplace.Infrastructures.Stripe
{
    public class StripeSettings
    {
        public const string SectionName = "Stripe";

        public string PublishableKey { get; set; } = string.Empty;
        public string SecretKey { get; set; } = string.Empty;
        public string WebhookSecret { get; set; } = string.Empty;
        public string Currency { get; set; } = "egp";
        public bool AllowTestCheckoutWithoutSeller { get; set; } = false;
        public string SuccessUrl { get; set; } = "http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}";
        public string CancelUrl { get; set; } = "http://localhost:5173/payment/cancel";
        public string ConnectRefreshUrl { get; set; } = "http://localhost:5173/vendor/stripe/refresh";
        public string ConnectReturnUrl { get; set; } = "http://localhost:5173/vendor/stripe/return";
    }
}

namespace Multi_Vendor_Marketplace.Contracts.Vendor
{
    public record StripeOnboardingResponse(
        string OnboardingUrl,
        string AccountId
    );

    public record SellerStripeStatusResponse(
        string? AccountId,
        bool IsConnected,
        bool ChargesEnabled,
        bool PayoutsEnabled,
        bool DetailsSubmitted,
        string? Requirements
    );
}

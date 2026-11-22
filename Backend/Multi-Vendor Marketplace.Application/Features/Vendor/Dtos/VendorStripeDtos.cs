namespace Multi_Vendor_Marketplace.Application.Features.Vendor.Dtos
{
    public record StripeOnboardingDto(
        string OnboardingUrl,
        string AccountId
    );

    public record SellerStripeStatusDto(
        string? AccountId,
        bool IsConnected,
        bool ChargesEnabled,
        bool PayoutsEnabled,
        bool DetailsSubmitted,
        string? Requirements
    );
}

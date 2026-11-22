namespace Multi_Vendor_Marketplace.Contracts.Vendor
{
    public record UpdateVendorSettingsRequest(
        bool IsOpen,
        decimal MinOrderValue,
        double? DeliveryRadiusKm,
        double? Latitude,
        double? Longitude,
        string? AddressTitle,
        string? LogoUrl = null,
        string? CoverImageUrl = null,
        string? Name = null
    );
}

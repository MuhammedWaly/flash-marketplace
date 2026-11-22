namespace Multi_Vendor_Marketplace.Application.Features.Locations.Dtos
{
    public record CustomerLocationDto(
        bool IsConfigured,
        double? Latitude,
        double? Longitude,
        string? AddressTitle
    );
}

using System;

namespace Multi_Vendor_Marketplace.Application.Features.Locations.Dtos
{
    public record RestaurantLocationDto(
        Guid RestaurantId,
        string RestaurantName,
        bool IsConfigured,
        double? Latitude,
        double? Longitude,
        string? AddressTitle,
        double DeliveryRadiusKm
    );
}

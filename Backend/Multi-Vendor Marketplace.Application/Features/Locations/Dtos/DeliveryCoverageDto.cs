namespace Multi_Vendor_Marketplace.Application.Features.Locations.Dtos
{
    public record DeliveryCoverageDto(
        bool CanDeliver,
        bool RequiresCustomerLocation,
        bool RequiresRestaurantLocation,
        double? DistanceKm,
        double? DeliveryRadiusKm,
        decimal? EstimatedDeliveryFee,
        string? CustomerAddressTitle,
        string? RestaurantAddressTitle,
        string Message
    );
}

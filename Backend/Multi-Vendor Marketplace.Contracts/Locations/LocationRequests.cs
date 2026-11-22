namespace Multi_Vendor_Marketplace.Contracts.Locations
{
    public record SetCustomerLocationRequest(
        double Latitude,
        double Longitude,
        string? AddressTitle
    );

    public record SetRestaurantLocationRequest(
        double Latitude,
        double Longitude,
        string? AddressTitle,
        double DeliveryRadiusKm = 10.0
    );
}

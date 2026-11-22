using System;

namespace Multi_Vendor_Marketplace.Application.Features.Vendor.Dtos
{
    public record VendorStatsDto(
        Guid RestaurantId,
        string RestaurantName,
        decimal TotalRevenue,
        int TodayOrdersCount,
        int PendingOrdersCount,
        int ActiveOrdersCount,
        decimal AverageRating,
        int ReviewCount,
        bool IsOpen,
        int CompletedOrdersCount = 0,
        int TotalOrdersCount = 0
    );

    public record VendorSettingsDto(
        Guid RestaurantId,
        string Name,
        bool IsOpen,
        decimal MinOrderValue,
        double DeliveryRadiusKm,
        double? Latitude,
        double? Longitude,
        string? AddressTitle,
        string? LogoUrl = null,
        string? CoverImageUrl = null
    );
}

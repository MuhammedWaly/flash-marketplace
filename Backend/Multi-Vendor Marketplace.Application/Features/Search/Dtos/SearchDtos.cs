using Multi_Vendor_Marketplace.Application.Common.Models;
using System;
using System.Collections.Generic;

namespace Multi_Vendor_Marketplace.Application.Features.Search.Dtos
{
    public record GlobalSearchResultDto(
        string? SearchQuery,
        bool HasCustomerLocation,
        PagedResult<RestaurantSearchResultDto> Restaurants,
        PagedResult<DishSearchResultDto> Dishes
    );

    public record RestaurantSearchResultDto(
        Guid Id,
        string Name,
        string Description,
        string Category,
        string? LogoUrl,
        string? CoverImageUrl,
        decimal AverageRating,
        int ReviewCount,
        bool HasLocation,
        double? DistanceKm,
        double DeliveryRadiusKm,
        bool CanDeliver,
        decimal? EstimatedDeliveryFee,
        string DeliveryStatusMessage,
        int? DeliveryTimeMinutes = null
    )
    {
        public decimal Rating => AverageRating;
        public int ReviewsCount => ReviewCount;
        public decimal DeliveryFee => EstimatedDeliveryFee ?? 20.00m;
        public bool IsDeliverable => CanDeliver;
    }

    public record DishSearchResultDto(
        Guid Id,
        string Name,
        string Description,
        decimal Price,
        Guid RestaurantId,
        string RestaurantName,
        decimal RestaurantRating,
        bool RestaurantCanDeliver,
        double? RestaurantDistanceKm,
        string? ImageUrl = null
    );
}

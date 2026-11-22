using System;
using System.Collections.Generic;

namespace Multi_Vendor_Marketplace.Application.Features.Resturants.Dtos
{
    public class ResturantDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
        public string Category { get; set; } = default!;
        public string? LogoUrl { get; set; } 
        public string? CoverImageUrl { get; set; } 
        public string? PhoneNumber { get; set; } 
        public string OwnerId { get; set; } = default!;
        public List<DishDto>? Dishes { get; set; }

        public decimal? Rating { get; set; }
        public decimal? AverageRating => Rating;

        public int ReviewsCount { get; set; }
        public int ReviewCount => ReviewsCount;

        public decimal DeliveryFee { get; set; }
        public int? DeliveryTimeMinutes { get; set; }
        public double? DistanceKm { get; set; }
        public bool IsDeliverable { get; set; } = true;

        public bool HasLocation { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? AddressTitle { get; set; }
        public double DeliveryRadiusKm { get; set; }
        public bool IsOpen { get; set; } = true;
        public decimal MinOrderValue { get; set; }
        public bool HasStripeEnabled { get; set; }
    }
}

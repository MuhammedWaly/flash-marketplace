using Multi_Vendor_Marketplace.Application.Common.Utilities;
using Multi_Vendor_Marketplace.Application.Features.Resturants.Dtos;
using Multi_Vendor_Marketplace.Domain.Dishes;
using Multi_Vendor_Marketplace.Domain.Resturants;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Multi_Vendor_Marketplace.Application.Features.Resturants.Mappers
{
    public static class ResturantMapper
    {
        public static ResturantDto ToDto(this Resturant resturant, double? userLat = null, double? userLng = null)
        {
            double? distanceKm = null;
            bool isDeliverable = true;
            decimal deliveryFee = 20.00m;
            int? deliveryTimeMinutes = 25;

            if (userLat.HasValue && userLng.HasValue && resturant.HasLocation)
            {
                distanceKm = GeoDistanceCalculator.CalculateDistanceKm(
                    userLat.Value,
                    userLng.Value,
                    resturant.Latitude!.Value,
                    resturant.Longitude!.Value);

                isDeliverable = distanceKm.Value <= resturant.DeliveryRadiusKm;
                deliveryFee = GeoDistanceCalculator.CalculateDeliveryFee(distanceKm.Value);
                deliveryTimeMinutes = 15 + (int)Math.Ceiling(distanceKm.Value * 3);
            }

            return new ResturantDto
            {
                Id = resturant.Id,
                Name = resturant.Name,
                Description = resturant.Description,
                Category = resturant.category,
                LogoUrl = resturant.LogoUrl,
                CoverImageUrl = resturant.CoverImageUrl,
                PhoneNumber = resturant.PhoneNumber,
                OwnerId = resturant.OwnerId,
                Dishes = resturant.Dishes?.ToDto(),
                Rating = resturant.AverageRating,
                ReviewsCount = resturant.ReviewCount,
                DeliveryFee = deliveryFee,
                DeliveryTimeMinutes = deliveryTimeMinutes,
                DistanceKm = distanceKm,
                IsDeliverable = isDeliverable,
                HasLocation = resturant.HasLocation,
                Latitude = resturant.Latitude,
                Longitude = resturant.Longitude,
                AddressTitle = resturant.AddressTitle,
                DeliveryRadiusKm = resturant.DeliveryRadiusKm,
                IsOpen = resturant.IsOpen,
                MinOrderValue = resturant.MinOrderValue
            };
        }

        public static List<ResturantDto> ToDto(this IEnumerable<Resturant> resturants, double? userLat = null, double? userLng = null)
        {
            return resturants.Select(r => r.ToDto(userLat, userLng)).ToList();
        }

        public static List<DishDto> ToDto(this IEnumerable<Dish> dishes)
        {
            var dishDtos = new List<DishDto>();
            foreach (var dish in dishes)
            {
                dishDtos.Add(new DishDto
                {
                    Id = dish.Id,
                    Name = dish.Name,
                    Description = dish.description,
                    Price = dish.Price,
                    ImageUrl = dish.ImageUrl
                });
            }
            return dishDtos;
        }
    }
}

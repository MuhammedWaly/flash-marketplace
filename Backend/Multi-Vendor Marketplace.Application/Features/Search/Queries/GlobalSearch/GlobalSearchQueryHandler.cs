using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Common.Models;
using Multi_Vendor_Marketplace.Application.Common.Utilities;
using Multi_Vendor_Marketplace.Application.Features.Search.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Search.Queries.GlobalSearch
{
    public class GlobalSearchQueryHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<GlobalSearchQuery, Result<GlobalSearchResultDto>>
    {
        public async Task<Result<GlobalSearchResultDto>> Handle(GlobalSearchQuery request, CancellationToken cancellationToken)
        {
            var term = request.Query?.Trim().ToLowerInvariant() ?? string.Empty;

            // 1. Fetch current customer location from request or authenticated profile
            var userId = currentUserService.UserId;
            var customer = !string.IsNullOrWhiteSpace(userId)
                ? await context.Customers.AsNoTracking().FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken)
                : null;

            bool hasLocation = false;
            double custLat = 0;
            double custLng = 0;

            if (request.UserLat.HasValue && request.UserLng.HasValue)
            {
                hasLocation = true;
                custLat = request.UserLat.Value;
                custLng = request.UserLng.Value;
            }
            else if (customer?.HasDeliveryLocation == true)
            {
                hasLocation = true;
                custLat = customer.Latitude!.Value;
                custLng = customer.Longitude!.Value;
            }

            // 2. Query Restaurants with Filters (only approved merchants)
            var activeMerchants = context.Merchants.Where(m => m.IsApproved);
            var restQuery = context.Resturants
                .AsNoTracking()
                .Where(r => !string.IsNullOrWhiteSpace(r.category) && r.category.ToLower() != "string" && activeMerchants.Any(m => m.UserId == r.OwnerId))
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(term))
            {
                restQuery = restQuery.Where(r =>
                    r.Name.ToLower().Contains(term) ||
                    r.Description.ToLower().Contains(term) ||
                    r.category.ToLower().Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(request.Category))
            {
                var catFilter = request.Category.Trim().ToLowerInvariant();
                restQuery = restQuery.Where(r => r.category.ToLower() == catFilter);
            }

            if (request.MinRating.HasValue)
            {
                restQuery = restQuery.Where(r => r.AverageRating >= request.MinRating.Value);
            }

            var restaurants = await restQuery.ToListAsync(cancellationToken);

            // 3. Compute Distance, Delivery Eligibility, and Messages
            var restaurantDtos = restaurants.Select(r =>
            {
                double? distance = null;
                bool canDeliver = false;
                decimal? fee = null;

                if (hasLocation && r.HasLocation)
                {
                    distance = GeoDistanceCalculator.CalculateDistanceKm(custLat, custLng, r.Latitude!.Value, r.Longitude!.Value);
                    canDeliver = distance <= r.DeliveryRadiusKm;
                    fee = GeoDistanceCalculator.CalculateDeliveryFee(distance.Value);
                }

                var statusMsg = !hasLocation
                    ? "حدد موقعك لمعرفة إمكانية التوصيل"
                    : (canDeliver ? $"يوصل إليك ({distance:F1} كم)" : $"خارج نطاق التوصيل ({distance:F1} كم)");

                int? deliveryTimeMinutes = distance.HasValue
                    ? 15 + (int)Math.Ceiling(distance.Value * 3)
                    : 25;

                return new RestaurantSearchResultDto(
                    r.Id,
                    r.Name,
                    r.Description,
                    r.category,
                    r.LogoUrl,
                    r.CoverImageUrl,
                    r.AverageRating,
                    r.ReviewCount,
                    r.HasLocation,
                    distance,
                    r.DeliveryRadiusKm,
                    canDeliver,
                    fee,
                    statusMsg,
                    deliveryTimeMinutes
                );
            }).ToList();

            // Filter out non-deliverable if explicitly requested
            if (request.OnlyDeliverable == true && hasLocation)
            {
                restaurantDtos = restaurantDtos.Where(r => r.CanDeliver).ToList();
            }

            // 4. Apply Sorting
            restaurantDtos = (request.SortBy?.ToLowerInvariant()) switch
            {
                "rating" => restaurantDtos.OrderByDescending(r => r.AverageRating).ThenBy(r => r.Name).ToList(),
                "nearest" when hasLocation => restaurantDtos.OrderBy(r => r.DistanceKm ?? double.MaxValue).ThenByDescending(r => r.AverageRating).ToList(),
                "name" => restaurantDtos.OrderBy(r => r.Name).ToList(),
                _ => hasLocation
                    ? restaurantDtos.OrderBy(r => r.DistanceKm ?? double.MaxValue).ThenByDescending(r => r.AverageRating).ToList()
                    : restaurantDtos.OrderByDescending(r => r.AverageRating).ToList()
            };

            var totalRestaurantsCount = restaurantDtos.Count;
            var pageNumber = request.PageNumber > 0 ? request.PageNumber : 1;
            var pageSize = request.PageSize > 0 ? request.PageSize : 10;
            var pagedRestaurants = restaurantDtos.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

            // 5. Query Dishes with Filters
            var dishQuery = context.Dishes
                .AsNoTracking()
                .Include(d => d.Resturant)
                .Where(d => d.Resturant != null && !string.IsNullOrWhiteSpace(d.Resturant.category) && d.Resturant.category.ToLower() != "string" && activeMerchants.Any(m => m.UserId == d.Resturant.OwnerId))
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(term))
            {
                dishQuery = dishQuery.Where(d =>
                    d.Name.ToLower().Contains(term) ||
                    d.description.ToLower().Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(request.Category))
            {
                var catFilter = request.Category.Trim().ToLowerInvariant();
                dishQuery = dishQuery.Where(d => d.Resturant.category.ToLower() == catFilter);
            }

            if (request.MinPrice.HasValue)
            {
                dishQuery = dishQuery.Where(d => d.Price >= request.MinPrice.Value);
            }

            if (request.MaxPrice.HasValue)
            {
                dishQuery = dishQuery.Where(d => d.Price <= request.MaxPrice.Value);
            }

            var dishes = await dishQuery.Take(30).ToListAsync(cancellationToken);

            var dishDtos = dishes.Select(d =>
            {
                double? distance = null;
                bool canDeliver = false;

                if (hasLocation && d.Resturant?.HasLocation == true)
                {
                    distance = GeoDistanceCalculator.CalculateDistanceKm(custLat, custLng, d.Resturant.Latitude!.Value, d.Resturant.Longitude!.Value);
                    canDeliver = distance <= d.Resturant.DeliveryRadiusKm;
                }

                return new DishSearchResultDto(
                    d.Id,
                    d.Name,
                    d.description,
                    d.Price,
                    d.ResturantId,
                    d.Resturant?.Name ?? string.Empty,
                    d.Resturant?.AverageRating ?? 0,
                    canDeliver,
                    distance,
                    d.ImageUrl
                );
            }).ToList();

            // Apply dish sorting if requested
            dishDtos = (request.SortBy?.ToLowerInvariant()) switch
            {
                "price_asc" => dishDtos.OrderBy(d => d.Price).ToList(),
                "price_desc" => dishDtos.OrderByDescending(d => d.Price).ToList(),
                "rating" => dishDtos.OrderByDescending(d => d.RestaurantRating).ToList(),
                "nearest" when hasLocation => dishDtos.OrderBy(d => d.RestaurantDistanceKm ?? double.MaxValue).ToList(),
                _ => dishDtos.OrderBy(d => d.Name).ToList()
            };

            var totalDishesCount = dishDtos.Count;
            var pagedDishes = dishDtos.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

            var restaurantsPagedResult = new PagedResult<RestaurantSearchResultDto>(
                pagedRestaurants,
                totalRestaurantsCount,
                pageNumber,
                pageSize
            );

            var dishesPagedResult = new PagedResult<DishSearchResultDto>(
                pagedDishes,
                totalDishesCount,
                pageNumber,
                pageSize
            );

            return new GlobalSearchResultDto(
                request.Query,
                hasLocation,
                restaurantsPagedResult,
                dishesPagedResult
            );
        }
    }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Common.Models;
using Multi_Vendor_Marketplace.Application.Features.Resturants.Dtos;
using Multi_Vendor_Marketplace.Application.Features.Resturants.Mappers;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Resturants.Quries.GetResturants
{
    public class GetResturantsHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<GetResturantsQuery, Result<PagedResult<ResturantDto>>>
    {
        private readonly IAppDbContext _context = context;
        private readonly ICurrentUserService _currentUserService = currentUserService;

        public async Task<Result<PagedResult<ResturantDto>>> Handle(GetResturantsQuery query, CancellationToken cancellationToken)
        {
            var pageNumber = query.PageNumber > 0 ? query.PageNumber : 1;
            var pageSize = query.PageSize > 0 ? query.PageSize : 10;

            double? custLat = query.UserLat;
            double? custLng = query.UserLng;

            if (!custLat.HasValue && !string.IsNullOrWhiteSpace(_currentUserService.UserId))
            {
                var customer = await _context.Customers
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.UserId == _currentUserService.UserId, cancellationToken);

                if (customer != null && customer.Latitude.HasValue && customer.Longitude.HasValue)
                {
                    custLat = customer.Latitude.Value;
                    custLng = customer.Longitude.Value;
                }
            }

            var activeMerchants = _context.Merchants.Where(m => m.IsApproved);

            var queryable = _context.Resturants
                .AsNoTracking()
                .Where(r => !string.IsNullOrWhiteSpace(r.category) && r.category.ToLower() != "string" && activeMerchants.Any(m => m.UserId == r.OwnerId))
                .Include(r => r.Dishes)
                .AsQueryable();
             
            if (!string.IsNullOrWhiteSpace(query.Category))
            {
                var catFilter = query.Category.Trim().ToLower();
                queryable = queryable.Where(r => r.category.ToLower() == catFilter);
            }

            bool hasLocation = custLat.HasValue && custLng.HasValue;

            int totalCount;
            List<ResturantDto> pagedDtos;

            if (hasLocation)
            {
                // When location is available, load matching restaurants to compute distance accurately and sort before pagination
                var allRestaurants = await queryable.ToListAsync(cancellationToken);
                var dtos = allRestaurants.ToDto(custLat, custLng);

                // Filter by deliverability if requested
                if (query.OnlyDeliverable == true)
                {
                    dtos = dtos.Where(d => d.IsDeliverable).ToList();
                }

                // Apply sorting: nearest first by default when location is provided
                var sortBy = query.SortBy?.Trim().ToLowerInvariant();
                dtos = sortBy switch
                {
                    "rating" => dtos.OrderByDescending(d => d.Rating)
                                    .ThenBy(d => d.DistanceKm ?? double.MaxValue)
                                    .ToList(),
                    "name" => dtos.OrderBy(d => d.Name).ToList(),
                    _ => dtos.OrderBy(d => d.DistanceKm ?? double.MaxValue)
                             .ThenByDescending(d => d.Rating)
                             .ToList()
                };

                totalCount = dtos.Count;
                pagedDtos = dtos
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();
            }
            else
            {
                // When no location is provided, order by rating and paginate in DB
                totalCount = await queryable.CountAsync(cancellationToken);

                var resturants = await queryable
                    .OrderByDescending(r => r.AverageRating)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync(cancellationToken);

                pagedDtos = resturants.ToDto(null, null);
            }

            // Populate Stripe enabled status for the paged restaurants
            var ownerIds = pagedDtos.Select(r => r.OwnerId).Distinct().ToList();
            var enabledOwners = await _context.Merchants
                .AsNoTracking()
                .Where(m => ownerIds.Contains(m.UserId) && !string.IsNullOrWhiteSpace(m.StripeAccountId) && m.IsStripeChargesEnabled)
                .Select(m => m.UserId)
                .ToListAsync(cancellationToken);

            foreach (var dto in pagedDtos)
            {
                dto.HasStripeEnabled = enabledOwners.Contains(dto.OwnerId);
            }

            return new PagedResult<ResturantDto>(pagedDtos, totalCount, pageNumber, pageSize);
        }
    }
}

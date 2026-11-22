using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Common.Models;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Admin.Merchants.Queries.GetAdminMerchants
{
    public class GetAdminMerchantsQueryHandler(IAppDbContext context)
        : IRequestHandler<GetAdminMerchantsQuery, Result<PagedResult<AdminMerchantDto>>>
    {
        public async Task<Result<PagedResult<AdminMerchantDto>>> Handle(
            GetAdminMerchantsQuery request,
            CancellationToken cancellationToken)
        {
            var pageNumber = request.PageNumber > 0 ? request.PageNumber : 1;
            var pageSize = request.PageSize > 0 ? request.PageSize : 10;

            var merchantsQuery = context.Merchants.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                var status = request.Status.Trim().ToLowerInvariant();
                merchantsQuery = status switch
                {
                    "pending" => merchantsQuery.Where(m => !m.IsApproved),
                    "approved" => merchantsQuery.Where(m => m.IsApproved && m.IsActive),
                    "suspended" => merchantsQuery.Where(m => m.IsApproved && !m.IsActive),
                    _ => merchantsQuery
                };
            }

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.Trim().ToLower();
                merchantsQuery = merchantsQuery.Where(m =>
                    m.StoreName.ToLower().Contains(search) ||
                    m.OwnerName.ToLower().Contains(search) ||
                    m.Email.ToLower().Contains(search) ||
                    m.PhoneNumber.Contains(search));
            }

            var totalCount = await merchantsQuery.CountAsync(cancellationToken);

            var pagedMerchants = await merchantsQuery
                .OrderBy(m => m.IsApproved ? 1 : 0) // Pending (false) first
                .ThenByDescending(m => m.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var userIds = pagedMerchants.Select(m => m.UserId).Distinct().ToList();

            var restaurants = await context.Resturants
                .AsNoTracking()
                .Include(r => r.Dishes)
                .Where(r => userIds.Contains(r.OwnerId))
                .ToListAsync(cancellationToken);

            var restaurantMap = restaurants.ToDictionary(r => r.OwnerId, r => r);

            var items = pagedMerchants.Select(m =>
            {
                restaurantMap.TryGetValue(m.UserId, out var rest);

                return new AdminMerchantDto
                {
                    Id = m.Id,
                    StoreName = m.StoreName,
                    OwnerName = m.OwnerName,
                    Email = m.Email,
                    PhoneNumber = m.PhoneNumber,
                    Description = m.Description,
                    LogoUrl = m.LogoUrl,
                    Balance = m.Balance,
                    CommissionRate = m.CommissionRate,
                    IsApproved = m.IsApproved,
                    IsActive = m.IsActive,
                    UserId = m.UserId,
                    CreatedAt = m.CreatedAt,

                    RestaurantId = rest?.Id,
                    RestaurantName = rest?.Name,
                    Category = rest?.category,
                    CoverImageUrl = rest?.CoverImageUrl,
                    AddressTitle = rest?.AddressTitle,
                    Latitude = rest?.Latitude,
                    Longitude = rest?.Longitude,
                    DeliveryRadiusKm = rest?.DeliveryRadiusKm ?? 10.0,
                    MinOrderValue = rest?.MinOrderValue ?? 0.0m,
                    IsOpen = rest?.IsOpen ?? false,
                    DishesCount = rest?.Dishes?.Count() ?? 0,
                    Rating = rest?.AverageRating ?? 0.0m
                };
            }).ToList();

            return PagedResult<AdminMerchantDto>.Create(items, totalCount, pageNumber, pageSize);
        }
    }
}

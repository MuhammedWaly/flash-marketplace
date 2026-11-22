using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Vendor.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Vendor.Queries.GetVendorSettings
{
    public class GetVendorSettingsQueryHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<GetVendorSettingsQuery, Result<VendorSettingsDto>>
    {
        public async Task<Result<VendorSettingsDto>> Handle(GetVendorSettingsQuery request, CancellationToken cancellationToken)
        {
            var userId = currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Error.Unauthorized("User.Unauthorized", "User is not authenticated.");
            }

            var restaurant = await context.Resturants
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.OwnerId == userId, cancellationToken);

            if (restaurant is null)
            {
                return Error.NotFound("Vendor.RestaurantNotFound", "No restaurant was found associated with your vendor account.");
            }

            return new VendorSettingsDto(
                restaurant.Id,
                restaurant.Name,
                restaurant.IsOpen,
                restaurant.MinOrderValue,
                restaurant.DeliveryRadiusKm,
                restaurant.Latitude,
                restaurant.Longitude,
                restaurant.AddressTitle,
                restaurant.LogoUrl,
                restaurant.CoverImageUrl
            );
        }
    }
}

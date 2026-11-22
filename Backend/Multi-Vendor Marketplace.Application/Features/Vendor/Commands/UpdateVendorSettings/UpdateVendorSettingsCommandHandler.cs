using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Vendor.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Vendor.Commands.UpdateVendorSettings
{
    public class UpdateVendorSettingsCommandHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<UpdateVendorSettingsCommand, Result<VendorSettingsDto>>
    {
        public async Task<Result<VendorSettingsDto>> Handle(UpdateVendorSettingsCommand command, CancellationToken cancellationToken)
        {
            var userId = currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Error.Unauthorized("User.Unauthorized", "User is not authenticated.");
            }

            var restaurant = await context.Resturants
                .FirstOrDefaultAsync(r => r.OwnerId == userId, cancellationToken);

            if (restaurant is null)
            {
                return Error.NotFound("Vendor.RestaurantNotFound", "No restaurant was found associated with your vendor account.");
            }

            restaurant.SetOperatingSettings(command.IsOpen, command.MinOrderValue, command.DeliveryRadiusKm);

            if (!string.IsNullOrWhiteSpace(command.Name))
            {
                restaurant.UpdateName(command.Name);
            }

            if (command.Latitude.HasValue && command.Longitude.HasValue)
            {
                restaurant.SetLocation(command.Latitude.Value, command.Longitude.Value, command.AddressTitle, restaurant.DeliveryRadiusKm);
            }

            if (!string.IsNullOrWhiteSpace(command.LogoUrl))
            {
                restaurant.LogoUrl = command.LogoUrl.Trim();
            }

            if (!string.IsNullOrWhiteSpace(command.CoverImageUrl))
            {
                restaurant.CoverImageUrl = command.CoverImageUrl.Trim();
            }

            await context.SaveChangesAsync(cancellationToken);

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

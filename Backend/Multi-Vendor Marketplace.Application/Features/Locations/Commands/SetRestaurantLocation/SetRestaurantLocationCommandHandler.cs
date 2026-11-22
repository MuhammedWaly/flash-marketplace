using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Locations.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Locations.Commands.SetRestaurantLocation
{
    public class SetRestaurantLocationCommandHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<SetRestaurantLocationCommand, Result<RestaurantLocationDto>>
    {
        public async Task<Result<RestaurantLocationDto>> Handle(SetRestaurantLocationCommand command, CancellationToken cancellationToken)
        {
            var userId = currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Error.Unauthorized("User.Unauthorized", "User is not authenticated.");
            }

            var restaurant = await context.Resturants
                .FirstOrDefaultAsync(r => r.Id == command.RestaurantId, cancellationToken);

            if (restaurant is null)
            {
                return Error.NotFound("Resturant.NotFound", "The restaurant was not found.");
            }

            // Resource-Based Ownership Check
            var isAdmin = currentUserService.IsAdmin;
            if (!isAdmin && restaurant.OwnerId != userId)
            {
                return Error.Forbidden("Resturant.Forbidden", "You do not have permission to update this restaurant's location.");
            }

            restaurant.SetLocation(command.Latitude, command.Longitude, command.AddressTitle, command.DeliveryRadiusKm);
            await context.SaveChangesAsync(cancellationToken);

            return new RestaurantLocationDto(
                restaurant.Id,
                restaurant.Name,
                restaurant.HasLocation,
                restaurant.Latitude,
                restaurant.Longitude,
                restaurant.AddressTitle,
                restaurant.DeliveryRadiusKm
            );
        }
    }
}

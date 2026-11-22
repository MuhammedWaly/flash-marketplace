using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Locations.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Locations.Queries.GetRestaurantLocation
{
    public class GetRestaurantLocationQueryHandler(
        IAppDbContext context) : IRequestHandler<GetRestaurantLocationQuery, Result<RestaurantLocationDto>>
    {
        public async Task<Result<RestaurantLocationDto>> Handle(GetRestaurantLocationQuery request, CancellationToken cancellationToken)
        {
            var restaurant = await context.Resturants
                .FirstOrDefaultAsync(r => r.Id == request.RestaurantId, cancellationToken);

            if (restaurant is null)
            {
                return Error.NotFound("Resturant.NotFound", "The restaurant was not found.");
            }

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

using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Locations.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Locations.Commands.SetRestaurantLocation
{
    public record SetRestaurantLocationCommand(
        Guid RestaurantId,
        double Latitude,
        double Longitude,
        string? AddressTitle,
        double DeliveryRadiusKm = 10.0
    ) : IRequest<Result<RestaurantLocationDto>>;
}

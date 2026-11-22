using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Locations.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Locations.Queries.GetRestaurantLocation
{
    public record GetRestaurantLocationQuery(Guid RestaurantId) : IRequest<Result<RestaurantLocationDto>>;
}

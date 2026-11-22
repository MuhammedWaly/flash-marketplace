using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Locations.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Application.Features.Locations.Commands.SetCustomerLocation
{
    public record SetCustomerLocationCommand(
        double Latitude,
        double Longitude,
        string? AddressTitle
    ) : IRequest<Result<CustomerLocationDto>>;
}

using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Locations.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Application.Features.Locations.Queries.GetCustomerLocation
{
    public record GetCustomerLocationQuery : IRequest<Result<CustomerLocationDto>>;
}

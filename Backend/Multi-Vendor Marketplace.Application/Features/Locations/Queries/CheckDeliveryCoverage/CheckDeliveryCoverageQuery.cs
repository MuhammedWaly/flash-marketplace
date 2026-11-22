using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Locations.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Locations.Queries.CheckDeliveryCoverage
{
    public record CheckDeliveryCoverageQuery(Guid RestaurantId) : IRequest<Result<DeliveryCoverageDto>>;
}

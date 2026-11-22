using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Resturants.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;
using System.Collections.Generic;
using System.Text;

namespace Multi_Vendor_Marketplace.Application.Features.Resturants.Quries.GetResturantById
{
    public sealed record GetResturantByIdQuery(
        Guid Id,
        double? UserLat = null,
        double? UserLng = null
    ) : IRequest<Result<ResturantDto>>;
}

using MediatR;
using Multi_Vendor_Marketplace.Application.Common.Models;
using Multi_Vendor_Marketplace.Application.Features.Resturants.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Application.Features.Resturants.Quries.GetResturants
{
    public sealed record GetResturantsQuery(
        int PageNumber = 1,
        int PageSize = 10,
        double? UserLat = null,
        double? UserLng = null,
        string? Category = null,
        bool? OnlyDeliverable = null,
        string? SortBy = null
    ) : IRequest<Result<PagedResult<ResturantDto>>>;
}

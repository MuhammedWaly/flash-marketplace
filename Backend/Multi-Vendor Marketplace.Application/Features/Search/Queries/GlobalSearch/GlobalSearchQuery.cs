using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Search.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Application.Features.Search.Queries.GlobalSearch
{
    public record GlobalSearchQuery(
        string? Query = null,
        string? Category = null,
        decimal? MinPrice = null,
        decimal? MaxPrice = null,
        decimal? MinRating = null,
        bool? OnlyDeliverable = null,
        string? SortBy = "nearest",
        int PageNumber = 1,
        int PageSize = 10,
        double? UserLat = null,
        double? UserLng = null
    ) : IRequest<Result<GlobalSearchResultDto>>;
}

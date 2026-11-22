using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Multi_Vendor_Marketplace.Api.Extensions;
using Multi_Vendor_Marketplace.Application.Features.Search.Queries.GetCategories;
using Multi_Vendor_Marketplace.Application.Features.Search.Queries.GlobalSearch;
using Multi_Vendor_Marketplace.Contracts.Search;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Api.Controllers
{
    [Route("api/search")]
    [EnableRateLimiting(RateLimiterExtensions.SearchPolicy)]
    public class SearchController(ISender sender) : ApiController
    {
        [HttpGet]
        public async Task<IActionResult> GlobalSearch([FromQuery] GlobalSearchRequest request, CancellationToken cancellationToken)
        {
            var resolvedLat = request.UserLat ?? request.Lat;
            var resolvedLng = request.UserLng ?? request.Lng;

            var query = new GlobalSearchQuery(
                request.Query,
                request.Category,
                request.MinPrice,
                request.MaxPrice,
                request.MinRating,
                request.OnlyDeliverable,
                request.SortBy,
                request.PageNumber,
                request.PageSize,
                resolvedLat,
                resolvedLng
            );

            var result = await sender.Send(query, cancellationToken);

            return result.Match(
                data => Ok(data),
                errors => Problem(errors)
            );
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories(CancellationToken cancellationToken)
        {
            var query = new GetSearchCategoriesQuery();
            var result = await sender.Send(query, cancellationToken);

            return result.Match(
                categories => Ok(categories),
                errors => Problem(errors)
            );
        }
    }
}

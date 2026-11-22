using MediatR;
using Multi_Vendor_Marketplace.Application.Common.Models;
using Multi_Vendor_Marketplace.Application.Features.Reviews.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Reviews.Queries.GetRestaurantReviews
{
    public sealed record GetRestaurantReviewsQuery(Guid ResturantId, int PageNumber = 1, int PageSize = 10) : IRequest<Result<PagedResult<ReviewDto>>>;
}

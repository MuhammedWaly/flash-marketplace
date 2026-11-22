using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Reviews.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Reviews.Commands.UpdateReview
{
    public sealed record UpdateReviewCommand(
        Guid ReviewId,
        int Rating,
        string? Comment = null
    ) : IRequest<Result<ReviewDto>>;
}

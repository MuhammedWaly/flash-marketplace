using MediatR;
using Multi_Vendor_Marketplace.Application.Common.Security;
using Multi_Vendor_Marketplace.Application.Features.Reviews.Dtos;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Reviews.Commands.CreateReview
{
    [Authorize(Permissions = Permissions.Reviews.Create)]
    public sealed record CreateReviewCommand(
        Guid? ResturantId,
        Guid? DishId,
        Guid? OrderId,
        int Rating,
        string? Comment = null
    ) : IRequest<Result<ReviewDto>>;
}

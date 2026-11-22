using MediatR;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Reviews.Commands.DeleteReview
{
    public sealed record DeleteReviewCommand(Guid ReviewId) : IRequest<Result<Deleted>>;
}

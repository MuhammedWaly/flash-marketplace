using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Review;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Reviews.Commands.DeleteReview
{
    public class DeleteReviewCommandHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<DeleteReviewCommand, Result<Deleted>>
    {
        public async Task<Result<Deleted>> Handle(DeleteReviewCommand command, CancellationToken cancellationToken)
        {
            var userId = currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Error.Unauthorized("User.Unauthorized", "User is not authenticated.");
            }

            var review = await context.Reviews
                .Include(r => r.Customer)
                .FirstOrDefaultAsync(r => r.Id == command.ReviewId, cancellationToken);

            if (review is null)
            {
                return ReviewError.NotFound;
            }

            // Must be author or Admin
            if (!currentUserService.IsAdmin && review.Customer?.UserId != userId)
            {
                return Error.Forbidden("Review.Forbidden", "You do not have permission to delete this review.");
            }

            var resturantId = review.ResturantId;
            context.Reviews.Remove(review);

            // Recalculate Restaurant Rating
            if (resturantId.HasValue)
            {
                var resturant = await context.Resturants
                    .FirstOrDefaultAsync(r => r.Id == resturantId.Value, cancellationToken);

                if (resturant is not null)
                {
                    var remainingRatings = await context.Reviews
                        .Where(r => r.ResturantId == resturantId.Value && r.Id != review.Id)
                        .Select(r => r.Rating)
                        .ToListAsync(cancellationToken);

                    var count = remainingRatings.Count;
                    var avg = count > 0 ? (decimal)remainingRatings.Sum() / count : 0;
                    resturant.UpdateRating(Math.Round(avg, 2), count);
                }
            }

            await context.SaveChangesAsync(cancellationToken);

            return Result.Deleted;
        }
    }
}

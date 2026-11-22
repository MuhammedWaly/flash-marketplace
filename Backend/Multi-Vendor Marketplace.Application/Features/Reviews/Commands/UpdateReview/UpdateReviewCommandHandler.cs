using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Reviews.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Review;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Reviews.Commands.UpdateReview
{
    public class UpdateReviewCommandHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<UpdateReviewCommand, Result<ReviewDto>>
    {
        public async Task<Result<ReviewDto>> Handle(UpdateReviewCommand command, CancellationToken cancellationToken)
        {
            var userId = currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Error.Unauthorized("User.Unauthorized", "User is not authenticated.");
            }

            var review = await context.Reviews
                .Include(r => r.Customer)
                .Include(r => r.Resturant)
                .Include(r => r.Dish)
                .FirstOrDefaultAsync(r => r.Id == command.ReviewId, cancellationToken);

            if (review is null)
            {
                return ReviewError.NotFound;
            }

            // Ownership check: Customer who authored the review
            if (review.Customer?.UserId != userId)
            {
                return Error.Forbidden("Review.NotAuthor", "You can only edit your own reviews.");
            }

            var updateResult = review.Update(command.Rating, command.Comment);
            if (updateResult.IsError)
            {
                return updateResult.Errors;
            }

            // Recalculate Restaurant Rating
            if (review.ResturantId.HasValue)
            {
                var resturant = await context.Resturants
                    .FirstOrDefaultAsync(r => r.Id == review.ResturantId.Value, cancellationToken);

                if (resturant is not null)
                {
                    var allRatings = await context.Reviews
                        .Where(r => r.ResturantId == review.ResturantId.Value)
                        .Select(r => r.Id == review.Id ? command.Rating : r.Rating)
                        .ToListAsync(cancellationToken);

                    var count = allRatings.Count;
                    var avg = count > 0 ? (decimal)allRatings.Sum() / count : 0;
                    resturant.UpdateRating(Math.Round(avg, 2), count);
                }
            }

            await context.SaveChangesAsync(cancellationToken);

            return new ReviewDto(
                review.Id,
                review.ResturantId,
                review.Resturant?.Name,
                review.DishId,
                review.Dish?.Name,
                review.CustomerId,
                $"{review.Customer?.FirstName} {review.Customer?.LastName}".Trim(),
                review.OrderId,
                review.Rating,
                review.Comment,
                review.IsVerifiedPurchase,
                review.CreatedAt
            );
        }
    }
}

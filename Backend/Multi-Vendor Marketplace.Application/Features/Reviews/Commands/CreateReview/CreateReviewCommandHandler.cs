using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Reviews.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Dishes;
using Multi_Vendor_Marketplace.Domain.Order;
using Multi_Vendor_Marketplace.Domain.Resturants;
using Multi_Vendor_Marketplace.Domain.Review;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Reviews.Commands.CreateReview
{
    public class CreateReviewCommandHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<CreateReviewCommand, Result<ReviewDto>>
    {
        public async Task<Result<ReviewDto>> Handle(CreateReviewCommand command, CancellationToken cancellationToken)
        {
            var userId = currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Error.Unauthorized("User.Unauthorized", "User is not authenticated.");
            }

            var customer = await context.Customers
                .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);

            if (customer is null)
            {
                return Error.NotFound("Customer.NotFound", "Customer profile was not found.");
            }

            Guid? resturantId = command.ResturantId;
            string? dishName = null;
            string? resturantName = null;

            // Resolve Dish if specified
            if (command.DishId.HasValue)
            {
                var dish = await context.Dishes
                    .Include(d => d.Resturant)
                    .FirstOrDefaultAsync(d => d.Id == command.DishId.Value, cancellationToken);

                if (dish is null)
                {
                    return DishError.NotFound;
                }

                dishName = dish.Name;
                resturantId ??= dish.ResturantId;
                resturantName = dish.Resturant?.Name;
            }

            if (resturantId.HasValue && resturantName is null)
            {
                var resturant = await context.Resturants
                    .FirstOrDefaultAsync(r => r.Id == resturantId.Value, cancellationToken);

                if (resturant is null)
                {
                    return ResturantError.NotFound;
                }

                resturantName = resturant.Name;
            }

            // Option (A): Verified Purchase check - Customer must have a delivered order from this restaurant/dish
            var hasDeliveredOrder = await context.Orders
                .Include(o => o.OrderItems)
                .AnyAsync(o => o.CustomerId == customer.Id
                               && o.Status == OrderStatus.Delivered
                               && (!resturantId.HasValue || o.ResturantId == resturantId)
                               && (!command.DishId.HasValue || o.OrderItems.Any(i => i.ProductId == command.DishId.Value)),
                          cancellationToken);

            if (!hasDeliveredOrder)
            {
                return ReviewError.NotVerifiedPurchase;
            }

            // Check if customer already reviewed this exact target
            var alreadyReviewed = await context.Reviews
                .AnyAsync(r => r.CustomerId == customer.Id
                               && r.ResturantId == resturantId
                               && r.DishId == command.DishId,
                          cancellationToken);

            if (alreadyReviewed)
            {
                return ReviewError.AlreadyReviewed;
            }

            var reviewResult = Review.Create(
                Guid.NewGuid(),
                resturantId,
                command.DishId,
                customer.Id,
                command.OrderId,
                command.Rating,
                command.Comment,
                isVerifiedPurchase: true
            );

            if (reviewResult.IsError)
            {
                return reviewResult.Errors;
            }

            var review = reviewResult.Value;
            context.Reviews.Add(review);

            // Update Restaurant Aggregated Rating & Count
            if (resturantId.HasValue)
            {
                var resturant = await context.Resturants
                    .FirstOrDefaultAsync(r => r.Id == resturantId.Value, cancellationToken);

                if (resturant is not null)
                {
                    var existingRatings = await context.Reviews
                        .Where(r => r.ResturantId == resturantId.Value)
                        .Select(r => r.Rating)
                        .ToListAsync(cancellationToken);

                    var newCount = existingRatings.Count + 1;
                    var newAverage = (decimal)(existingRatings.Sum() + command.Rating) / newCount;
                    resturant.UpdateRating(Math.Round(newAverage, 2), newCount);
                }
            }

            await context.SaveChangesAsync(cancellationToken);

            return new ReviewDto(
                review.Id,
                review.ResturantId,
                resturantName,
                review.DishId,
                dishName,
                customer.Id,
                $"{customer.FirstName} {customer.LastName}".Trim(),
                review.OrderId,
                review.Rating,
                review.Comment,
                review.IsVerifiedPurchase,
                review.CreatedAt
            );
        }
    }
}

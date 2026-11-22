using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Reviews.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Order;
using Multi_Vendor_Marketplace.Domain.Review;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Orders.Commands.RateOrder
{
    public class RateOrderCommandHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<RateOrderCommand, Result<ReviewDto>>
    {
        public async Task<Result<ReviewDto>> Handle(RateOrderCommand command, CancellationToken cancellationToken)
        {
            var userId = currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Error.Unauthorized("User.Unauthorized", "User is not authenticated.");
            }

            if (command.Rating < 1 || command.Rating > 5)
            {
                return Error.Validation("Rating.Invalid", "Rating must be an integer between 1 and 5.");
            }

            var customer = await context.Customers
                .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);

            if (customer is null)
            {
                return Error.NotFound("Customer.NotFound", "Customer profile was not found.");
            }

            var order = await context.Orders
                .Include(o => o.Resturant)
                .FirstOrDefaultAsync(o => o.Id == command.OrderId && o.CustomerId == customer.Id, cancellationToken);

            if (order is null)
            {
                return Error.NotFound("Order.NotFound", "The specified order was not found in your orders.");
            }

            if (order.Status != OrderStatus.Delivered)
            {
                return Error.Validation("Review.NotDelivered", "You can only rate orders after they have been successfully delivered.");
            }

            var alreadyReviewed = await context.Reviews
                .AnyAsync(r => r.OrderId == order.Id, cancellationToken);

            if (alreadyReviewed)
            {
                return Error.Conflict("Review.AlreadySubmitted", "You have already submitted a review for this order.");
            }

            var restaurant = order.Resturant;
            if (restaurant is null && order.ResturantId.HasValue)
            {
                restaurant = await context.Resturants.FirstOrDefaultAsync(r => r.Id == order.ResturantId.Value, cancellationToken);
            }

            if (restaurant is null)
            {
                return Error.NotFound("Resturant.NotFound", "The restaurant associated with this order was not found.");
            }

            var reviewResult = Review.Create(
                Guid.NewGuid(),
                restaurant.Id,
                null,
                customer.Id,
                order.Id,
                command.Rating,
                command.Comment,
                true
            );

            if (reviewResult.IsError)
            {
                return reviewResult.Errors;
            }

            var review = reviewResult.Value;
            context.Reviews.Add(review);

            // Update Restaurant Aggregated Rating
            var existingRatings = await context.Reviews
                .Where(r => r.ResturantId == restaurant.Id)
                .Select(r => r.Rating)
                .ToListAsync(cancellationToken);

            var allRatings = existingRatings.Append(command.Rating).ToList();
            var newCount = allRatings.Count;
            var newAverage = Math.Round((decimal)allRatings.Average(), 2);

            restaurant.UpdateRating(newAverage, newCount);

            await context.SaveChangesAsync(cancellationToken);

            return new ReviewDto(
                review.Id,
                restaurant.Id,
                restaurant.Name,
                null,
                null,
                customer.Id,
                $"{customer.FirstName} {customer.LastName}".Trim(),
                order.Id,
                review.Rating,
                review.Comment,
                review.IsVerifiedPurchase,
                review.CreatedAt
            );
        }
    }
}

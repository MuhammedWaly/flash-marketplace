using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Multi_Vendor_Marketplace.Api.Extensions;
using Multi_Vendor_Marketplace.Application.Features.Reviews.Commands.CreateReview;
using Multi_Vendor_Marketplace.Application.Features.Reviews.Commands.DeleteReview;
using Multi_Vendor_Marketplace.Application.Features.Reviews.Commands.UpdateReview;
using Multi_Vendor_Marketplace.Application.Features.Reviews.Queries.GetDishReviews;
using Multi_Vendor_Marketplace.Application.Features.Reviews.Queries.GetRestaurantReviews;
using Multi_Vendor_Marketplace.Contracts.Reviews;
using System;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Api.Controllers
{
    [Route("api/[controller]")]
    public class ReviewsController(IMediator mediator) : ApiController
    {
        [HttpPost]
        [Authorize]
        [EnableRateLimiting(RateLimiterExtensions.ReviewsPolicy)]
        public async Task<IActionResult> Create([FromBody] CreateReviewRequest request)
        {
            var command = new CreateReviewCommand(
                request.ResturantId,
                request.DishId,
                request.OrderId,
                request.Rating,
                request.Comment
            );

            var result = await mediator.Send(command);

            return result.Match(
                review => Ok(review),
                Problem
            );
        }

        [HttpPut("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateReviewRequest request)
        {
            var command = new UpdateReviewCommand(id, request.Rating, request.Comment);
            var result = await mediator.Send(command);

            return result.Match(
                review => Ok(review),
                Problem
            );
        }

        [HttpDelete("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await mediator.Send(new DeleteReviewCommand(id));

            return result.Match(
                _ => NoContent(),
                Problem
            );
        }

        [HttpGet("restaurant/{restaurantId:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRestaurantReviews(Guid restaurantId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await mediator.Send(new GetRestaurantReviewsQuery(restaurantId, pageNumber, pageSize));

            return result.Match(
                reviews => Ok(reviews),
                Problem
            );
        }

        [HttpGet("dish/{dishId:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDishReviews(Guid dishId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await mediator.Send(new GetDishReviewsQuery(dishId, pageNumber, pageSize));

            return result.Match(
                reviews => Ok(reviews),
                Problem
            );
        }
    }
}

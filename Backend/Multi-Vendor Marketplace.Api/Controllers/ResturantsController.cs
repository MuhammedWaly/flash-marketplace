using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Multi_Vendor_Marketplace.Application.Features.Resturants.Commands.CreateResturant;
using Multi_Vendor_Marketplace.Application.Features.Resturants.Commands.RemoveResturant;
using Multi_Vendor_Marketplace.Application.Features.Resturants.Commands.UpdateResturant;
using Multi_Vendor_Marketplace.Application.Features.Resturants.Quries.GetResturantById;
using Multi_Vendor_Marketplace.Application.Features.Resturants.Quries.GetResturants;
using Multi_Vendor_Marketplace.Application.Features.Reviews.Queries.GetRestaurantReviews;
using Multi_Vendor_Marketplace.Contracts.Resturants;
using System;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Api.Controllers
{
    [Route("api/[controller]")]
    [Route("api/restaurants")]
    public class ResturantsController(IMediator mediator) : ApiController
    {
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> Get(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] double? userLat = null,
            [FromQuery] double? userLng = null,
            [FromQuery] double? lat = null,
            [FromQuery] double? lng = null,
            [FromQuery] string? category = null,
            [FromQuery] string? categoryId = null,
            [FromQuery] bool? onlyDeliverable = null,
            [FromQuery] string? sortBy = null)
        {
            var resolvedLat = userLat ?? lat;
            var resolvedLng = userLng ?? lng;
            var resolvedCategory = !string.IsNullOrWhiteSpace(category) ? category : categoryId;

            var resturants = await mediator.Send(new GetResturantsQuery(
                pageNumber,
                pageSize,
                resolvedLat,
                resolvedLng,
                resolvedCategory,
                onlyDeliverable,
                sortBy));

            return resturants.Match(
                response => Ok(response),
                Problem
            );
        }

        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(
            Guid id,
            [FromQuery] double? userLat = null,
            [FromQuery] double? userLng = null,
            [FromQuery] double? lat = null,
            [FromQuery] double? lng = null)
        {
            var resolvedLat = userLat ?? lat;
            var resolvedLng = userLng ?? lng;

            var resturant = await mediator.Send(new GetResturantByIdQuery(id, resolvedLat, resolvedLng));

            return resturant.Match(
                response => Ok(response),
                Problem
            );
        }

        [HttpGet("{id:guid}/reviews")]
        [AllowAnonymous]
        public async Task<IActionResult> GetReviews(Guid id, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await mediator.Send(new GetRestaurantReviewsQuery(id, pageNumber, pageSize));

            return result.Match(
                reviews => Ok(reviews),
                Problem
            );
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create(CreateResturantRequest command)
        {
            var result = await mediator.Send(new CreateResturantCommand
                (command.Name, command.Description, command.Category, command.LogoUrl, command.CoverImageUrl, command.PhoneNumber, null));

            return result.Match(
                response => CreatedAtAction(nameof(GetById), new { id = response.Id }, response),
                Problem
            );
        }

        [HttpPut("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Update(Guid id, UpdateResturantCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest("Route ID does not match Command ID.");
            }

            var result = await mediator.Send(command);

            return result.Match(
                _ => NoContent(),
                Problem
            );
        }

        [HttpDelete("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await mediator.Send(new RemoveResturantCommand(id));

            return result.Match(
                _ => NoContent(),
                Problem
            );
        }
    }
}

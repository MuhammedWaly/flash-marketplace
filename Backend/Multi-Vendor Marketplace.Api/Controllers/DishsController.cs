using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Multi_Vendor_Marketplace.Api.Models;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Dishes.Commands.CreateDish;
using Multi_Vendor_Marketplace.Application.Features.Dishes.Commands.RemoveDish;
using Multi_Vendor_Marketplace.Application.Features.Dishes.Commands.UpdateDish;
using Multi_Vendor_Marketplace.Application.Features.Dishes.Quries.GetDishByIdForResturant;
using Multi_Vendor_Marketplace.Application.Features.Dishes.Quries.GetDishesForResturant;
using Multi_Vendor_Marketplace.Contracts.Dishes;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Api.Controllers
{
    [Route("api/[controller]")]
    public class DishsController(IMediator mediator, IFileStorageService fileStorageService) : ApiController
    {
        [HttpGet("restaurant/{resturantId:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDishes(Guid resturantId)
        {
            var dishes = await mediator.Send(new GetDishesForResturantQuery(resturantId));

            return dishes.Match(
                response => Ok(response),
                Problem
            );
        }

        [HttpGet("{dishId:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDishById(Guid dishId, [FromQuery] Guid resturantId)
        {
            var dish = await mediator.Send(new GetDishByIdForResturantQuery(resturantId, dishId));

            return dish.Match(
                response => Ok(response),
                Problem
            );
        }

        [HttpPost]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateDish([FromQuery] Guid resturantId, [FromForm] CreateDishFormRequest request, CancellationToken cancellationToken)
        {
            string? imageUrl = request.ImageUrl;
            var uploadFile = request.GetUploadFile();
            if (uploadFile != null && uploadFile.Length > 0)
            {
                using var stream = uploadFile.OpenReadStream();
                imageUrl = await fileStorageService.SaveImageAsync(stream, uploadFile.FileName, "dishes", cancellationToken);
            }

            var command = new CreateDishCommand(resturantId, request.Name, request.Description, request.Price, imageUrl);
            var result = await mediator.Send(command, cancellationToken);

            return result.Match(
                response => CreatedAtAction(nameof(GetDishById), new { dishId = response.Id, resturantId }, response),
                Problem
            );
        }

        [HttpPost]
        [Authorize]
        [Consumes("application/json")]
        public async Task<IActionResult> CreateDishJson([FromQuery] Guid resturantId, [FromBody] CreateDishRequest request, CancellationToken cancellationToken)
        {
            var command = new CreateDishCommand(resturantId, request.Name, request.Description, request.Price, request.ImageUrl);
            var result = await mediator.Send(command, cancellationToken);

            return result.Match(
                response => CreatedAtAction(nameof(GetDishById), new { dishId = response.Id, resturantId }, response),
                Problem
            );
        }

        [HttpPut("{dishId:guid}")]
        [HttpPost("{dishId:guid}")]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateDish(Guid dishId, [FromQuery] Guid resturantId, [FromForm] UpdateDishFormRequest request, CancellationToken cancellationToken)
        {
            string? imageUrl = request.ImageUrl;
            var uploadFile = request.GetUploadFile();
            if (uploadFile != null && uploadFile.Length > 0)
            {
                using var stream = uploadFile.OpenReadStream();
                imageUrl = await fileStorageService.SaveImageAsync(stream, uploadFile.FileName, "dishes", cancellationToken);
            }

            var command = new UpdateDishCommand(resturantId, dishId, request.Name, request.Description, request.Price, imageUrl);
            var result = await mediator.Send(command, cancellationToken);

            return result.Match(
                _ => NoContent(),
                Problem
            );
        }

        [HttpPut("{dishId:guid}")]
        [Authorize]
        [Consumes("application/json")]
        public async Task<IActionResult> UpdateDishJson(Guid dishId, [FromQuery] Guid resturantId, [FromBody] UpdateDishRequest request, CancellationToken cancellationToken)
        {
            var command = new UpdateDishCommand(resturantId, dishId, request.Name, request.Description, request.Price, request.ImageUrl);
            var result = await mediator.Send(command, cancellationToken);

            return result.Match(
                _ => NoContent(),
                Problem
            );
        }

        [HttpDelete("{dishId:guid}")]
        [Authorize]
        public async Task<IActionResult> RemoveDish(Guid dishId, [FromQuery] Guid resturantId)
        {
            var command = new RemoveDishCommand(resturantId, dishId);
            var result = await mediator.Send(command);

            return result.Match(
                _ => NoContent(),
                Problem
            );
        }
    }
}

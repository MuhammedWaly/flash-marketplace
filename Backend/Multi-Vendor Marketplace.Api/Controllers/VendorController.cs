using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Api.Models;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Dishes.Commands.CreateDish;
using Multi_Vendor_Marketplace.Application.Features.Dishes.Commands.RemoveDish;
using Multi_Vendor_Marketplace.Application.Features.Dishes.Commands.UpdateDish;
using Multi_Vendor_Marketplace.Application.Features.Dishes.Quries.GetDishesForResturant;
using Multi_Vendor_Marketplace.Application.Features.Orders.Commands.UpdateOrderStatus;
using Multi_Vendor_Marketplace.Application.Features.Vendor.Commands.UpdateVendorSettings;
using Multi_Vendor_Marketplace.Application.Features.Vendor.Queries.GetVendorOrders;
using Multi_Vendor_Marketplace.Application.Features.Vendor.Queries.GetVendorSettings;
using Multi_Vendor_Marketplace.Application.Features.Vendor.Queries.GetVendorStats;
using Multi_Vendor_Marketplace.Contracts.Dishes;
using Multi_Vendor_Marketplace.Contracts.Orders;
using Multi_Vendor_Marketplace.Contracts.Vendor;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Order;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Api.Controllers
{
    [Route("api/vendor")]
    [Authorize]
    public class VendorController(
        ISender sender,
        IAppDbContext context,
        ICurrentUserService currentUserService,
        IFileStorageService fileStorageService) : ApiController
    {
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats(CancellationToken cancellationToken)
        {
            var query = new GetVendorStatsQuery();
            var result = await sender.Send(query, cancellationToken);

            return result.Match(
                stats => Ok(stats),
                Problem
            );
        }

        [HttpGet("orders")]
        public async Task<IActionResult> GetOrders([FromQuery] string? status = "all", [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
        {
            var query = new GetVendorOrdersQuery(status, pageNumber, pageSize);
            var result = await sender.Send(query, cancellationToken);

            return result.Match(
                orders => Ok(orders),
                Problem
            );
        }

        [HttpPatch("orders/{id:guid}/status")]
        [HttpPut("orders/{id:guid}/status")]
        public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusByNameRequest request, CancellationToken cancellationToken)
        {
            var statusStr = request.Status?.Trim().ToLowerInvariant();
            OrderStatus? orderStatus = statusStr switch
            {
                "pending" or "placed" => OrderStatus.Pending,
                "confirmed" or "processing" or "preparing" => OrderStatus.Processing,
                "shipped" or "outfordelivery" => OrderStatus.Shipped,
                "delivered" or "completed" => OrderStatus.Delivered,
                "cancelled" => OrderStatus.Cancelled,
                _ => Enum.TryParse<OrderStatus>(request.Status, true, out var parsed) ? parsed : null
            };

            if (!orderStatus.HasValue)
            {
                return Problem([Error.Validation("OrderStatus.Invalid", $"Invalid order status '{request.Status}'. Valid statuses are: Pending, Processing, Shipped, Delivered, Cancelled.")]);
            }

            var command = new UpdateOrderStatusCommand(id, orderStatus.Value);
            var result = await sender.Send(command, cancellationToken);

            return result.Match(
                _ => NoContent(),
                Problem
            );
        }

        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings(CancellationToken cancellationToken)
        {
            var query = new GetVendorSettingsQuery();
            var result = await sender.Send(query, cancellationToken);

            return result.Match(
                settings => Ok(settings),
                Problem
            );
        }

        [HttpPut("settings")]
        public async Task<IActionResult> UpdateSettings([FromBody] UpdateVendorSettingsRequest request, CancellationToken cancellationToken)
        {
            var command = new UpdateVendorSettingsCommand(
                request.IsOpen,
                request.MinOrderValue,
                request.DeliveryRadiusKm,
                request.Latitude,
                request.Longitude,
                request.AddressTitle,
                request.LogoUrl,
                request.CoverImageUrl,
                request.Name
            );

            var result = await sender.Send(command, cancellationToken);

            return result.Match(
                settings => Ok(settings),
                Problem
            );
        }

        [HttpPost("media")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadMedia([FromForm] UploadRestaurantMediaFormRequest request, CancellationToken cancellationToken)
        {
            var restaurant = await context.Resturants
                .FirstOrDefaultAsync(r => r.OwnerId == currentUserService.UserId, cancellationToken);

            if (restaurant is null)
            {
                return Problem([Error.NotFound("Vendor.RestaurantNotFound", "Restaurant profile was not found.")]);
            }

            if (request.Logo != null && request.Logo.Length > 0)
            {
                using var stream = request.Logo.OpenReadStream();
                var logoUrl = await fileStorageService.SaveImageAsync(stream, request.Logo.FileName, "restaurants/logos", cancellationToken);
                restaurant.LogoUrl = logoUrl;
            }

            if (request.Cover != null && request.Cover.Length > 0)
            {
                using var stream = request.Cover.OpenReadStream();
                var coverUrl = await fileStorageService.SaveImageAsync(stream, request.Cover.FileName, "restaurants/covers", cancellationToken);
                restaurant.CoverImageUrl = coverUrl;
            }

            await context.SaveChangesAsync(cancellationToken);

            return Ok(new
            {
                restaurant.Id,
                restaurant.Name,
                LogoUrl = restaurant.LogoUrl,
                CoverImageUrl = restaurant.CoverImageUrl
            });
        }

        [HttpGet("dishes")]
        public async Task<IActionResult> GetMyDishes(CancellationToken cancellationToken)
        {
            var restaurant = await context.Resturants
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.OwnerId == currentUserService.UserId, cancellationToken);

            if (restaurant is null)
            {
                return Problem([Error.NotFound("Vendor.RestaurantNotFound", "Restaurant profile was not found.")]);
            }

            var query = new GetDishesForResturantQuery(restaurant.Id);
            var result = await sender.Send(query, cancellationToken);

            return result.Match(
                dishes => Ok(dishes),
                Problem
            );
        }

        [HttpPost("dishes")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateDish([FromForm] CreateDishFormRequest request, CancellationToken cancellationToken)
        {
            var restaurant = await context.Resturants
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.OwnerId == currentUserService.UserId, cancellationToken);

            if (restaurant is null)
            {
                return Problem([Error.NotFound("Vendor.RestaurantNotFound", "Restaurant profile was not found.")]);
            }

            string? imageUrl = request.ImageUrl;
            var uploadFile = request.GetUploadFile();
            if (uploadFile != null && uploadFile.Length > 0)
            {
                using var stream = uploadFile.OpenReadStream();
                imageUrl = await fileStorageService.SaveImageAsync(stream, uploadFile.FileName, "dishes", cancellationToken);
            }

            var command = new CreateDishCommand(restaurant.Id, request.Name, request.Description, request.Price, imageUrl);
            var result = await sender.Send(command, cancellationToken);

            return result.Match(
                dish => CreatedAtAction(nameof(GetMyDishes), new { id = dish.Id }, dish),
                Problem
            );
        }

        [HttpPost("dishes")]
        [Consumes("application/json")]
        public async Task<IActionResult> CreateDishJson([FromBody] CreateDishRequest request, CancellationToken cancellationToken)
        {
            var restaurant = await context.Resturants
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.OwnerId == currentUserService.UserId, cancellationToken);

            if (restaurant is null)
            {
                return Problem([Error.NotFound("Vendor.RestaurantNotFound", "Restaurant profile was not found.")]);
            }

            var command = new CreateDishCommand(restaurant.Id, request.Name, request.Description, request.Price, request.ImageUrl);
            var result = await sender.Send(command, cancellationToken);

            return result.Match(
                dish => CreatedAtAction(nameof(GetMyDishes), new { id = dish.Id }, dish),
                Problem
            );
        }

        [HttpPut("dishes/{id:guid}")]
        [HttpPost("dishes/{id:guid}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateDish(Guid id, [FromForm] UpdateDishFormRequest request, CancellationToken cancellationToken)
        {
            var restaurant = await context.Resturants
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.OwnerId == currentUserService.UserId, cancellationToken);

            if (restaurant is null)
            {
                return Problem([Error.NotFound("Vendor.RestaurantNotFound", "Restaurant profile was not found.")]);
            }

            string? imageUrl = request.ImageUrl;
            var uploadFile = request.GetUploadFile();
            if (uploadFile != null && uploadFile.Length > 0)
            {
                using var stream = uploadFile.OpenReadStream();
                imageUrl = await fileStorageService.SaveImageAsync(stream, uploadFile.FileName, "dishes", cancellationToken);
            }

            var command = new UpdateDishCommand(restaurant.Id, id, request.Name, request.Description, request.Price, imageUrl);
            var result = await sender.Send(command, cancellationToken);

            return result.Match(
                _ => Ok(new { message = "Dish updated successfully.", imageUrl }),
                Problem
            );
        }

        [HttpPut("dishes/{id:guid}")]
        [Consumes("application/json")]
        public async Task<IActionResult> UpdateDishJson(Guid id, [FromBody] UpdateDishRequest request, CancellationToken cancellationToken)
        {
            var restaurant = await context.Resturants
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.OwnerId == currentUserService.UserId, cancellationToken);

            if (restaurant is null)
            {
                return Problem([Error.NotFound("Vendor.RestaurantNotFound", "Restaurant profile was not found.")]);
            }

            var command = new UpdateDishCommand(restaurant.Id, id, request.Name, request.Description, request.Price, request.ImageUrl);
            var result = await sender.Send(command, cancellationToken);

            return result.Match(
                _ => Ok(new { message = "Dish updated successfully.", imageUrl = request.ImageUrl }),
                Problem
            );
        }

        [HttpDelete("dishes/{id:guid}")]
        public async Task<IActionResult> DeleteDish(Guid id, CancellationToken cancellationToken)
        {
            var restaurant = await context.Resturants
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.OwnerId == currentUserService.UserId, cancellationToken);

            if (restaurant is null)
            {
                return Problem([Error.NotFound("Vendor.RestaurantNotFound", "Restaurant profile was not found.")]);
            }

            var command = new RemoveDishCommand(restaurant.Id, id);
            var result = await sender.Send(command, cancellationToken);

            return result.Match(
                _ => NoContent(),
                Problem
            );
        }
    }
}

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Multi_Vendor_Marketplace.Api.Extensions;
using Multi_Vendor_Marketplace.Application.Features.Orders.Commands.Checkout;
using Multi_Vendor_Marketplace.Application.Features.Orders.Commands.RateOrder;
using Multi_Vendor_Marketplace.Application.Features.Orders.Commands.UpdateOrderStatus;
using Multi_Vendor_Marketplace.Application.Features.Orders.Queries.GetMyOrders;
using Multi_Vendor_Marketplace.Application.Features.Orders.Queries.GetRestaurantOrders;
using Multi_Vendor_Marketplace.Contracts.Orders;
using Multi_Vendor_Marketplace.Domain.Order;
using System;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Api.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    public class OrdersController(IMediator mediator) : ApiController
    {
        [HttpPost("checkout")]
        [EnableRateLimiting(RateLimiterExtensions.CheckoutPolicy)]
        public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request)
        {
            var command = new CheckoutCommand(request.ShippingAddress, request.PaymentMethod);
            var result = await mediator.Send(command);

            return result.Match(
                order => Ok(order),
                Problem
            );
        }

        [HttpGet("my-orders")]
        public async Task<IActionResult> GetMyOrders([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 5)
        {
            var result = await mediator.Send(new GetMyOrdersQuery(pageNumber, pageSize));

            return result.Match(
                orders => Ok(orders),
                Problem
            );
        }

        [HttpGet("restaurant/{restaurantId:guid}")]
        public async Task<IActionResult> GetRestaurantOrders(Guid restaurantId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await mediator.Send(new GetRestaurantOrdersQuery(restaurantId, pageNumber, pageSize));

            return result.Match(
                orders => Ok(orders),
                Problem
            );
        }

        [HttpPut("{id:guid}/status")]
        [HttpPatch("{id:guid}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
        {
            var command = new UpdateOrderStatusCommand(id, (OrderStatus)request.Status);
            var result = await mediator.Send(command);

            return result.Match(
                _ => NoContent(),
                Problem
            );
        }

        [HttpPost("{orderId:guid}/rate")]
        [EnableRateLimiting(RateLimiterExtensions.ReviewsPolicy)]
        public async Task<IActionResult> RateOrder(Guid orderId, [FromBody] RateOrderRequest request)
        {
            var command = new RateOrderCommand(orderId, request.Rating, request.Comment);
            var result = await mediator.Send(command);

            return result.Match(
                review => Ok(review),
                Problem
            );
        }
    }
}

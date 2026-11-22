using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Multi_Vendor_Marketplace.Application.Features.Cart.Commands.AddCartItem;
using Multi_Vendor_Marketplace.Application.Features.Cart.Commands.ClearCart;
using Multi_Vendor_Marketplace.Application.Features.Cart.Commands.RemoveCartItem;
using Multi_Vendor_Marketplace.Application.Features.Cart.Commands.UpdateCartItem;
using Multi_Vendor_Marketplace.Application.Features.Cart.Queries.GetCart;
using Multi_Vendor_Marketplace.Contracts.Cart;
using System;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Api.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    public class CartController(IMediator mediator) : ApiController
    {
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var result = await mediator.Send(new GetCartQuery());

            return result.Match(
                cart => Ok(cart),
                Problem
            );
        }

        [HttpPost("items")]
        public async Task<IActionResult> AddItem([FromBody] AddCartItemRequest request)
        {
            var command = new AddCartItemCommand(
                request.ResturantId,
                request.DishId,
                request.Quantity,
                request.OverrideExisting
            );

            var result = await mediator.Send(command);

            return result.Match(
                cart => Ok(cart),
                Problem
            );
        }

        [HttpPut("items/{dishId:guid}")]
        public async Task<IActionResult> UpdateItem(Guid dishId, [FromBody] UpdateCartItemRequest request)
        {
            var command = new UpdateCartItemCommand(dishId, request.Quantity);
            var result = await mediator.Send(command);

            return result.Match(
                cart => Ok(cart),
                Problem
            );
        }

        [HttpDelete("items/{dishId:guid}")]
        public async Task<IActionResult> RemoveItem(Guid dishId)
        {
            var command = new RemoveCartItemCommand(dishId);
            var result = await mediator.Send(command);

            return result.Match(
                cart => Ok(cart),
                Problem
            );
        }

        [HttpDelete]
        public async Task<IActionResult> ClearCart()
        {
            var result = await mediator.Send(new ClearCartCommand());

            return result.Match(
                _ => NoContent(),
                Problem
            );
        }
    }
}

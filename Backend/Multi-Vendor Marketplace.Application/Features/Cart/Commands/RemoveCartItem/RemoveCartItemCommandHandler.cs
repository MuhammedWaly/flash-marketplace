using MediatR;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Cart.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Cart.Commands.RemoveCartItem
{
    public class RemoveCartItemCommandHandler(
        ICartService cartService,
        ICurrentUserService currentUserService) : IRequestHandler<RemoveCartItemCommand, Result<CartDto>>
    {
        public async Task<Result<CartDto>> Handle(RemoveCartItemCommand command, CancellationToken cancellationToken)
        {
            var customerId = currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(customerId))
            {
                return Error.Unauthorized("User.Unauthorized", "User is not authenticated.");
            }

            var cart = await cartService.GetCartAsync(customerId, cancellationToken);
            var item = cart.Items.FirstOrDefault(i => i.DishId == command.DishId);

            if (item is null)
            {
                return Error.NotFound("Cart.ItemNotFound", "This dish was not found in your cart.");
            }

            cart.Items.Remove(item);
            if (cart.Items.Count == 0)
            {
                cart.ResturantId = null;
                cart.ResturantName = null;
            }

            await cartService.SetCartAsync(cart, cancellationToken);

            return cart;
        }
    }
}

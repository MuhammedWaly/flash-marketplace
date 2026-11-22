using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Cart.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Dishes;
using Multi_Vendor_Marketplace.Domain.Resturants;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Cart.Commands.AddCartItem
{
    public class AddCartItemCommandHandler(
        ICartService cartService,
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<AddCartItemCommand, Result<CartDto>>
    {
        public async Task<Result<CartDto>> Handle(AddCartItemCommand command, CancellationToken cancellationToken)
        {
            var customerId = currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(customerId))
            {
                return Error.Unauthorized("User.Unauthorized", "User is not authenticated.");
            }

            // Single query with AsNoTracking and eager loaded restaurant
            var dish = await context.Dishes
                .AsNoTracking()
                .Include(d => d.Resturant)
                .FirstOrDefaultAsync(d => d.Id == command.DishId, cancellationToken);

            if (dish is null)
            {
                return DishError.NotFound;
            }

            if (dish.ResturantId != command.ResturantId || dish.Resturant is null)
            {
                var restaurantExists = await context.Resturants
                    .AsNoTracking()
                    .AnyAsync(r => r.Id == command.ResturantId, cancellationToken);

                return restaurantExists ? DishError.NotFound : ResturantError.NotFound;
            }

            var resturant = dish.Resturant;

            var cart = await cartService.GetCartAsync(customerId, cancellationToken);

            // Single-Restaurant Cart check
            if (cart.ResturantId.HasValue && cart.ResturantId.Value != command.ResturantId && cart.Items.Count != 0)
            {
                if (!command.OverrideExisting)
                {
                    return Error.Conflict(
                        "Cart.DifferentRestaurant",
                        $"Your cart already contains dishes from '{cart.ResturantName}'. Would you like to clear your cart and start a new order from '{resturant.Name}'?"
                    );
                }

                // If override requested, clear items and switch to new restaurant
                cart.Items.Clear();
                cart.ResturantId = resturant.Id;
                cart.ResturantName = resturant.Name;
            }

            if (!cart.ResturantId.HasValue || cart.Items.Count == 0)
            {
                cart.ResturantId = resturant.Id;
                cart.ResturantName = resturant.Name;
            }

            var existingItem = cart.Items.FirstOrDefault(i => i.DishId == command.DishId);
            if (existingItem is not null)
            {
                existingItem.Quantity += command.Quantity;
                existingItem.UnitPrice = dish.Price; // refresh price
            }
            else
            {
                cart.Items.Add(new CartItemDto
                {
                    DishId = dish.Id,
                    DishName = dish.Name,
                    UnitPrice = dish.Price,
                    Quantity = command.Quantity,
                    ImageUrl = dish.ImageUrl

                });
            }

            await cartService.SetCartAsync(cart, cancellationToken);

            return cart;
        }
    }
}

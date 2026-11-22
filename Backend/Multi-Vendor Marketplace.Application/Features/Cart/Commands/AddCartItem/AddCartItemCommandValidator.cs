using FluentValidation;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Cart.Commands.AddCartItem
{
    public class AddCartItemCommandValidator : AbstractValidator<AddCartItemCommand>
    {
        public AddCartItemCommandValidator()
        {
            RuleFor(x => x.ResturantId)
                .NotEmpty().WithMessage("Restaurant ID is required.");

            RuleFor(x => x.DishId)
                .NotEmpty().WithMessage("Dish ID is required.");

            RuleFor(x => x.Quantity)
                .GreaterThan(0).WithMessage("Quantity must be at least 1.");
        }
    }
}

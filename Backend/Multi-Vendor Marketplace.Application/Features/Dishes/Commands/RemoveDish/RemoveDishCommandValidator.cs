using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Multi_Vendor_Marketplace.Application.Features.Dishes.Commands.RemoveDish
{
    public class RemoveDishCommandValidator : AbstractValidator<RemoveDishCommand>
    {
        public RemoveDishCommandValidator()
        {
            RuleFor(x => x.ResturantId)
                .NotEmpty().WithMessage("Restaurant ID is required.");

            RuleFor(x => x.DishId)
                .NotEmpty().WithMessage("Dish ID is required.");
        }
    }
}

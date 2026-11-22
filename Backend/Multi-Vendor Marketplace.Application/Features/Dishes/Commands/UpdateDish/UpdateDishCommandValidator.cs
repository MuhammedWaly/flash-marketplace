using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Multi_Vendor_Marketplace.Application.Features.Dishes.Commands.UpdateDish
{
    public class UpdateDishCommandValidator : AbstractValidator<UpdateDishCommand>
    {
        public UpdateDishCommandValidator()
        {
            RuleFor(x => x.ResturantId)
                .NotEmpty().WithMessage("Restaurant ID is required.");

            RuleFor(x => x.DishId)
                .NotEmpty().WithMessage("Dish ID is required.");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Dish name is required.")
                .MaximumLength(100).WithMessage("Dish name cannot exceed 100 characters.");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Dish description is required.")
                .MaximumLength(500).WithMessage("Dish description cannot exceed 500 characters.");

            RuleFor(x => x.Price)
                .GreaterThan(0).WithMessage("Dish price must be greater than zero.");
        }
    }
}

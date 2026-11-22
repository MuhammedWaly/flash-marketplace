using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Multi_Vendor_Marketplace.Application.Features.Dishes.Quries.GetDishByIdForResturant
{
    public class GetDishByIdForResturantValidator : AbstractValidator<GetDishByIdForResturantQuery>
    {
        public GetDishByIdForResturantValidator()
        {
            RuleFor(x => x.ResturantId)
                .NotEmpty().WithMessage("Restaurant ID is required.");

            RuleFor(x => x.DishId)
                .NotEmpty().WithMessage("Dish ID is required.");
        }
    }
}

using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Multi_Vendor_Marketplace.Application.Features.Dishes.Quries.GetDishesForResturant
{
    public class GetDishesForResturantValidator : AbstractValidator<GetDishesForResturantQuery>
    {
        public GetDishesForResturantValidator()
        {
            RuleFor(x => x.ResturantId)
                .NotEmpty().WithMessage("Restaurant ID is required.");
        }
    }
}

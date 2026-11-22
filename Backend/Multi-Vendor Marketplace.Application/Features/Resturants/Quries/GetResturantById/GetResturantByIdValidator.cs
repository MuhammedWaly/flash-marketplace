using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Multi_Vendor_Marketplace.Application.Features.Resturants.Quries.GetResturantById
{
    public class GetResturantByIdValidator : AbstractValidator<GetResturantByIdQuery>
    {
        public GetResturantByIdValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("Restaurant ID is required.");
        }
    }
}

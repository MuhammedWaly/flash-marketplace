using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Multi_Vendor_Marketplace.Application.Features.Resturants.Commands.RemoveResturant
{
    public class RemoveResturantCommandValidator : AbstractValidator<RemoveResturantCommand>
    {
        public RemoveResturantCommandValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("Restaurant ID is required.");
        }
    }
}

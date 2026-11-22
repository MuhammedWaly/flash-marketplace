using FluentValidation;

namespace Multi_Vendor_Marketplace.Application.Features.Locations.Commands.SetCustomerLocation
{
    public class SetCustomerLocationCommandValidator : AbstractValidator<SetCustomerLocationCommand>
    {
        public SetCustomerLocationCommandValidator()
        {
            RuleFor(x => x.Latitude)
                .InclusiveBetween(-90.0, 90.0)
                .WithMessage("Latitude must be between -90 and 90 degrees.");

            RuleFor(x => x.Longitude)
                .InclusiveBetween(-180.0, 180.0)
                .WithMessage("Longitude must be between -180 and 180 degrees.");

            RuleFor(x => x.AddressTitle)
                .MaximumLength(250)
                .WithMessage("Address title cannot exceed 250 characters.");
        }
    }
}

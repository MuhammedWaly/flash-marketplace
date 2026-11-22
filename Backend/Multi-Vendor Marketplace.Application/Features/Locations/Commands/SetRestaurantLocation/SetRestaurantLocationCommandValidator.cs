using FluentValidation;

namespace Multi_Vendor_Marketplace.Application.Features.Locations.Commands.SetRestaurantLocation
{
    public class SetRestaurantLocationCommandValidator : AbstractValidator<SetRestaurantLocationCommand>
    {
        public SetRestaurantLocationCommandValidator()
        {
            RuleFor(x => x.RestaurantId)
                .NotEmpty()
                .WithMessage("Restaurant ID is required.");

            RuleFor(x => x.Latitude)
                .InclusiveBetween(-90.0, 90.0)
                .WithMessage("Latitude must be between -90 and 90 degrees.");

            RuleFor(x => x.Longitude)
                .InclusiveBetween(-180.0, 180.0)
                .WithMessage("Longitude must be between -180 and 180 degrees.");

            RuleFor(x => x.DeliveryRadiusKm)
                .GreaterThan(0)
                .LessThanOrEqualTo(100)
                .WithMessage("Delivery radius must be between 0.1 and 100 kilometers.");

            RuleFor(x => x.AddressTitle)
                .MaximumLength(250)
                .WithMessage("Address title cannot exceed 250 characters.");
        }
    }
}

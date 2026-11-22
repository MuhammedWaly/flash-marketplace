using FluentValidation;

namespace Multi_Vendor_Marketplace.Application.Features.Authentication.Commands.RegisterRestaurantOwner
{
    public class RegisterRestaurantOwnerCommandValidator : AbstractValidator<RegisterRestaurantOwnerCommand>
    {
        public RegisterRestaurantOwnerCommandValidator()
        {
            RuleFor(x => x.OwnerName)
                .NotEmpty().WithMessage("Owner name is required.")
                .MaximumLength(100).WithMessage("Owner name cannot exceed 100 characters.");

            RuleFor(x => x.RestaurantName)
                .NotEmpty().WithMessage("Restaurant name is required.")
                .MaximumLength(100).WithMessage("Restaurant name cannot exceed 100 characters.");

            RuleFor(x => x.Category)
                .NotEmpty().WithMessage("Category is required.")
                .MaximumLength(50).WithMessage("Category cannot exceed 50 characters.");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Description is required.")
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Email must be a valid email address.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters.");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required.");
        }
    }
}

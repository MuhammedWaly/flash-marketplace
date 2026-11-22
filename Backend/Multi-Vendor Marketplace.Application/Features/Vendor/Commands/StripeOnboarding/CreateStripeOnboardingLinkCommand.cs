using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Vendor.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Vendor.Commands.StripeOnboarding
{
    public record CreateStripeOnboardingLinkCommand : IRequest<Result<StripeOnboardingDto>>;

    public class CreateStripeOnboardingLinkCommandHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService,
        IStripeConnectService stripeConnectService) : IRequestHandler<CreateStripeOnboardingLinkCommand, Result<StripeOnboardingDto>>
    {
        public async Task<Result<StripeOnboardingDto>> Handle(CreateStripeOnboardingLinkCommand request, CancellationToken cancellationToken)
        {
            var userId = currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Error.Unauthorized("User.Unauthorized", "User is not authenticated.");
            }

            var merchant = await context.Merchants
                .FirstOrDefaultAsync(m => m.UserId == userId, cancellationToken);

            if (merchant is null)
            {
                return Error.NotFound("Merchant.NotFound", "No seller/merchant account found for your user.");
            }

            // 1. Create Stripe Express Connected Account if not already created
            if (string.IsNullOrWhiteSpace(merchant.StripeAccountId))
            {
                try
                {
                    var stripeAccountId = await stripeConnectService.CreateExpressConnectedAccountAsync(
                        merchant.Email,
                        merchant.StoreName,
                        cancellationToken
                    );

                    merchant.SetStripeAccountId(stripeAccountId);
                    await context.SaveChangesAsync(cancellationToken);
                }
                catch (System.Exception ex)
                {
                    return Error.Conflict("Stripe.ConnectAccountError", ex.Message);
                }
            }

            // 2. Generate Account Link for Onboarding
            var refreshUrl = "http://localhost:5173/vendor/stripe/refresh";
            var returnUrl = "http://localhost:5173/vendor/stripe/return";

            try
            {
                var onboardingUrl = await stripeConnectService.CreateAccountOnboardingLinkAsync(
                    merchant.StripeAccountId!,
                    refreshUrl,
                    returnUrl,
                    cancellationToken
                );

                return new StripeOnboardingDto(onboardingUrl, merchant.StripeAccountId!);
            }
            catch (System.Exception ex)
            {
                return Error.Conflict("Stripe.OnboardingLinkError", ex.Message);
            }
        }
    }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Vendor.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Vendor.Queries.GetStripeStatus
{
    public record GetSellerStripeStatusQuery : IRequest<Result<SellerStripeStatusDto>>;

    public class GetSellerStripeStatusQueryHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService,
        IStripeConnectService stripeConnectService) : IRequestHandler<GetSellerStripeStatusQuery, Result<SellerStripeStatusDto>>
    {
        public async Task<Result<SellerStripeStatusDto>> Handle(GetSellerStripeStatusQuery request, CancellationToken cancellationToken)
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

            if (string.IsNullOrWhiteSpace(merchant.StripeAccountId))
            {
                return new SellerStripeStatusDto(
                    AccountId: null,
                    IsConnected: false,
                    ChargesEnabled: false,
                    PayoutsEnabled: false,
                    DetailsSubmitted: false,
                    Requirements: "No Stripe account connected. Please start onboarding."
                );
            }

            var status = await stripeConnectService.GetAccountStatusAsync(merchant.StripeAccountId, cancellationToken);

            // Sync with local merchant entity
            merchant.UpdateStripeAccountStatus(status.ChargesEnabled, status.PayoutsEnabled, status.DetailsSubmitted);
            await context.SaveChangesAsync(cancellationToken);

            return new SellerStripeStatusDto(
                merchant.StripeAccountId,
                status.IsConnected,
                status.ChargesEnabled,
                status.PayoutsEnabled,
                status.DetailsSubmitted,
                status.RequirementsMessage
            );
        }
    }
}

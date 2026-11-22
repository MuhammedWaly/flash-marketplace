using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Admin.Merchants.Commands.ToggleMerchantStatus
{
    public class ToggleMerchantStatusCommandHandler(IAppDbContext context)
        : IRequestHandler<ToggleMerchantStatusCommand, Result<Updated>>
    {
        public async Task<Result<Updated>> Handle(ToggleMerchantStatusCommand request, CancellationToken cancellationToken)
        {
            var merchant = await context.Merchants
                .FirstOrDefaultAsync(m => m.Id == request.MerchantId, cancellationToken);

            if (merchant is null)
            {
                return Error.NotFound("Merchant.NotFound", "Merchant not found.");
            }

            var result = merchant.ToggleActive();
            if (result.IsError)
            {
                return result.Errors;
            }

            var restaurant = await context.Resturants
                .FirstOrDefaultAsync(r => r.OwnerId == merchant.UserId, cancellationToken);

            if (restaurant is not null)
            {
                restaurant.SetOperatingSettings(isOpen: merchant.IsActive, restaurant.MinOrderValue, restaurant.DeliveryRadiusKm);
            }

            await context.SaveChangesAsync(cancellationToken);
            return Result.Updated;
        }
    }
}

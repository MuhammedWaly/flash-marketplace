using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Admin.Finance.Commands.UpdateCommissionRate
{
    public class UpdateCommissionRateCommandHandler(IAppDbContext context)
        : IRequestHandler<UpdateCommissionRateCommand, Result<Updated>>
    {
        public async Task<Result<Updated>> Handle(UpdateCommissionRateCommand request, CancellationToken cancellationToken)
        {
            var merchant = await context.Merchants
                .FirstOrDefaultAsync(m => m.Id == request.MerchantId, cancellationToken);

            if (merchant is null)
            {
                return Error.NotFound("Merchant.NotFound", "Merchant not found.");
            }

            var updateResult = merchant.UpdateCommissionRate(request.CommissionRate);
            if (updateResult.IsError)
            {
                return updateResult.Errors;
            }

            await context.SaveChangesAsync(cancellationToken);
            return Result.Updated;
        }
    }
}

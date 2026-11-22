using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Admin.Finance.Commands.RecordPayout
{
    public class RecordPayoutCommandHandler(IAppDbContext context)
        : IRequestHandler<RecordPayoutCommand, Result<PayoutResultDto>>
    {
        public async Task<Result<PayoutResultDto>> Handle(RecordPayoutCommand request, CancellationToken cancellationToken)
        {
            if (request.Amount <= 0)
            {
                return Error.Validation("Payout.AmountInvalid", "Payout amount must be greater than zero.");
            }

            var merchant = await context.Merchants
                .FirstOrDefaultAsync(m => m.Id == request.MerchantId, cancellationToken);

            if (merchant is null)
            {
                return Error.NotFound("Merchant.NotFound", "Merchant not found.");
            }

            if (merchant.Balance < request.Amount)
            {
                return Error.Validation("Payout.InsufficientBalance",
                    $"Requested payout of {request.Amount:N2} EGP exceeds current merchant balance of {merchant.Balance:N2} EGP.");
            }

            var adjustResult = merchant.AdjustBalance(-request.Amount);
            if (adjustResult.IsError)
            {
                return adjustResult.Errors;
            }

            await context.SaveChangesAsync(cancellationToken);

            return new PayoutResultDto
            {
                MerchantId = merchant.Id,
                StoreName = merchant.StoreName,
                AmountPaid = request.Amount,
                RemainingBalance = merchant.Balance,
                Method = string.IsNullOrWhiteSpace(request.Method) ? "Bank Transfer" : request.Method.Trim(),
                ReferenceNumber = request.ReferenceNumber?.Trim(),
                ProcessedAt = DateTime.UtcNow
            };
        }
    }
}

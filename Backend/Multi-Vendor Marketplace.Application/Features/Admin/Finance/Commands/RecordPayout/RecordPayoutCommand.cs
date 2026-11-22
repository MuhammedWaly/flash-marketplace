using MediatR;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Admin.Finance.Commands.RecordPayout
{
    public record RecordPayoutCommand(
        Guid MerchantId,
        decimal Amount,
        string Method,
        string? ReferenceNumber = null,
        string? Notes = null
    ) : IRequest<Result<PayoutResultDto>>;
}

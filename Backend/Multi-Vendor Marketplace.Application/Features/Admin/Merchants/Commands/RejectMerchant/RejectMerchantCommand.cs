using MediatR;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Admin.Merchants.Commands.RejectMerchant
{
    public record RejectMerchantCommand(Guid MerchantId, string? Reason = null) : IRequest<Result<Updated>>;
}

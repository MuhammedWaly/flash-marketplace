using MediatR;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Admin.Merchants.Commands.ApproveMerchant
{
    public record ApproveMerchantCommand(Guid MerchantId) : IRequest<Result<Updated>>;
}

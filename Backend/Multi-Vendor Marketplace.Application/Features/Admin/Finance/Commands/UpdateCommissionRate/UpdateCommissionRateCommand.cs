using MediatR;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Admin.Finance.Commands.UpdateCommissionRate
{
    public record UpdateCommissionRateCommand(Guid MerchantId, decimal CommissionRate) : IRequest<Result<Updated>>;
}

using MediatR;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System.Collections.Generic;

namespace Multi_Vendor_Marketplace.Application.Features.Admin.Finance.Queries.GetMerchantFinances
{
    public record GetMerchantFinancesQuery(string? Search = null) : IRequest<Result<List<MerchantFinanceDto>>>;
}

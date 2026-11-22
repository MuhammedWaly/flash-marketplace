using MediatR;
using Multi_Vendor_Marketplace.Application.Common.Models;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Application.Features.Admin.Merchants.Queries.GetAdminMerchants
{
    public record GetAdminMerchantsQuery(
        string? Status = null,
        string? Search = null,
        int PageNumber = 1,
        int PageSize = 10
    ) : IRequest<Result<PagedResult<AdminMerchantDto>>>;
}

using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Vendor.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Application.Features.Vendor.Queries.GetVendorStats
{
    public record GetVendorStatsQuery : IRequest<Result<VendorStatsDto>>;
}

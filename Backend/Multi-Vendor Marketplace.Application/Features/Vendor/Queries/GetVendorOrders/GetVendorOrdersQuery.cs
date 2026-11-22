using MediatR;
using Multi_Vendor_Marketplace.Application.Common.Models;
using Multi_Vendor_Marketplace.Application.Features.Orders.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Application.Features.Vendor.Queries.GetVendorOrders
{
    public record GetVendorOrdersQuery(
        string? Status = "all",
        int PageNumber = 1,
        int PageSize = 10
    ) : IRequest<Result<PagedResult<OrderDto>>>;
}

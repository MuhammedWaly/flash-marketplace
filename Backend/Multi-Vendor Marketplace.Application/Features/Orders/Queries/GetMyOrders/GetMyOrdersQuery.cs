using MediatR;
using Multi_Vendor_Marketplace.Application.Common.Models;
using Multi_Vendor_Marketplace.Application.Features.Orders.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Application.Features.Orders.Queries.GetMyOrders
{
    public sealed record GetMyOrdersQuery(int PageNumber = 1, int PageSize = 5) : IRequest<Result<PagedResult<OrderDto>>>;
}

using MediatR;
using Multi_Vendor_Marketplace.Application.Common.Models;
using Multi_Vendor_Marketplace.Application.Common.Security;
using Multi_Vendor_Marketplace.Application.Features.Orders.Dtos;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Orders.Queries.GetRestaurantOrders
{
    [Authorize(Permissions = Permissions.Orders.Read)]
    public sealed record GetRestaurantOrdersQuery(Guid ResturantId, int PageNumber = 1, int PageSize = 10) : IRequest<Result<PagedResult<OrderDto>>>;
}

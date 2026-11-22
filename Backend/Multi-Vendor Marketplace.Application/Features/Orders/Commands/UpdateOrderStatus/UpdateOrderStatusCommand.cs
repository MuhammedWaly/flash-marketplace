using MediatR;
using Multi_Vendor_Marketplace.Application.Common.Security;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Order;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Orders.Commands.UpdateOrderStatus
{
    [Authorize(Permissions = Permissions.Orders.UpdateStatus)]
    public sealed record UpdateOrderStatusCommand(
        Guid OrderId,
        OrderStatus NewStatus
    ) : IRequest<Result<Updated>>;
}

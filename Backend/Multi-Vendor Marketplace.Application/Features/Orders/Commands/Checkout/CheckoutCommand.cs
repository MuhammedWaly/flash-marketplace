using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Orders.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Application.Features.Orders.Commands.Checkout
{
    public sealed record CheckoutCommand(
        string ShippingAddress,
        string? PaymentMethod = "CashOnDelivery"
    ) : IRequest<Result<OrderDto>>;
}

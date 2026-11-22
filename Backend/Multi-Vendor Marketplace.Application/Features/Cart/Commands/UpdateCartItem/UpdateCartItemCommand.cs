using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Cart.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Cart.Commands.UpdateCartItem
{
    public sealed record UpdateCartItemCommand(
        Guid DishId,
        int Quantity
    ) : IRequest<Result<CartDto>>;
}

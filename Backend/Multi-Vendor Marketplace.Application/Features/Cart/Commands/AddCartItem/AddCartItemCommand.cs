using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Cart.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Cart.Commands.AddCartItem
{
    public sealed record AddCartItemCommand(
        Guid ResturantId,
        Guid DishId,
        int Quantity = 1,
        bool OverrideExisting = false
    ) : IRequest<Result<CartDto>>;
}

using MediatR;
using Multi_Vendor_Marketplace.Application.Common.Security;
using Multi_Vendor_Marketplace.Application.Features.Dishes.Dtos;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Dishes.Commands.CreateDish
{
    [Authorize(Permissions = Permissions.Dishes.Create)]
    public sealed record CreateDishCommand(
        Guid ResturantId,
        string Name,
        string Description,
        decimal Price,
        string? ImageUrl = null
    ) : IRequest<Result<DishDto>>;
}

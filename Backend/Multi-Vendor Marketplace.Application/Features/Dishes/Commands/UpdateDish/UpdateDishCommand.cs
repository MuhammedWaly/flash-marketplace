using MediatR;
using Multi_Vendor_Marketplace.Application.Common.Security;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Dishes.Commands.UpdateDish
{
    [Authorize(Permissions = Permissions.Dishes.Update)]
    public sealed record UpdateDishCommand(
        Guid ResturantId,
        Guid DishId,
        string Name,
        string Description,
        decimal Price,
        string? ImageUrl = null
    ) : IRequest<Result<Updated>>;
}

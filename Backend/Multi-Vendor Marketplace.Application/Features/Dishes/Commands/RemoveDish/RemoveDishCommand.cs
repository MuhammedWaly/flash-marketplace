using MediatR;
using Multi_Vendor_Marketplace.Application.Common.Security;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Dishes.Commands.RemoveDish
{
    [Authorize(Permissions = Permissions.Dishes.Delete)]
    public sealed record RemoveDishCommand(
        Guid ResturantId,
        Guid DishId
    ) : IRequest<Result<Deleted>>;
}

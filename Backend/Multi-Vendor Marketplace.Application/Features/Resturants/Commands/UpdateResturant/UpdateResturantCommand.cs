using MediatR;
using Multi_Vendor_Marketplace.Application.Common.Security;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Resturants.Commands.UpdateResturant
{
    [Authorize(Permissions = Permissions.Resturants.Update)]
    public sealed record UpdateResturantCommand(
        Guid Id,
        string Name,
        string Description,
        string Category,
        string? LogoUrl,
        string? CoverImageUrl,
        string? PhoneNumber
    ) : IRequest<Result<Updated>>;
}

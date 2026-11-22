using MediatR;
using Multi_Vendor_Marketplace.Application.Common.Security;
using Multi_Vendor_Marketplace.Application.Features.Dishes.Commands.CreateDish;
using Multi_Vendor_Marketplace.Application.Features.Resturants.Dtos;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System.Collections.Generic;

namespace Multi_Vendor_Marketplace.Application.Features.Resturants.Commands.CreateResturant
{
    [Authorize(Permissions = Permissions.Resturants.Create)]
    public sealed record CreateResturantCommand(
        string Name,
        string Description,
        string Category,
        string? LogoUrl,
        string? CoverImageUrl,
        string? PhoneNumber,
        List<CreateDishCommand>? Dishes
    ) : IRequest<Result<ResturantDto>>;
}

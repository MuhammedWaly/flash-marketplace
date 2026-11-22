using MediatR;
using Multi_Vendor_Marketplace.Application.Common.Security;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;

namespace Multi_Vendor_Marketplace.Application.Features.Resturants.Commands.RemoveResturant
{
    [Authorize(Permissions = Permissions.Resturants.Delete)]
    public sealed record RemoveResturantCommand(Guid Id) : IRequest<Result<Deleted>>;
}

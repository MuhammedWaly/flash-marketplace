using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Authentication.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Application.Features.Authentication.Queries.GetCurrentUser
{
    public sealed record GetCurrentUserQuery(string UserId) : IRequest<Result<UserInfoDto>>;
}

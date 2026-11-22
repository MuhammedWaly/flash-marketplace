using MediatR;
using Microsoft.AspNetCore.Identity;
using Multi_Vendor_Marketplace.Application.Features.Authentication.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Users;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Authentication.Queries.GetCurrentUser
{
    public class GetCurrentUserQueryHandler(UserManager<User> userManager) 
        : IRequestHandler<GetCurrentUserQuery, Result<UserInfoDto>>
    {
        public async Task<Result<UserInfoDto>> Handle(GetCurrentUserQuery query, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(query.UserId))
            {
                return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
            }

            var user = await userManager.FindByIdAsync(query.UserId);
            if (user is null)
            {
                return Error.NotFound("User.NotFound", "User does not exist.");
            }

            var roles = await userManager.GetRolesAsync(user);

            return new UserInfoDto(
                user.Id,
                user.Email ?? string.Empty,
                user.UserName ?? string.Empty,
                user.PhoneNumber,
                roles.ToList()
            );
        }
    }
}

using MediatR;
using Microsoft.AspNetCore.Identity;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Authentication.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Users;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using RefreshTokenEntity = Multi_Vendor_Marketplace.Domain.Users.RefreshToken;

namespace Multi_Vendor_Marketplace.Application.Features.Authentication.Commands.Register
{
    public class RegisterCommandHandler(
        UserManager<User> userManager,
        IJwtProvider jwtProvider,
        IAppDbContext context) : IRequestHandler<RegisterCommand, Result<AuthResponse>>
    {
        public async Task<Result<AuthResponse>> Handle(RegisterCommand command, CancellationToken cancellationToken)
        {
            var userExists = await userManager.FindByEmailAsync(command.Email);
            if (userExists is not null)
            {
                return Error.Conflict("A user with this email already exists.");
            }

            var user = new User
            {
                UserName = command.UserName,
                Email = command.Email,
                PhoneNumber = command.PhoneNumber
            };

            var createResult = await userManager.CreateAsync(user, command.Password);
            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                return Error.Validation("User.CreationFailed", errors);
            }

            var accessToken = await jwtProvider.GenerateAccessTokenAsync(user);
            var refreshTokenString = jwtProvider.GenerateRefreshToken();

            var refreshToken = new RefreshTokenEntity
            {
                Token = refreshTokenString,
                UserId = user.Id,
                ExpiresOnUtc = DateTime.UtcNow.AddDays(14)
            };

            context.RefreshTokens.Add(refreshToken);
            await context.SaveChangesAsync(cancellationToken);

            return new AuthResponse(
                user.Id,
                user.Email!,
                user.UserName!,
                accessToken,
                refreshTokenString,
                3600
            );
        }
    }
}

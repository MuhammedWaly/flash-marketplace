using MediatR;
using Microsoft.AspNetCore.Identity;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Authentication.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Users;
using System;
using System.Threading;
using System.Threading.Tasks;
using RefreshTokenEntity = Multi_Vendor_Marketplace.Domain.Users.RefreshToken;

namespace Multi_Vendor_Marketplace.Application.Features.Authentication.Commands.Login
{
    public class LoginCommandHandler(
        UserManager<User> userManager,
        IJwtProvider jwtProvider,
        IAppDbContext context) : IRequestHandler<LoginCommand, Result<AuthResponse>>
    {
        public async Task<Result<AuthResponse>> Handle(LoginCommand command, CancellationToken cancellationToken)
        {
            var user = await userManager.FindByEmailAsync(command.Email);
            if (user is null)
            {
                return Error.Unauthorized("Invalid email or password.");
            }

            var passwordValid = await userManager.CheckPasswordAsync(user, command.Password);
            if (!passwordValid)
            {
                return Error.Unauthorized("Invalid email or password.");
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

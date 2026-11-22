using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Authentication.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Users;
using System;
using System.Threading;
using System.Threading.Tasks;
using RefreshTokenEntity = Multi_Vendor_Marketplace.Domain.Users.RefreshToken;

namespace Multi_Vendor_Marketplace.Application.Features.Authentication.Commands.RefreshToken
{
    public class RefreshTokenCommandHandler(
        UserManager<User> userManager,
        IJwtProvider jwtProvider,
        IAppDbContext context) : IRequestHandler<RefreshTokenCommand, Result<AuthResponse>>
    {
        public async Task<Result<AuthResponse>> Handle(RefreshTokenCommand command, CancellationToken cancellationToken)
        {
            var storedToken = await context.RefreshTokens
                .FirstOrDefaultAsync(r => r.Token == command.RefreshToken, cancellationToken);

            if (storedToken is null || !storedToken.IsActive)
            {
                return Error.Unauthorized("Auth.InvalidRefreshToken", "Refresh token is invalid or expired.");
            }

            var user = await userManager.FindByIdAsync(storedToken.UserId);
            if (user is null)
            {
                return Error.Unauthorized("Auth.UserNotFound", "User not found.");
            }

            // Revoke old refresh token
            storedToken.IsRevoked = true;

            // Generate new pair
            var newAccessToken = await jwtProvider.GenerateAccessTokenAsync(user);
            var newRefreshTokenString = jwtProvider.GenerateRefreshToken();

            var newRefreshToken = new RefreshTokenEntity
            {
                Token = newRefreshTokenString,
                UserId = user.Id,
                ExpiresOnUtc = DateTime.UtcNow.AddDays(14)
            };

            context.RefreshTokens.Add(newRefreshToken);
            await context.SaveChangesAsync(cancellationToken);

            return new AuthResponse(
                user.Id,
                user.Email!,
                user.UserName!,
                newAccessToken,
                newRefreshTokenString,
                3600
            );
        }
    }
}

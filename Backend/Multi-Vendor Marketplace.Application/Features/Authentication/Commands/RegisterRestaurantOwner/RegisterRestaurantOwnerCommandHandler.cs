using MediatR;
using Microsoft.AspNetCore.Identity;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Authentication.Dtos;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Merchant;
using Multi_Vendor_Marketplace.Domain.Resturants;
using Multi_Vendor_Marketplace.Domain.Users;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using RefreshTokenEntity = Multi_Vendor_Marketplace.Domain.Users.RefreshToken;

namespace Multi_Vendor_Marketplace.Application.Features.Authentication.Commands.RegisterRestaurantOwner
{
    public class RegisterRestaurantOwnerCommandHandler(
        UserManager<User> userManager,
        IJwtProvider jwtProvider,
        IAppDbContext context) : IRequestHandler<RegisterRestaurantOwnerCommand, Result<AuthResponse>>
    {
        public async Task<Result<AuthResponse>> Handle(RegisterRestaurantOwnerCommand command, CancellationToken cancellationToken)
        {
            var userExists = await userManager.FindByEmailAsync(command.Email);
            if (userExists is not null)
            {
                return Error.Conflict("User.DuplicateEmail", "A user with this email already exists.");
            }

            var user = new User
            {
                UserName = $"{command.RestaurantName.Replace(" ", "_")}_{Guid.NewGuid().ToString()[..4]}",
                Email = command.Email,
                PhoneNumber = command.PhoneNumber
            };

            var createResult = await userManager.CreateAsync(user, command.Password);
            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                return Error.Validation("User.CreationFailed", errors);
            }

            // Assign ResturantOwner Role
            await userManager.AddToRoleAsync(user, Roles.ResturantOwner);

            // Create Merchant Profile in Merchants table
            var merchantResult = Merchant.Create(
                Guid.NewGuid(),
                command.RestaurantName,
                command.OwnerName,
                command.Email,
                command.PhoneNumber,
                user.Id,
                commissionRate: 15.0m, // Default platform commission rate (15%)
                description: command.Description,
                logoUrl: command.LogoUrl);

            if (merchantResult.IsError)
            {
                await userManager.DeleteAsync(user);
                return merchantResult.Errors;
            }

            var merchant = merchantResult.Value;
            // Newly registered merchants require Super Admin KYC verification and approval
            context.Merchants.Add(merchant);

            // Create Restaurant entity
            var resturantResult = Resturant.Create(
                Guid.NewGuid(),
                command.RestaurantName,
                command.Description,
                command.Category,
                command.LogoUrl,
                command.CoverImageUrl,
                command.PhoneNumber,
                user.Id);

            if (resturantResult.IsError)
            {
                await userManager.DeleteAsync(user);
                return resturantResult.Errors;
            }

            context.Resturants.Add(resturantResult.Value);

            // Generate Tokens
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

using MediatR;
using Microsoft.AspNetCore.Identity;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Authentication.Dtos;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Customer;
using Multi_Vendor_Marketplace.Domain.Users;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using RefreshTokenEntity = Multi_Vendor_Marketplace.Domain.Users.RefreshToken;

namespace Multi_Vendor_Marketplace.Application.Features.Authentication.Commands.RegisterCustomer
{
    public class RegisterCustomerCommandHandler(
        UserManager<User> userManager,
        IJwtProvider jwtProvider,
        IAppDbContext context) : IRequestHandler<RegisterCustomerCommand, Result<AuthResponse>>
    {
        public async Task<Result<AuthResponse>> Handle(RegisterCustomerCommand command, CancellationToken cancellationToken)
        {
            var userExists = await userManager.FindByEmailAsync(command.Email);
            if (userExists is not null)
            {
                return Error.Conflict("User.DuplicateEmail", "A user with this email already exists.");
            }

            var user = new User
            {
                UserName = $"{command.FirstName}_{command.LastName}_{Guid.NewGuid().ToString()[..4]}",
                Email = command.Email,
                PhoneNumber = command.PhoneNumber
            };

            var createResult = await userManager.CreateAsync(user, command.Password);
            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                return Error.Validation("User.CreationFailed", errors);
            }

            // Assign Customer Role
            await userManager.AddToRoleAsync(user, Roles.Customer);

            // Create Customer Profile in Customers table
            var customerResult = Customer.Create(
                Guid.NewGuid(),
                command.FirstName,
                command.LastName,
                command.Email,
                command.PhoneNumber,
                user.Id);

            if (customerResult.IsError)
            {
                await userManager.DeleteAsync(user);
                return customerResult.Errors;
            }

            context.Customers.Add(customerResult.Value);

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

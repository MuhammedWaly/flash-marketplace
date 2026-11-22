using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Multi_Vendor_Marketplace.Api.Extensions;
using Multi_Vendor_Marketplace.Application.Features.Authentication.Commands.Login;
using Multi_Vendor_Marketplace.Application.Features.Authentication.Commands.Logout;
using Multi_Vendor_Marketplace.Application.Features.Authentication.Commands.RefreshToken;
using Multi_Vendor_Marketplace.Application.Features.Authentication.Commands.Register;
using Multi_Vendor_Marketplace.Application.Features.Authentication.Commands.RegisterCustomer;
using Multi_Vendor_Marketplace.Application.Features.Authentication.Commands.RegisterRestaurantOwner;
using Multi_Vendor_Marketplace.Application.Features.Authentication.Queries.GetCurrentUser;
using Multi_Vendor_Marketplace.Contracts.Authentication;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Api.Controllers
{
    [Route("api/[controller]")]
    [EnableRateLimiting(RateLimiterExtensions.AuthPolicy)]
    public class AuthController(IMediator mediator) : ApiController
    {
        [HttpPost("register-customer")]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterCustomer([FromBody] RegisterCustomerRequest request)
        {
            var command = new RegisterCustomerCommand(
                request.FirstName,
                request.LastName,
                request.Email,
                request.Password,
                request.PhoneNumber
            );
            var result = await mediator.Send(command);

            return result.Match(
                response => Ok(response),
                Problem
            );
        }

        [HttpPost("register-restaurant-owner")]
        [HttpPost("register-vendor")]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterRestaurantOwner([FromBody] RegisterRestaurantOwnerRequest request)
        {
            var command = new RegisterRestaurantOwnerCommand(
                request.OwnerName,
                request.RestaurantName,
                request.Category,
                request.Description,
                request.Email,
                request.Password,
                request.PhoneNumber,
                request.LogoUrl,
                request.CoverImageUrl
            );
            var result = await mediator.Send(command);

            return result.Match(
                response => Ok(response),
                Problem
            );
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var command = new RegisterCommand(request.UserName, request.Email, request.Password, request.PhoneNumber);
            var result = await mediator.Send(command);

            return result.Match(
                response => Ok(response),
                Problem
            );
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var command = new LoginCommand(request.Email, request.Password);
            var result = await mediator.Send(command);

            return result.Match(
                response => Ok(response),
                Problem
            );
        }

        [HttpPost("refresh")]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var command = new RefreshTokenCommand(request.RefreshToken);
            var result = await mediator.Send(command);

            return result.Match(
                response => Ok(response),
                Problem
            );
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout([FromBody] LogoutRequest? request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var command = new LogoutCommand(request?.RefreshToken, userId);
            var result = await mediator.Send(command);

            return result.Match(
                _ => NoContent(),
                Problem
            );
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await mediator.Send(new GetCurrentUserQuery(userId ?? string.Empty));

            return result.Match(
                response => Ok(response),
                Problem
            );
        }
    }
}

using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Authentication.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Application.Features.Authentication.Commands.Register
{
    public sealed record RegisterCommand(
        string UserName,
        string Email,
        string Password,
        string? PhoneNumber = null
    ) : IRequest<Result<AuthResponse>>;
}

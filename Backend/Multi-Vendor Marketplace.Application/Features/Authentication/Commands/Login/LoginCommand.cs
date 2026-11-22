using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Authentication.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Application.Features.Authentication.Commands.Login
{
    public sealed record LoginCommand(
        string Email,
        string Password
    ) : IRequest<Result<AuthResponse>>;
}

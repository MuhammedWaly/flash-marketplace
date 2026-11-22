using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Authentication.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Application.Features.Authentication.Commands.RefreshToken
{
    public sealed record RefreshTokenCommand(
        string RefreshToken
    ) : IRequest<Result<AuthResponse>>;
}

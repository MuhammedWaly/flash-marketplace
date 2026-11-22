using MediatR;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Application.Features.Authentication.Commands.Logout
{
    public sealed record LogoutCommand(
        string? RefreshToken,
        string? UserId = null
    ) : IRequest<Result<Success>>;
}

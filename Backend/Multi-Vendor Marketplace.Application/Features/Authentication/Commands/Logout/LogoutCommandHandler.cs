using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Authentication.Commands.Logout
{
    public class LogoutCommandHandler(IAppDbContext context) : IRequestHandler<LogoutCommand, Result<Success>>
    {
        public async Task<Result<Success>> Handle(LogoutCommand command, CancellationToken cancellationToken)
        {
            if (!string.IsNullOrWhiteSpace(command.RefreshToken))
            {
                var storedToken = await context.RefreshTokens
                    .FirstOrDefaultAsync(r => r.Token == command.RefreshToken, cancellationToken);

                if (storedToken is not null)
                {
                    storedToken.IsRevoked = true;
                }
            }
            else if (!string.IsNullOrWhiteSpace(command.UserId))
            {
                var userTokens = await context.RefreshTokens
                    .Where(r => r.UserId == command.UserId && !r.IsRevoked)
                    .ToListAsync(cancellationToken);

                foreach (var token in userTokens)
                {
                    token.IsRevoked = true;
                }
            }

            await context.SaveChangesAsync(cancellationToken);

            return Result.Success;
        }
    }
}

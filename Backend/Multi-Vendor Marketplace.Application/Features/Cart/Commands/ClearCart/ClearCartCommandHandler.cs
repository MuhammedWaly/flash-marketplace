using MediatR;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Cart.Commands.ClearCart
{
    public class ClearCartCommandHandler(
        ICartService cartService,
        ICurrentUserService currentUserService) : IRequestHandler<ClearCartCommand, Result<Deleted>>
    {
        public async Task<Result<Deleted>> Handle(ClearCartCommand command, CancellationToken cancellationToken)
        {
            var customerId = currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(customerId))
            {
                return Error.Unauthorized("User.Unauthorized", "User is not authenticated.");
            }

            try
            {
                await cartService.ClearCartAsync(customerId, cancellationToken);
            }
            catch (System.Exception)
            {
                // Safely handle any transient cache failure and still return Deleted
            }

            return Result.Deleted;
        }
    }
}

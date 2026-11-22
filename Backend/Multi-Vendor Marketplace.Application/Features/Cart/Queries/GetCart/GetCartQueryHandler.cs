using MediatR;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Cart.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Cart.Queries.GetCart
{
    public class GetCartQueryHandler(
        ICartService cartService,
        ICurrentUserService currentUserService) : IRequestHandler<GetCartQuery, Result<CartDto>>
    {
        public async Task<Result<CartDto>> Handle(GetCartQuery request, CancellationToken cancellationToken)
        {
            var customerId = currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(customerId))
            {
                return Error.Unauthorized("User.Unauthorized", "User is not authenticated.");
            }

            var cart = await cartService.GetCartAsync(customerId, cancellationToken);
            return cart;
        }
    }
}

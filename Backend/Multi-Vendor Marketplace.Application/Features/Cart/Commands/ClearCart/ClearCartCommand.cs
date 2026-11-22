using MediatR;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Application.Features.Cart.Commands.ClearCart
{
    public sealed record ClearCartCommand : IRequest<Result<Deleted>>;
}

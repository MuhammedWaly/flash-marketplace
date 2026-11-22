using MediatR;
using Multi_Vendor_Marketplace.Application.Features.Cart.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Application.Features.Cart.Queries.GetCart
{
    public sealed record GetCartQuery : IRequest<Result<CartDto>>;
}

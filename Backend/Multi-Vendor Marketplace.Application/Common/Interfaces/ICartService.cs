using Multi_Vendor_Marketplace.Application.Features.Cart.Dtos;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Common.Interfaces
{
    public interface ICartService
    {
        Task<CartDto> GetCartAsync(string customerId, CancellationToken cancellationToken = default);
        Task<CartDto> SetCartAsync(CartDto cart, CancellationToken cancellationToken = default);
        Task ClearCartAsync(string customerId, CancellationToken cancellationToken = default);
    }
}

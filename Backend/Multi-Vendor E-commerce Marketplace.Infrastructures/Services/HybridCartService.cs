using Microsoft.Extensions.Caching.Hybrid;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Cart.Dtos;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Infrastructures.Services
{
    public class HybridCartService(HybridCache cache) : ICartService
    {
        private static readonly HybridCacheEntryOptions CartCacheOptions = new()
        {
            Expiration = TimeSpan.FromDays(14),          // L2 Redis expiration: 14 days
            LocalCacheExpiration = TimeSpan.FromMinutes(30) // L1 In-Memory expiration: 30 minutes
        };

        private static string GetCacheKey(string customerId) => $"cart:{customerId}";

        public async Task<CartDto> GetCartAsync(string customerId, CancellationToken cancellationToken = default)
        {
            var key = GetCacheKey(customerId);

            try
            {
                return await cache.GetOrCreateAsync(
                    key,
                    async ct => await ValueTask.FromResult(new CartDto { CustomerId = customerId }),
                    options: CartCacheOptions,
                    cancellationToken: cancellationToken
                );
            }
            catch (Exception)
            {
                // Fallback if distributed cache throws connection error
                return new CartDto { CustomerId = customerId };
            }
        }

        public async Task<CartDto> SetCartAsync(CartDto cart, CancellationToken cancellationToken = default)
        {
            var key = GetCacheKey(cart.CustomerId);
            try
            {
                await cache.SetAsync(key, cart, options: CartCacheOptions, cancellationToken: cancellationToken);
            }
            catch (Exception)
            {
                // Suppress L2 write errors if distributed cache is temporarily unreachable
            }
            return cart;
        }

        public async Task ClearCartAsync(string customerId, CancellationToken cancellationToken = default)
        {
            var key = GetCacheKey(customerId);
            try
            {
                await cache.RemoveAsync(key, cancellationToken);
            }
            catch (Exception)
            {
                // Suppress L2 deletion timeout if Redis is offline or disconnected
            }

            try
            {
                // Explicitly overwrite with empty cart so L1 and L2 will immediately reflect empty state
                await cache.SetAsync(key, new CartDto { CustomerId = customerId }, options: CartCacheOptions, cancellationToken: cancellationToken);
            }
            catch (Exception)
            {
                // Fallback suppress
            }
        }
    }
}

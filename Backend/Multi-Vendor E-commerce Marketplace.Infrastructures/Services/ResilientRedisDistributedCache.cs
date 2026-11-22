using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Infrastructures.Services
{
    public class ResilientRedisDistributedCache : IDistributedCache
    {
        private readonly IDistributedCache _innerCache;
        private readonly IConnectionMultiplexer? _connectionMultiplexer;
        private readonly ILogger<ResilientRedisDistributedCache>? _logger;

        public ResilientRedisDistributedCache(
            IDistributedCache innerCache,
            IConnectionMultiplexer? connectionMultiplexer,
            ILogger<ResilientRedisDistributedCache>? logger = null)
        {
            _innerCache = innerCache ?? throw new ArgumentNullException(nameof(innerCache));
            _connectionMultiplexer = connectionMultiplexer;
            _logger = logger;
        }

        private bool IsRedisAvailable => _connectionMultiplexer is not null && _connectionMultiplexer.IsConnected;

        public byte[]? Get(string key)
        {
            if (!IsRedisAvailable)
            {
                return null;
            }

            try
            {
                return _innerCache.Get(key);
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Redis cache Get failed for key {Key}. Suppressing and returning null.", key);
                return null;
            }
        }

        public async Task<byte[]?> GetAsync(string key, CancellationToken token = default)
        {
            if (!IsRedisAvailable)
            {
                return null;
            }

            try
            {
                return await _innerCache.GetAsync(key, token);
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Redis cache GetAsync failed for key {Key}. Suppressing and returning null.", key);
                return null;
            }
        }

        public void Set(string key, byte[] value, DistributedCacheEntryOptions options)
        {
            if (!IsRedisAvailable)
            {
                return;
            }

            try
            {
                _innerCache.Set(key, value, options);
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Redis cache Set failed for key {Key}. Suppressing.", key);
            }
        }

        public async Task SetAsync(string key, byte[] value, DistributedCacheEntryOptions options, CancellationToken token = default)
        {
            if (!IsRedisAvailable)
            {
                return;
            }

            try
            {
                await _innerCache.SetAsync(key, value, options, token);
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Redis cache SetAsync failed for key {Key}. Suppressing.", key);
            }
        }

        public void Refresh(string key)
        {
            if (!IsRedisAvailable)
            {
                return;
            }

            try
            {
                _innerCache.Refresh(key);
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Redis cache Refresh failed for key {Key}. Suppressing.", key);
            }
        }

        public async Task RefreshAsync(string key, CancellationToken token = default)
        {
            if (!IsRedisAvailable)
            {
                return;
            }

            try
            {
                await _innerCache.RefreshAsync(key, token);
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Redis cache RefreshAsync failed for key {Key}. Suppressing.", key);
            }
        }

        public void Remove(string key)
        {
            if (!IsRedisAvailable)
            {
                return;
            }

            try
            {
                _innerCache.Remove(key);
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Redis cache Remove failed for key {Key}. Suppressing.", key);
            }
        }

        public async Task RemoveAsync(string key, CancellationToken token = default)
        {
            if (!IsRedisAvailable)
            {
                return;
            }

            try
            {
                await _innerCache.RemoveAsync(key, token);
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Redis cache RemoveAsync failed for key {Key}. Suppressing.", key);
            }
        }
    }
}

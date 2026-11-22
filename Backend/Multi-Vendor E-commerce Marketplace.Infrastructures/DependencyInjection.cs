using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Domain.Users;
using Multi_Vendor_Marketplace.Infrastructures.Authentication;
using Multi_Vendor_Marketplace.Infrastructures.Data;
using Multi_Vendor_Marketplace.Infrastructures.Services;
using Multi_Vendor_Marketplace.Infrastructures.Stripe;
using StackExchange.Redis;
using System;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Infrastructures
{
    public static class DependencyInjection 
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

            services.AddIdentityCore<User>(options =>
            {
                options.Password.RequireDigit = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
                options.Password.RequiredLength = 6;
            })
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<AppDbContext>();

            services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
            services.AddScoped<IJwtProvider, JwtProvider>();
            services.AddScoped<IPermissionService, PermissionService>();

            services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());

            // HybridCache with Resilient Redis (L2) & In-Memory (L1)
            var redisConnection = configuration.GetConnectionString("Redis");
            if (!string.IsNullOrWhiteSpace(redisConnection))
            {
                var configOptions = ConfigurationOptions.Parse(redisConnection);
                configOptions.AbortOnConnectFail = false;
                configOptions.ConnectTimeout = 1000;
                configOptions.SyncTimeout = 1000;
                configOptions.AsyncTimeout = 1000;

                IConnectionMultiplexer? multiplexer = null;
                try
                {
                    multiplexer = ConnectionMultiplexer.Connect(configOptions);
                    services.AddSingleton(multiplexer);
                }
                catch
                {
                    // Redis server offline at startup; background reconnection occurs if multiplexer is initialized
                }

                var redisOptions = new RedisCacheOptions
                {
                    ConfigurationOptions = configOptions,
                    InstanceName = "Marketplace_"
                };

                if (multiplexer is not null)
                {
                    redisOptions.ConnectionMultiplexerFactory = () => Task.FromResult(multiplexer);
                }

                var innerRedisCache = new RedisCache(Options.Create(redisOptions));

                services.AddSingleton<IDistributedCache>(sp =>
                    new ResilientRedisDistributedCache(
                        innerRedisCache,
                        multiplexer,
                        sp.GetService<ILogger<ResilientRedisDistributedCache>>()));
            }

            services.AddHybridCache(options =>
            {
                options.DefaultEntryOptions = new HybridCacheEntryOptions
                {
                    Expiration = TimeSpan.FromDays(14),
                    LocalCacheExpiration = TimeSpan.FromMinutes(30)
                };
            });

            services.AddScoped<ICartService, HybridCartService>();

            // Stripe Connect & Payment Services
            services.Configure<StripeSettings>(configuration.GetSection(StripeSettings.SectionName));
            services.AddScoped<IStripeConnectService, StripeConnectService>();

            return services;
        }
    }
}

using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace Multi_Vendor_Marketplace.Api.Extensions
{
    public static class CorsExtensions
    {
        public const string PolicyName = "AllowFrontend";

        public static IServiceCollection AddAppCors(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy(PolicyName, policy =>
                {
                    policy.SetIsOriginAllowed(_ => true)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials()
                          .WithExposedHeaders("Retry-After", "Content-Disposition", "X-Pagination");
                });
            });

            return services;
        }

        public static IApplicationBuilder UseAppCors(this IApplicationBuilder app)
        {
            return app.UseCors(PolicyName);
        }
    }
}

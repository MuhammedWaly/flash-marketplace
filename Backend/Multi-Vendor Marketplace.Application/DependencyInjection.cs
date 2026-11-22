using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Multi_Vendor_Marketplace.Application.Common.Behaviors;
using System.Reflection;

namespace Multi_Vendor_Marketplace.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            var assembly = Assembly.GetExecutingAssembly();

            // Register all FluentValidation validators automatically
            services.AddValidatorsFromAssembly(assembly);

            // Register MediatR with Pipeline Behaviors
            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(assembly);
                cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
                cfg.AddOpenBehavior(typeof(AuthorizationBehavior<,>));
                cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
            });

            return services;
        }
    }
}

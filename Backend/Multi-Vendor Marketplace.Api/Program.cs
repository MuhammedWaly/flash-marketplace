using Microsoft.AspNetCore.Identity;
using Multi_Vendor_Marketplace.Api.Extensions;
using Multi_Vendor_Marketplace.Api.Hubs;
using Multi_Vendor_Marketplace.Api.Middlewares;
using Multi_Vendor_Marketplace.Api.Services;
using Multi_Vendor_Marketplace.Application;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Domain.Users;
using Multi_Vendor_Marketplace.Infrastructures;
using Multi_Vendor_Marketplace.Infrastructures.Authentication;
using Multi_Vendor_Marketplace.Infrastructures.Data;
using Serilog;
using System;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Api
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            try
            {
                var builder = WebApplication.CreateBuilder(args);

                // Configure Serilog
                builder.AddSerilogLogging();

                // Add HttpContextAccessor & CurrentUserService
                builder.Services.AddHttpContextAccessor();
                builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
                builder.Services.AddScoped<IFileStorageService, FileStorageService>();
                builder.Services.AddScoped<IOrderNotificationService, OrderNotificationService>();

                // Add SignalR for Real-Time Order Tracking & Notifications
                builder.Services.AddSignalR();

                // Add Application and Infrastructure Services
                builder.Services.AddApplicationServices();
                builder.Services.AddInfrastructureServices(builder.Configuration);

                // Add JWT Authentication & Authorization
                builder.Services.AddJwtAuthentication(builder.Configuration);

                // Global Exception Handling & ProblemDetails
                builder.Services.AddExceptionHandler<CustomExceptionHandler>();
                builder.Services.AddProblemDetails();

                // Rate Limiting (Abuse Prevention & DoS Protection)
                builder.Services.AddAppRateLimiting();

                // CORS Configuration for Frontend Integration
                builder.Services.AddAppCors();

                builder.Services.AddControllers();

                // Swagger Configuration
                builder.Services.AddSwaggerConfiguration();

                var app = builder.Build();

                // Seed Roles, Permissions, and Rich Demo Data
                using (var scope = app.Services.CreateScope())
                {
                    await MarketplaceDataSeeder.SeedDemoDataAsync(scope.ServiceProvider);
                }

                // Global Exception Handler & Serilog Request Logging
                app.UseExceptionHandler();
                app.UseSerilogRequestLogging();

                // Configure the HTTP request pipeline
                if (app.Environment.IsDevelopment())
                {
                    app.UseSwagger();
                    app.UseSwaggerUI();
                }

                // 1. CORS MUST be executed before HttpsRedirection and Authentication
                app.UseAppCors();

                // Ensure wwwroot and uploads directories exist before serving static files
                var webRootPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
                var dishesUploadPath = Path.Combine(webRootPath, "uploads", "dishes");
                if (!Directory.Exists(dishesUploadPath))
                {
                    Directory.CreateDirectory(dishesUploadPath);
                }

                // Serve static files from wwwroot (uploaded dish images, static assets)
                app.UseStaticFiles(new StaticFileOptions
                {
                    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(webRootPath),
                    RequestPath = ""
                });

                // 2. Only redirect to HTTPS in Production (prevents 307 redirect breaking CORS preflight requests in local dev)
                if (!app.Environment.IsDevelopment())
                {
                    app.UseHttpsRedirection();
                }

                app.UseAuthentication();
                app.UseAuthorization();

                app.UseRateLimiter();

                app.MapControllers();
                app.MapHub<OrderHub>("/hubs/orders");

                await app.RunAsync();
            }
            catch (Exception ex) when (ex is not HostAbortedException)
            {
                Log.Fatal(ex, "Application terminated unexpectedly during startup.");
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Api.Authorization
{
    public class PermissionAuthorizationHandler(IServiceScopeFactory serviceScopeFactory)
        : AuthorizationHandler<PermissionRequirement>
    {
        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            PermissionRequirement requirement)
        {
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
            {
                return;
            }

            using var scope = serviceScopeFactory.CreateScope();
            var permissionService = scope.ServiceProvider.GetRequiredService<IPermissionService>();

            var permissions = await permissionService.GetPermissionsForUserAsync(userId);

            if (permissions.Contains(requirement.Permission))
            {
                context.Succeed(requirement);
            }
        }
    }
}

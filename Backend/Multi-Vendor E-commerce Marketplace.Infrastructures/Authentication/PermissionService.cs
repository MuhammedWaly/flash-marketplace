using Microsoft.AspNetCore.Identity;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Users;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Infrastructures.Authentication
{
    public class PermissionService(
        UserManager<User> userManager,
        RoleManager<IdentityRole> roleManager) : IPermissionService
    {
        public async Task<HashSet<string>> GetPermissionsForUserAsync(string userId)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user is null)
            {
                return [];
            }

            var roles = await userManager.GetRolesAsync(user);
            var permissions = new HashSet<string>();

            // Super Admin gets all permissions
            if (roles.Contains(Roles.Admin))
            {
                permissions.Add(Permissions.Resturants.Read);
                permissions.Add(Permissions.Resturants.Create);
                permissions.Add(Permissions.Resturants.Update);
                permissions.Add(Permissions.Resturants.Delete);

                permissions.Add(Permissions.Dishes.Read);
                permissions.Add(Permissions.Dishes.Create);
                permissions.Add(Permissions.Dishes.Update);
                permissions.Add(Permissions.Dishes.Delete);

                permissions.Add(Permissions.Orders.Read);
                permissions.Add(Permissions.Orders.ReadOwn);
                permissions.Add(Permissions.Orders.Create);
                permissions.Add(Permissions.Orders.UpdateStatus);
                permissions.Add(Permissions.Orders.Cancel);

                permissions.Add(Permissions.Reviews.Create);
                permissions.Add(Permissions.Reviews.Delete);

                return permissions;
            }

            // Fetch role-assigned claims
            foreach (var roleName in roles)
            {
                var role = await roleManager.FindByNameAsync(roleName);
                if (role is not null)
                {
                    var claims = await roleManager.GetClaimsAsync(role);
                    foreach (var claim in claims)
                    {
                        if (claim.Type == "permission")
                        {
                            permissions.Add(claim.Value);
                        }
                    }
                }
            }

            // Also fetch user-specific direct claims
            var userClaims = await userManager.GetClaimsAsync(user);
            foreach (var claim in userClaims)
            {
                if (claim.Type == "permission")
                {
                    permissions.Add(claim.Value);
                }
            }

            return permissions;
        }
    }
}

using Microsoft.AspNetCore.Identity;
using Multi_Vendor_Marketplace.Domain.Common;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Infrastructures.Authentication
{
    public static class IdentityDataSeeder
    {
        public static async Task SeedRolesAndPermissionsAsync(
            RoleManager<IdentityRole> roleManager,
            UserManager<Domain.Users.User> userManager)
        {
            // 1. Seed Roles
            var roles = new[] { Roles.Admin, Roles.ResturantOwner, Roles.Customer };
            foreach (var roleName in roles)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }

            // 2. Seed Permissions for ResturantOwner
            var ownerRole = await roleManager.FindByNameAsync(Roles.ResturantOwner);
            if (ownerRole is not null)
            {
                var existingClaims = await roleManager.GetClaimsAsync(ownerRole);
                var requiredPermissions = new[]
                {
                    Permissions.Resturants.Create,
                    Permissions.Resturants.Update,
                    Permissions.Resturants.Delete,
                    Permissions.Dishes.Read,
                    Permissions.Dishes.Create,
                    Permissions.Dishes.Update,
                    Permissions.Dishes.Delete,
                    Permissions.Orders.Read,
                    Permissions.Orders.UpdateStatus
                };

                foreach (var permission in requiredPermissions)
                {
                    if (!existingClaims.Any(c => c.Type == "permission" && c.Value == permission))
                    {
                        await roleManager.AddClaimAsync(ownerRole, new Claim("permission", permission));
                    }
                }
            }

            // 3. Seed Permissions for Customer
            var customerRole = await roleManager.FindByNameAsync(Roles.Customer);
            if (customerRole is not null)
            {
                var existingClaims = await roleManager.GetClaimsAsync(customerRole);
                var requiredPermissions = new[]
                {
                    Permissions.Resturants.Read,
                    Permissions.Dishes.Read,
                    Permissions.Orders.Create,
                    Permissions.Orders.ReadOwn,
                    Permissions.Orders.Cancel,
                    Permissions.Reviews.Create
                };

                foreach (var permission in requiredPermissions)
                {
                    if (!existingClaims.Any(c => c.Type == "permission" && c.Value == permission))
                    {
                        await roleManager.AddClaimAsync(customerRole, new Claim("permission", permission));
                    }
                }
            }
        }
    }
}

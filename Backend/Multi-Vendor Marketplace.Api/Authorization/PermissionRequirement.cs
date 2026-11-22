using Microsoft.AspNetCore.Authorization;

namespace Multi_Vendor_Marketplace.Api.Authorization
{
    public class PermissionRequirement(string permission) : IAuthorizationRequirement
    {
        public string Permission { get; } = permission;
    }
}

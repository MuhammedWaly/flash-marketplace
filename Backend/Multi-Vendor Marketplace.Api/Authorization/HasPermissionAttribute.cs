using Microsoft.AspNetCore.Authorization;

namespace Multi_Vendor_Marketplace.Api.Authorization
{
    public class HasPermissionAttribute : AuthorizeAttribute
    {
        public HasPermissionAttribute(string permission)
            : base(policy: permission)
        {
        }
    }
}

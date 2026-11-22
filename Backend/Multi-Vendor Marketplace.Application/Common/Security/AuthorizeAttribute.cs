using System;

namespace Multi_Vendor_Marketplace.Application.Common.Security
{
    [AttributeUsage(AttributeTargets.Class, AllowMultiple = true, Inherited = true)]
    public class AuthorizeAttribute : Attribute
    {
        public string Permissions { get; set; } = string.Empty;
        public string Roles { get; set; } = string.Empty;

        public AuthorizeAttribute()
        {
        }

        public AuthorizeAttribute(string permissions)
        {
            Permissions = permissions;
        }
    }
}

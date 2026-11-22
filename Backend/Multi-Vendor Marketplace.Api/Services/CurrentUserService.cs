using Microsoft.AspNetCore.Http;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using System.Security.Claims;

namespace Multi_Vendor_Marketplace.Api.Services
{
    public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
    {
        private readonly ClaimsPrincipal? _user = httpContextAccessor.HttpContext?.User;

        public string? UserId => _user?.FindFirstValue(ClaimTypes.NameIdentifier);

        public string? UserName => _user?.FindFirstValue(ClaimTypes.Name);

        public string? Email => _user?.FindFirstValue(ClaimTypes.Email);

        public bool IsAuthenticated => _user?.Identity?.IsAuthenticated ?? false;

        public bool IsAdmin => _user?.IsInRole("Admin") ?? false;
    }
}

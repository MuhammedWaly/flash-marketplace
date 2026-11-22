using Multi_Vendor_Marketplace.Domain.Users;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Common.Interfaces
{
    public interface IJwtProvider
    {
        Task<string> GenerateAccessTokenAsync(User user);
        string GenerateRefreshToken();
    }
}

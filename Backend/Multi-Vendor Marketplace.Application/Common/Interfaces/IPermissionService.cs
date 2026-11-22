using System.Collections.Generic;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Common.Interfaces
{
    public interface IPermissionService
    {
        Task<HashSet<string>> GetPermissionsForUserAsync(string userId);
    }
}

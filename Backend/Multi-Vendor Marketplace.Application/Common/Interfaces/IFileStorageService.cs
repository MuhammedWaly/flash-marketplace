using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Common.Interfaces
{
    public interface IFileStorageService
    {
        Task<string> SaveImageAsync(Stream stream, string originalFileName, string subDirectory, CancellationToken cancellationToken = default);
        Task DeleteImageAsync(string? relativeUrl, CancellationToken cancellationToken = default);
    }
}

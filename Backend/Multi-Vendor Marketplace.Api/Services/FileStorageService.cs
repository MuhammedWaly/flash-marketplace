using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Api.Services
{
    public class FileStorageService(IWebHostEnvironment environment) : IFileStorageService
    {
        private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

        public async Task<string> SaveImageAsync(Stream stream, string originalFileName, string subDirectory, CancellationToken cancellationToken = default)
        {
            var extension = Path.GetExtension(originalFileName).ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
            {
                extension = ".jpg";
            }

            var webRoot = environment.WebRootPath;
            if (string.IsNullOrWhiteSpace(webRoot))
            {
                webRoot = Path.Combine(environment.ContentRootPath, "wwwroot");
            }

            var targetDir = Path.Combine(webRoot, "uploads", subDirectory);
            if (!Directory.Exists(targetDir))
            {
                Directory.CreateDirectory(targetDir);
            }

            var sanitizedBaseName = Path.GetFileNameWithoutExtension(originalFileName);
            if (sanitizedBaseName.Length > 20)
            {
                sanitizedBaseName = sanitizedBaseName[..20];
            }
            // Strip any unsafe characters
            sanitizedBaseName = string.Concat(sanitizedBaseName.Where(char.IsLetterOrDigit));

            var uniqueName = $"{Guid.NewGuid():N}_{(string.IsNullOrWhiteSpace(sanitizedBaseName) ? "dish" : sanitizedBaseName)}{extension}";
            var fullPath = Path.Combine(targetDir, uniqueName);

            using (var destination = new FileStream(fullPath, FileMode.Create))
            {
                await stream.CopyToAsync(destination, cancellationToken);
            }

            return $"/uploads/{subDirectory}/{uniqueName}";
        }

        public Task DeleteImageAsync(string? relativeUrl, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(relativeUrl) || !relativeUrl.StartsWith("/uploads/"))
            {
                return Task.CompletedTask;
            }

            var webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
            var localPath = Path.Combine(webRoot, relativeUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

            if (File.Exists(localPath))
            {
                try
                {
                    File.Delete(localPath);
                }
                catch
                {
                    // Ignore transient file lock errors
                }
            }

            return Task.CompletedTask;
        }
    }
}

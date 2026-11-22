using System;

namespace Multi_Vendor_Marketplace.Domain.Users
{
    public class RefreshToken
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Token { get; set; } = default!;
        public DateTime ExpiresOnUtc { get; set; }
        public string UserId { get; set; } = default!;
        public bool IsRevoked { get; set; }
        public DateTime CreatedOnUtc { get; set; } = DateTime.UtcNow;

        public bool IsExpired => DateTime.UtcNow >= ExpiresOnUtc;
        public bool IsActive => !IsRevoked && !IsExpired;
    }
}

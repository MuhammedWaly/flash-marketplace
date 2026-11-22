using System;
using System.Collections.Generic;
using System.Net.Mail;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.Merchant
{
    public class Merchant : AuditableEntity
    {
        public string StoreName { get; private set; } = string.Empty;
        public string OwnerName { get; private set; } = string.Empty;
        public string Email { get; private set; } = string.Empty;
        public string PhoneNumber { get; private set; } = string.Empty;
        public string? Description { get; private set; }
        public string? LogoUrl { get; private set; }
        public decimal Balance { get; private set; }
        public decimal CommissionRate { get; private set; }
        public bool IsApproved { get; private set; }
        public bool IsActive { get; private set; } = true;

        public string? StripeAccountId { get; private set; }
        public bool IsStripeChargesEnabled { get; private set; }
        public bool IsStripePayoutsEnabled { get; private set; }
        public bool StripeOnboardingCompleted { get; private set; }

        public string UserId { get; private set; } = default!;

        public ICollection<Product.Product> Products { get; private set; } = [];
        public ICollection<MerchantLedgerEntry.MerchantLedgerEntry> LedgerEntries { get; private set; } = [];
        public ICollection<Payout.Payout> Payouts { get; private set; } = [];

        private Merchant()
        {
        }

        private Merchant(Guid id, string storeName, string ownerName, string email, string phoneNumber, decimal commissionRate, string? description, string? logoUrl, string userId)
            : base(id)
        {
            StoreName = storeName;
            OwnerName = ownerName;
            Email = email;
            PhoneNumber = phoneNumber;
            CommissionRate = commissionRate;
            Description = description;
            LogoUrl = logoUrl;
            UserId = userId;
            Balance = 0;
            IsApproved = false;
            IsActive = true;
        }

        public static Result<Merchant> Create(Guid id, string storeName, string ownerName, string email, string phoneNumber, string userId, decimal commissionRate = 0, string? description = null, string? logoUrl = null)
        {
            if (string.IsNullOrWhiteSpace(storeName))
            {
                return MerchantError.StoreNameRequired;
            }

            if (string.IsNullOrWhiteSpace(ownerName))
            {
                return MerchantError.OwnerNameRequired;
            }

            if (string.IsNullOrWhiteSpace(email))
            {
                return MerchantError.EmailRequired;
            }

            if (!IsValidEmail(email))
            {
                return MerchantError.EmailInvalid;
            }

            if (string.IsNullOrWhiteSpace(phoneNumber))
            {
                return MerchantError.PhoneNumberRequired;
            }

            if (string.IsNullOrWhiteSpace(userId))
            {
                return Error.Validation("Merchant.UserIdRequired", "User ID is required.");
            }

            if (commissionRate < 0 || commissionRate > 100)
            {
                return MerchantError.CommissionRateInvalid;
            }

            return new Merchant(id, storeName.Trim(), ownerName.Trim(), email.Trim().ToLowerInvariant(), phoneNumber.Trim(), commissionRate, description?.Trim(), logoUrl?.Trim(), userId);
        }

        public Result<Updated> Update(string storeName, string ownerName, string email, string phoneNumber, decimal commissionRate, string? description, string? logoUrl, bool isApproved, bool isActive)
        {
            if (string.IsNullOrWhiteSpace(storeName))
            {
                return MerchantError.StoreNameRequired;
            }

            if (string.IsNullOrWhiteSpace(ownerName))
            {
                return MerchantError.OwnerNameRequired;
            }

            if (string.IsNullOrWhiteSpace(email))
            {
                return MerchantError.EmailRequired;
            }

            if (!IsValidEmail(email))
            {
                return MerchantError.EmailInvalid;
            }

            if (string.IsNullOrWhiteSpace(phoneNumber))
            {
                return MerchantError.PhoneNumberRequired;
            }

            if (commissionRate < 0 || commissionRate > 100)
            {
                return MerchantError.CommissionRateInvalid;
            }

            StoreName = storeName.Trim();
            OwnerName = ownerName.Trim();
            Email = email.Trim().ToLowerInvariant();
            PhoneNumber = phoneNumber.Trim();
            CommissionRate = commissionRate;
            Description = description?.Trim();
            LogoUrl = logoUrl?.Trim();
            IsApproved = isApproved;
            IsActive = isActive;
            UpdatedAt = DateTime.UtcNow;

            return Result.Updated;
        }

        public Result<Updated> Approve()
        {
            IsApproved = true;
            IsActive = true;
            UpdatedAt = DateTime.UtcNow;
            return Result.Updated;
        }

        public Result<Updated> Reject(string? reason = null)
        {
            IsApproved = false;
            IsActive = false;
            UpdatedAt = DateTime.UtcNow;
            return Result.Updated;
        }

        public Result<Updated> ToggleActive()
        {
            IsActive = !IsActive;
            UpdatedAt = DateTime.UtcNow;
            return Result.Updated;
        }

        public Result<Updated> UpdateCommissionRate(decimal commissionRate)
        {
            if (commissionRate < 0 || commissionRate > 100)
            {
                return MerchantError.CommissionRateInvalid;
            }

            CommissionRate = commissionRate;
            UpdatedAt = DateTime.UtcNow;
            return Result.Updated;
        }

        public Result<Updated> SetStripeAccountId(string stripeAccountId)
        {
            if (string.IsNullOrWhiteSpace(stripeAccountId))
            {
                return Error.Validation("Merchant.StripeAccountIdRequired", "Stripe Account ID is required.");
            }

            StripeAccountId = stripeAccountId.Trim();
            UpdatedAt = DateTime.UtcNow;
            return Result.Updated;
        }

        public Result<Updated> UpdateStripeAccountStatus(bool chargesEnabled, bool payoutsEnabled, bool onboardingCompleted)
        {
            IsStripeChargesEnabled = chargesEnabled;
            IsStripePayoutsEnabled = payoutsEnabled;
            StripeOnboardingCompleted = onboardingCompleted;
            UpdatedAt = DateTime.UtcNow;
            return Result.Updated;
        }

        public Result<Updated> AdjustBalance(decimal amount)
        {
            if (Balance + amount < 0)
            {
                return MerchantError.InsufficientBalance;
            }

            Balance += amount;
            UpdatedAt = DateTime.UtcNow;
            return Result.Updated;
        }

        public override Result<Deleted> Delete()
        {
            if (Balance > 0)
            {
                return MerchantError.CannotDelete;
            }

            if (IsDeleted)
            {
                return Result.Deleted;
            }

            IsDeleted = true;
            DeletedAt = DateTime.UtcNow;
            return Result.Deleted;
        }

        private static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new MailAddress(email);
                return addr.Address == email.Trim();
            }
            catch
            {
                return false;
            }
        }
    }
}

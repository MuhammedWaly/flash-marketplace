using System;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Merchant;

namespace Multi_Vendor_Marketplace.Domain.MerchantLedgerEntry
{
    public class MerchantLedgerEntry : AuditableEntity
    {
        public Guid MerchantId { get; private set; }
        public Merchant.Merchant? Merchant { get; private set; }
        public decimal Amount { get; private set; }
        public LedgerEntryType EntryType { get; private set; }
        public string Description { get; private set; } = string.Empty;
        public string? ReferenceId { get; private set; }
        public decimal BalanceAfter { get; private set; }

        private MerchantLedgerEntry()
        {
        }

        private MerchantLedgerEntry(Guid id, Guid merchantId, decimal amount, LedgerEntryType entryType, string description, decimal balanceAfter, string? referenceId)
            : base(id)
        {
            MerchantId = merchantId;
            Amount = amount;
            EntryType = entryType;
            Description = description;
            BalanceAfter = balanceAfter;
            ReferenceId = referenceId;
        }

        public static Result<MerchantLedgerEntry> Create(Guid id, Guid merchantId, decimal amount, LedgerEntryType entryType, string description, decimal balanceAfter, string? referenceId = null)
        {
            if (merchantId == Guid.Empty)
            {
                return MerchantLedgerEntryError.MerchantRequired;
            }

            if (amount <= 0)
            {
                return MerchantLedgerEntryError.AmountInvalid;
            }

            if (string.IsNullOrWhiteSpace(description))
            {
                return MerchantLedgerEntryError.DescriptionRequired;
            }

            return new MerchantLedgerEntry(id, merchantId, amount, entryType, description.Trim(), balanceAfter, referenceId?.Trim());
        }

        public Result<Updated> Update(string description, string? referenceId)
        {
            if (string.IsNullOrWhiteSpace(description))
            {
                return MerchantLedgerEntryError.DescriptionRequired;
            }

            Description = description.Trim();
            ReferenceId = referenceId?.Trim();
            UpdatedAt = DateTime.UtcNow;

            return Result.Updated;
        }

        public override Result<Deleted> Delete()
        {
            return MerchantLedgerEntryError.CannotDelete;
        }
    }
}

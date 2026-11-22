using System;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.Payout
{
    public class Payout : AuditableEntity
    {
        public Guid MerchantId { get; private set; }
        public Merchant.Merchant? Merchant { get; private set; }

        public decimal Amount { get; private set; }
        public PayoutStatus Status { get; private set; } = PayoutStatus.Pending;
        public string? BankDetails { get; private set; }
        public string? Note { get; private set; }
        public DateTime? ProcessedAt { get; private set; }

        private Payout()
        {
        }

        private Payout(Guid id, Guid merchantId, decimal amount, string? bankDetails, string? note)
            : base(id)
        {
            MerchantId = merchantId;
            Amount = amount;
            BankDetails = bankDetails;
            Note = note;
            Status = PayoutStatus.Pending;
        }

        public static Result<Payout> Create(Guid id, Guid merchantId, decimal amount, string? bankDetails = null, string? note = null)
        {
            if (merchantId == Guid.Empty)
            {
                return PayoutError.MerchantRequired;
            }

            if (amount <= 0)
            {
                return PayoutError.AmountInvalid;
            }

            return new Payout(id, merchantId, amount, bankDetails?.Trim(), note?.Trim());
        }

        public Result<Updated> UpdateStatus(PayoutStatus status, string? note = null)
        {
            if (Status == PayoutStatus.Paid || Status == PayoutStatus.Rejected)
            {
                return PayoutError.AlreadyProcessed;
            }

            Status = status;
            if (note != null)
            {
                Note = note.Trim();
            }

            if (status == PayoutStatus.Paid || status == PayoutStatus.Rejected)
            {
                ProcessedAt = DateTime.UtcNow;
            }

            UpdatedAt = DateTime.UtcNow;

            return Result.Updated;
        }

        public override Result<Deleted> Delete()
        {
            if (Status != PayoutStatus.Pending)
            {
                return PayoutError.AlreadyProcessed;
            }

            if (IsDeleted)
            {
                return Result.Deleted;
            }

            IsDeleted = true;
            DeletedAt = DateTime.UtcNow;
            return Result.Deleted;
        }
    }
}

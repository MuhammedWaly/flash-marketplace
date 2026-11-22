using System;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.Commission
{
    public class Commission : AuditableEntity
    {
        public Guid OrderItemId { get; private set; }
        public OrderItem.OrderItem? OrderItem { get; private set; }

        public Guid MerchantId { get; private set; }
        public Merchant.Merchant? Merchant { get; private set; }

        public decimal Rate { get; private set; }
        public decimal CommissionAmount { get; private set; }

        private Commission()
        {
        }

        private Commission(Guid id, Guid orderItemId, Guid merchantId, decimal rate, decimal commissionAmount)
            : base(id)
        {
            OrderItemId = orderItemId;
            MerchantId = merchantId;
            Rate = rate;
            CommissionAmount = commissionAmount;
        }

        public static Result<Commission> Create(Guid id, Guid orderItemId, Guid merchantId, decimal rate, decimal commissionAmount)
        {
            if (orderItemId == Guid.Empty)
            {
                return CommissionError.OrderItemRequired;
            }

            if (merchantId == Guid.Empty)
            {
                return CommissionError.MerchantRequired;
            }

            if (rate < 0 || rate > 100)
            {
                return CommissionError.RateInvalid;
            }

            if (commissionAmount < 0)
            {
                return CommissionError.AmountInvalid;
            }

            return new Commission(id, orderItemId, merchantId, rate, commissionAmount);
        }

        public Result<Updated> Update(decimal rate, decimal commissionAmount)
        {
            if (rate < 0 || rate > 100)
            {
                return CommissionError.RateInvalid;
            }

            if (commissionAmount < 0)
            {
                return CommissionError.AmountInvalid;
            }

            Rate = rate;
            CommissionAmount = commissionAmount;
            UpdatedAt = DateTime.UtcNow;

            return Result.Updated;
        }

        public override Result<Deleted> Delete()
        {
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

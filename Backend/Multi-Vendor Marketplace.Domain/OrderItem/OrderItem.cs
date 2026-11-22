using System;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.OrderItem
{
    public class OrderItem : AuditableEntity
    {
        public Guid OrderId { get; private set; }
        public Order.Order? Order { get; private set; }

        public Guid ProductId { get; private set; }
        public Product.Product? Product { get; private set; }

        public Guid MerchantId { get; private set; }
        public Merchant.Merchant? Merchant { get; private set; }

        public string ProductName { get; private set; } = string.Empty;
        public decimal UnitPrice { get; private set; }
        public int Quantity { get; private set; }
        public decimal TotalPrice { get; private set; }
        public decimal CommissionAmount { get; private set; }
        public decimal MerchantEarnings { get; private set; }

        private OrderItem()
        {
        }

        private OrderItem(Guid id, Guid orderId, Guid productId, Guid merchantId, string productName, decimal unitPrice, int quantity, decimal commissionRate)
            : base(id)
        {
            OrderId = orderId;
            ProductId = productId;
            MerchantId = merchantId;
            ProductName = productName;
            UnitPrice = unitPrice;
            Quantity = quantity;
            TotalPrice = unitPrice * quantity;
            CommissionAmount = TotalPrice * (commissionRate / 100m);
            MerchantEarnings = TotalPrice - CommissionAmount;
        }

        public static Result<OrderItem> Create(Guid id, Guid orderId, Guid productId, Guid merchantId, string productName, decimal unitPrice, int quantity, decimal commissionRate = 0)
        {
            if (productId == Guid.Empty)
            {
                return OrderItemError.ProductRequired;
            }

            if (merchantId == Guid.Empty)
            {
                return OrderItemError.MerchantRequired;
            }

            if (quantity <= 0)
            {
                return OrderItemError.QuantityInvalid;
            }

            if (unitPrice <= 0)
            {
                return OrderItemError.PriceInvalid;
            }

            return new OrderItem(id, orderId, productId, merchantId, productName.Trim(), unitPrice, quantity, commissionRate);
        }

        public Result<Updated> Update(int quantity, decimal unitPrice, decimal commissionRate)
        {
            if (quantity <= 0)
            {
                return OrderItemError.QuantityInvalid;
            }

            if (unitPrice <= 0)
            {
                return OrderItemError.PriceInvalid;
            }

            Quantity = quantity;
            UnitPrice = unitPrice;
            TotalPrice = unitPrice * quantity;
            CommissionAmount = TotalPrice * (commissionRate / 100m);
            MerchantEarnings = TotalPrice - CommissionAmount;
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

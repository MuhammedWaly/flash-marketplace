using System;
using System.Collections.Generic;
using Multi_Vendor_Marketplace.Domain.CartItem;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Customer;

namespace Multi_Vendor_Marketplace.Domain.Cart
{
    public class Cart : AuditableEntity
    {
        public Guid CustomerId { get; private set; }
        public Customer.Customer? Customer { get; private set; }

        public ICollection<CartItem.CartItem> Items { get; private set; } = [];

        private Cart()
        {
        }

        private Cart(Guid id, Guid customerId)
            : base(id)
        {
            CustomerId = customerId;
        }

        public static Result<Cart> Create(Guid id, Guid customerId)
        {
            if (customerId == Guid.Empty)
            {
                return CartError.CustomerRequired;
            }

            return new Cart(id, customerId);
        }

        public Result<Updated> Touch()
        {
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

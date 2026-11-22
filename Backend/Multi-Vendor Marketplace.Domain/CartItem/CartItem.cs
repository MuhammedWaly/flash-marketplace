using System;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.CartItem
{
    public class CartItem : AuditableEntity
    {
        public Guid CartId { get; private set; }
        public Cart.Cart? Cart { get; private set; }

        public Guid ProductId { get; private set; }
        public Product.Product? Product { get; private set; }

        public int Quantity { get; private set; }
        public decimal UnitPrice { get; private set; }

        private CartItem()
        {
        }

        private CartItem(Guid id, Guid cartId, Guid productId, int quantity, decimal unitPrice)
            : base(id)
        {
            CartId = cartId;
            ProductId = productId;
            Quantity = quantity;
            UnitPrice = unitPrice;
        }

        public static Result<CartItem> Create(Guid id, Guid cartId, Guid productId, int quantity, decimal unitPrice)
        {
            if (cartId == Guid.Empty)
            {
                return CartItemError.CartRequired;
            }

            if (productId == Guid.Empty)
            {
                return CartItemError.ProductRequired;
            }

            if (quantity <= 0)
            {
                return CartItemError.QuantityInvalid;
            }

            if (unitPrice <= 0)
            {
                return CartItemError.PriceInvalid;
            }

            return new CartItem(id, cartId, productId, quantity, unitPrice);
        }

        public Result<Updated> UpdateQuantity(int quantity)
        {
            if (quantity <= 0)
            {
                return CartItemError.QuantityInvalid;
            }

            Quantity = quantity;
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

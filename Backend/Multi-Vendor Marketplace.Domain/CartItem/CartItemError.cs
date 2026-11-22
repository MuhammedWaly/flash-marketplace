using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.CartItem
{
    public static class CartItemError
    {
        public static Error NotFound =>
            Error.NotFound("CartItem_Not_Found", "Cart item was not found");

        public static Error CartRequired =>
            Error.Validation("CartItem_Cart_Required", "Cart ID is required");

        public static Error ProductRequired =>
            Error.Validation("CartItem_Product_Required", "Product ID is required");

        public static Error QuantityInvalid =>
            Error.Validation("CartItem_Quantity_Invalid", "Quantity must be at least 1");

        public static Error PriceInvalid =>
            Error.Validation("CartItem_Price_Invalid", "Unit price must be greater than zero");
    }
}

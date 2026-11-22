using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.OrderItem
{
    public static class OrderItemError
    {
        public static Error NotFound =>
            Error.NotFound("OrderItem_Not_Found", "Order item was not found");

        public static Error ProductRequired =>
            Error.Validation("OrderItem_Product_Required", "Product ID is required");

        public static Error MerchantRequired =>
            Error.Validation("OrderItem_Merchant_Required", "Merchant ID is required");

        public static Error QuantityInvalid =>
            Error.Validation("OrderItem_Quantity_Invalid", "Quantity must be at least 1");

        public static Error PriceInvalid =>
            Error.Validation("OrderItem_Price_Invalid", "Unit price must be greater than zero");

        public static Error CannotDelete =>
            Error.Conflict("OrderItem_Cannot_Delete", "Order item cannot be deleted");
    }
}

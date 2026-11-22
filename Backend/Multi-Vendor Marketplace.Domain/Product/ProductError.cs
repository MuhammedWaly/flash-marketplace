using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.Product
{
    public static class ProductError
    {
        public static Error NotFound =>
            Error.NotFound("Product_Not_Found", "Product was not found");

        public static Error NameRequired =>
            Error.Validation("Product_Name_Required", "Product name is required");

        public static Error SKURequired =>
            Error.Validation("Product_SKU_Required", "SKU is required");

        public static Error PriceInvalid =>
            Error.Validation("Product_Price_Invalid", "Product price must be greater than zero");

        public static Error StockInvalid =>
            Error.Validation("Product_Stock_Invalid", "Stock quantity cannot be negative");

        public static Error MerchantRequired =>
            Error.Validation("Product_Merchant_Required", "Merchant ID is required");

        public static Error CategoryRequired =>
            Error.Validation("Product_Category_Required", "Category ID is required");

        public static Error InsufficientStock =>
            Error.Conflict("Product_Insufficient_Stock", "Insufficient stock quantity available");
    }
}

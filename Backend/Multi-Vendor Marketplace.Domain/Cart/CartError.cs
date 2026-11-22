using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.Cart
{
    public static class CartError
    {
        public static Error NotFound =>
            Error.NotFound("Cart_Not_Found", "Cart was not found");

        public static Error CustomerRequired =>
            Error.Validation("Cart_Customer_Required", "Customer ID is required");

        public static Error Empty =>
            Error.Validation("Cart_Empty", "Cart is empty");
    }
}

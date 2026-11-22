using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.Commission
{
    public static class CommissionError
    {
        public static Error NotFound =>
            Error.NotFound("Commission_Not_Found", "Commission record was not found");

        public static Error OrderItemRequired =>
            Error.Validation("Commission_OrderItem_Required", "Order item ID is required");

        public static Error MerchantRequired =>
            Error.Validation("Commission_Merchant_Required", "Merchant ID is required");

        public static Error RateInvalid =>
            Error.Validation("Commission_Rate_Invalid", "Commission rate must be between 0 and 100 percent");

        public static Error AmountInvalid =>
            Error.Validation("Commission_Amount_Invalid", "Commission amount cannot be negative");
    }
}

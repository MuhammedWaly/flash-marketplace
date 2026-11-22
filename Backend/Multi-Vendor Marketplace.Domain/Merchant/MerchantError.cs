using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.Merchant
{
    public static class MerchantError
    {
        public static Error NotFound =>
            Error.NotFound("Merchant_Not_Found", "Merchant was not found");

        public static Error StoreNameRequired =>
            Error.Validation("Merchant_StoreName_Required", "Store name is required");

        public static Error OwnerNameRequired =>
            Error.Validation("Merchant_OwnerName_Required", "Owner name is required");

        public static Error EmailRequired =>
            Error.Validation("Merchant_Email_Required", "Email is required");

        public static Error EmailInvalid =>
            Error.Validation("Merchant_Email_Invalid", "Email is invalid");

        public static Error PhoneNumberRequired =>
            Error.Validation("Merchant_PhoneNumber_Required", "Phone number is required");

        public static Error EmailExists =>
            Error.Conflict("Merchant_Email_Exists", "A merchant with this email already exists");

        public static Error CommissionRateInvalid =>
            Error.Validation("Merchant_CommissionRate_Invalid", "Commission rate must be between 0 and 100 percent");

        public static Error InsufficientBalance =>
            Error.Conflict("Merchant_Insufficient_Balance", "Merchant balance is insufficient");

        public static Error CannotDelete =>
            Error.Conflict("Merchant_Cannot_Delete", "Merchant cannot be deleted due to existing products or balance");
    }
}

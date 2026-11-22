using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.Payout
{
    public static class PayoutError
    {
        public static Error NotFound =>
            Error.NotFound("Payout_Not_Found", "Payout was not found");

        public static Error MerchantRequired =>
            Error.Validation("Payout_Merchant_Required", "Merchant ID is required");

        public static Error AmountInvalid =>
            Error.Validation("Payout_Amount_Invalid", "Amount must be greater than zero");

        public static Error AlreadyProcessed =>
            Error.Conflict("Payout_Already_Processed", "Payout has already been processed");
    }
}

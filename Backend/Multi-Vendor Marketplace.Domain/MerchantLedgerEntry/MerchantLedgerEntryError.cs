using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.MerchantLedgerEntry
{
    public static class MerchantLedgerEntryError
    {
        public static Error NotFound =>
            Error.NotFound("MerchantLedgerEntry_Not_Found", "Ledger entry was not found");

        public static Error MerchantRequired =>
            Error.Validation("MerchantLedgerEntry_Merchant_Required", "Merchant ID is required");

        public static Error AmountInvalid =>
            Error.Validation("MerchantLedgerEntry_Amount_Invalid", "Amount must be greater than zero");

        public static Error DescriptionRequired =>
            Error.Validation("MerchantLedgerEntry_Description_Required", "Description is required");

        public static Error CannotDelete =>
            Error.Conflict("MerchantLedgerEntry_Cannot_Delete", "Ledger entries cannot be deleted once recorded");
    }
}

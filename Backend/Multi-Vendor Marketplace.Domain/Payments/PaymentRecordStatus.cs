namespace Multi_Vendor_Marketplace.Domain.Payments
{
    public enum PaymentRecordStatus
    {
        Pending = 1,
        Succeeded = 2,
        Failed = 3,
        Cancelled = 4,
        Refunded = 5
    }
}

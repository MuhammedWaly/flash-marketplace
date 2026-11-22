namespace Multi_Vendor_Marketplace.Application.Features.Admin.Finance.Queries.GetFinanceOverview
{
    public class FinanceOverviewDto
    {
        public decimal TotalGmv { get; set; }
        public decimal TotalPlatformCommission { get; set; }
        public decimal TotalMerchantEarnings { get; set; }
        public decimal TotalVendorBalances { get; set; }
        public int TotalOrdersCount { get; set; }
        public int CompletedOrdersCount { get; set; }
        public int ActiveMerchantsCount { get; set; }
        public int PendingMerchantsCount { get; set; }
    }
}

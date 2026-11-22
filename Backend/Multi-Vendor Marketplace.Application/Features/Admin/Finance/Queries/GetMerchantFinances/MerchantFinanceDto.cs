using System;

namespace Multi_Vendor_Marketplace.Application.Features.Admin.Finance.Queries.GetMerchantFinances
{
    public class MerchantFinanceDto
    {
        public Guid MerchantId { get; set; }
        public string StoreName { get; set; } = string.Empty;
        public string OwnerName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public decimal CommissionRate { get; set; }
        public decimal Balance { get; set; }
        public decimal TotalSales { get; set; }
        public decimal TotalCommissionPaid { get; set; }
        public decimal TotalEarnings { get; set; }
        public int CompletedOrdersCount { get; set; }
        public bool IsApproved { get; set; }
        public bool IsActive { get; set; }
    }
}

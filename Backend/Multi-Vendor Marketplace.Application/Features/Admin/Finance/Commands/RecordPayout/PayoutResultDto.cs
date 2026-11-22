using System;

namespace Multi_Vendor_Marketplace.Application.Features.Admin.Finance.Commands.RecordPayout
{
    public class PayoutResultDto
    {
        public Guid MerchantId { get; set; }
        public string StoreName { get; set; } = string.Empty;
        public decimal AmountPaid { get; set; }
        public decimal RemainingBalance { get; set; }
        public string Method { get; set; } = string.Empty;
        public string? ReferenceNumber { get; set; }
        public DateTime ProcessedAt { get; set; }
    }
}

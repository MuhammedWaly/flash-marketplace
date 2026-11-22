using System;

namespace Multi_Vendor_Marketplace.Application.Features.Admin.Merchants.Queries.GetAdminMerchants
{
    public class AdminMerchantDto
    {
        public Guid Id { get; set; }
        public string StoreName { get; set; } = string.Empty;
        public string OwnerName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public decimal Balance { get; set; }
        public decimal CommissionRate { get; set; }
        public bool IsApproved { get; set; }
        public bool IsActive { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        public Guid? RestaurantId { get; set; }
        public string? RestaurantName { get; set; }
        public string? Category { get; set; }
        public string? CoverImageUrl { get; set; }
        public string? AddressTitle { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public double DeliveryRadiusKm { get; set; }
        public decimal MinOrderValue { get; set; }
        public bool IsOpen { get; set; }
        public int DishesCount { get; set; }
        public decimal Rating { get; set; }
    }
}

using System;
using System.Collections.Generic;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.Product
{
    public class Product : AuditableEntity
    {
        public string Name { get; private set; } = string.Empty;
        public string? Description { get; private set; }
        public string SKU { get; private set; } = string.Empty;
        public decimal Price { get; private set; }
        public decimal? CompareAtPrice { get; private set; }
        public int StockQuantity { get; private set; }
        public string? MainImageUrl { get; private set; }
        public bool IsActive { get; private set; } = true;

        public Guid MerchantId { get; private set; }
        public Merchant.Merchant? Merchant { get; private set; }

        public Guid CategoryId { get; private set; }
        public Category.Category? Category { get; private set; }

        public Guid? BrandId { get; private set; }
        public Brand.Brand? Brand { get; private set; }

        public ICollection<Review.Review> Reviews { get; private set; } = [];

        private Product()
        {
        }

        private Product(Guid id, string name, string? description, string sku, decimal price, decimal? compareAtPrice, int stockQuantity, string? mainImageUrl, Guid merchantId, Guid categoryId, Guid? brandId)
            : base(id)
        {
            Name = name;
            Description = description;
            SKU = sku;
            Price = price;
            CompareAtPrice = compareAtPrice;
            StockQuantity = stockQuantity;
            MainImageUrl = mainImageUrl;
            MerchantId = merchantId;
            CategoryId = categoryId;
            BrandId = brandId;
            IsActive = true;
        }

        public static Result<Product> Create(Guid id, string name, string sku, decimal price, int stockQuantity, Guid merchantId, Guid categoryId, Guid? brandId = null, string? description = null, decimal? compareAtPrice = null, string? mainImageUrl = null)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return ProductError.NameRequired;
            }

            if (string.IsNullOrWhiteSpace(sku))
            {
                return ProductError.SKURequired;
            }

            if (price <= 0)
            {
                return ProductError.PriceInvalid;
            }

            if (stockQuantity < 0)
            {
                return ProductError.StockInvalid;
            }

            if (merchantId == Guid.Empty)
            {
                return ProductError.MerchantRequired;
            }

            if (categoryId == Guid.Empty)
            {
                return ProductError.CategoryRequired;
            }

            return new Product(id, name.Trim(), description?.Trim(), sku.Trim().ToUpperInvariant(), price, compareAtPrice, stockQuantity, mainImageUrl?.Trim(), merchantId, categoryId, brandId);
        }

        public Result<Updated> Update(string name, string sku, decimal price, decimal? compareAtPrice, int stockQuantity, Guid categoryId, Guid? brandId, string? description, string? mainImageUrl, bool isActive)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return ProductError.NameRequired;
            }

            if (string.IsNullOrWhiteSpace(sku))
            {
                return ProductError.SKURequired;
            }

            if (price <= 0)
            {
                return ProductError.PriceInvalid;
            }

            if (stockQuantity < 0)
            {
                return ProductError.StockInvalid;
            }

            if (categoryId == Guid.Empty)
            {
                return ProductError.CategoryRequired;
            }

            Name = name.Trim();
            SKU = sku.Trim().ToUpperInvariant();
            Price = price;
            CompareAtPrice = compareAtPrice;
            StockQuantity = stockQuantity;
            CategoryId = categoryId;
            BrandId = brandId;
            Description = description?.Trim();
            MainImageUrl = mainImageUrl?.Trim();
            IsActive = isActive;
            UpdatedAt = DateTime.UtcNow;

            return Result.Updated;
        }

        public Result<Updated> DeductStock(int quantity)
        {
            if (quantity <= 0 || StockQuantity < quantity)
            {
                return ProductError.InsufficientStock;
            }

            StockQuantity -= quantity;
            UpdatedAt = DateTime.UtcNow;

            return Result.Updated;
        }

        public override Result<Deleted> Delete()
        {
            if (IsDeleted)
            {
                return Result.Deleted;
            }

            IsDeleted = true;
            DeletedAt = DateTime.UtcNow;
            return Result.Deleted;
        }
    }
}

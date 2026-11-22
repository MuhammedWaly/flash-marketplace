using System;
using System.Collections.Generic;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.Brand
{
    public class Brand : AuditableEntity
    {
        public string Name { get; private set; } = string.Empty;
        public string Slug { get; private set; } = string.Empty;
        public string? Description { get; private set; }
        public string? LogoUrl { get; private set; }
        public bool IsActive { get; private set; } = true;

        public ICollection<Product.Product> Products { get; private set; } = [];

        private Brand()
        {
        }

        private Brand(Guid id, string name, string slug, string? description, string? logoUrl)
            : base(id)
        {
            Name = name;
            Slug = slug;
            Description = description;
            LogoUrl = logoUrl;
            IsActive = true;
        }

        public static Result<Brand> Create(Guid id, string name, string slug, string? description = null, string? logoUrl = null)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BrandError.NameRequired;
            }

            if (string.IsNullOrWhiteSpace(slug))
            {
                return BrandError.SlugRequired;
            }

            return new Brand(id, name.Trim(), slug.Trim().ToLowerInvariant(), description?.Trim(), logoUrl?.Trim());
        }

        public Result<Updated> Update(string name, string slug, string? description, string? logoUrl, bool isActive)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BrandError.NameRequired;
            }

            if (string.IsNullOrWhiteSpace(slug))
            {
                return BrandError.SlugRequired;
            }

            Name = name.Trim();
            Slug = slug.Trim().ToLowerInvariant();
            Description = description?.Trim();
            LogoUrl = logoUrl?.Trim();
            IsActive = isActive;
            UpdatedAt = DateTime.UtcNow;

            return Result.Updated;
        }

        public override Result<Deleted> Delete()
        {
            if (Products.Count > 0)
            {
                return BrandError.HasProducts;
            }

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

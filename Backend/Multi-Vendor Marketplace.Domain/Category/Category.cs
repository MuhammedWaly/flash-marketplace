using System;
using System.Collections.Generic;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.Category
{
    public class Category : AuditableEntity
    {
        public string Name { get; private set; } = string.Empty;
        public string Slug { get; private set; } = string.Empty;
        public string? Description { get; private set; }
        public string? ImageUrl { get; private set; }
        public bool IsActive { get; private set; } = true;
        public Guid? ParentCategoryId { get; private set; }
        public Category? ParentCategory { get; private set; }

        public ICollection<Category> SubCategories { get; private set; } = [];
        public ICollection<Product.Product> Products { get; private set; } = [];

        private Category()
        {
        }

        private Category(Guid id, string name, string slug, string? description, string? imageUrl, Guid? parentCategoryId)
            : base(id)
        {
            Name = name;
            Slug = slug;
            Description = description;
            ImageUrl = imageUrl;
            ParentCategoryId = parentCategoryId;
            IsActive = true;
        }

        public static Result<Category> Create(Guid id, string name, string slug, string? description = null, string? imageUrl = null, Guid? parentCategoryId = null)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return CategoryError.NameRequired;
            }

            if (string.IsNullOrWhiteSpace(slug))
            {
                return CategoryError.SlugRequired;
            }

            return new Category(id, name.Trim(), slug.Trim().ToLowerInvariant(), description?.Trim(), imageUrl?.Trim(), parentCategoryId);
        }

        public Result<Updated> Update(string name, string slug, string? description, string? imageUrl, Guid? parentCategoryId, bool isActive)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return CategoryError.NameRequired;
            }

            if (string.IsNullOrWhiteSpace(slug))
            {
                return CategoryError.SlugRequired;
            }

            Name = name.Trim();
            Slug = slug.Trim().ToLowerInvariant();
            Description = description?.Trim();
            ImageUrl = imageUrl?.Trim();
            ParentCategoryId = parentCategoryId;
            IsActive = isActive;
            UpdatedAt = DateTime.UtcNow;

            return Result.Updated;
        }

        public override Result<Deleted> Delete()
        {
            if (SubCategories.Count > 0)
            {
                return CategoryError.HasSubCategories;
            }

            if (Products.Count > 0)
            {
                return CategoryError.HasProducts;
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

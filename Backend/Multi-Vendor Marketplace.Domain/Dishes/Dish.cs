using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Resturants;
using System;
using System.Collections.Generic;
using System.Text;

namespace Multi_Vendor_Marketplace.Domain.Dishes
{
    public class Dish : AuditableEntity
    {
        public string Name { get; private set; } = default!;

        public string description { get; private set; } = default!;

        public decimal Price { get; private set; }
        
        public string? ImageUrl { get; private set; }

        public Resturant Resturant { get; private set; } = default!;

        public Guid ResturantId { get; private set; }

        private Dish()
        {
        }

        private Dish(Guid id, string name, string description, decimal price, Guid resturantId = default, string? imageUrl = null)
            : base(id)
        {
            Name = name;
            this.description = description;
            Price = price;
            ResturantId = resturantId;
            ImageUrl = imageUrl;
        }

        public const string DefaultImageUrl = "/uploads/dishes/default-dish.jpg";
        public const string DefaultSandwichUrl = "/uploads/dishes/default-sandwich.jpg";
        public const string DefaultCrepeUrl = "/uploads/dishes/default-crepe.jpg";

        public static string ResolveDefaultImage(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return DefaultImageUrl;
            }

            var lower = name.ToLowerInvariant();
            if (lower.Contains("ساندوتش") || lower.Contains("شاورما") || lower.Contains("برجر") || lower.Contains("sandwich") || lower.Contains("burger"))
            {
                return DefaultSandwichUrl;
            }
            if (lower.Contains("كريب") || lower.Contains("crepe"))
            {
                return DefaultCrepeUrl;
            }
            return DefaultImageUrl;
        }

        public static Result<Dish> Create(Guid id, string name, string description, decimal price, Guid resturantId = default, string? imageUrl = null)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return DishError.NameRequired;
            }
            if (string.IsNullOrWhiteSpace(description))
            {
                return DishError.DescriptionRequired;
            }
            if (price <= 0)
            {
                return DishError.PriceInvalid;
            }

            var resolvedImage = string.IsNullOrWhiteSpace(imageUrl) ? ResolveDefaultImage(name) : imageUrl.Trim();
            return new Dish(id, name.Trim(), description.Trim(), price, resturantId, resolvedImage);
        }

        public Result<Updated> Update(string name, string description, decimal price, string? imageUrl = null)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return DishError.NameRequired;
            }
            if (string.IsNullOrWhiteSpace(description))
            {
                return DishError.DescriptionRequired;
            }
            if (price <= 0)
            {
                return DishError.PriceInvalid;
            }
            Name = name.Trim();
            this.description = description.Trim();
            Price = price;
            if (imageUrl != null)
            {
                ImageUrl = string.IsNullOrWhiteSpace(imageUrl) ? null : imageUrl.Trim();
            }
            return Result.Updated;
        }
    }
}

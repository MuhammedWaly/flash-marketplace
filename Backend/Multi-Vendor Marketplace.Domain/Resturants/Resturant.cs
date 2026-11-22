using Multi_Vendor_Marketplace.Domain.Addres;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Dishes;
using Multi_Vendor_Marketplace.Domain.Resturants.Events;
using System;
using System.Collections.Generic;

namespace Multi_Vendor_Marketplace.Domain.Resturants
{
    public class Resturant : AuditableEntity
    {
        public string Name { get; private set; } = default!;
        public string Description { get; set; } = default!;
        public string category { get; set; } = default!;
        public string? LogoUrl { get; set; } 
        public string? CoverImageUrl { get; set; } 
        public string? PhoneNumber { get; set; } 
        public Address? Address { get; set; }

        public double? Latitude { get; private set; }
        public double? Longitude { get; private set; }
        public string? AddressTitle { get; private set; }
        public double DeliveryRadiusKm { get; private set; } = 10.0;
        public bool HasLocation => Latitude.HasValue && Longitude.HasValue;

        public bool IsOpen { get; private set; } = true;
        public decimal MinOrderValue { get; private set; } = 0.0m;

        public string OwnerId { get; private set; } = default!;

        public decimal AverageRating { get; private set; } = 0;
        public int ReviewCount { get; private set; } = 0;

        private readonly List<Dish>? _dishes = [];
        public IEnumerable<Dish>? Dishes => _dishes.AsReadOnly();

        private Resturant()
        {
        }

        private Resturant(Guid id, string name, string description, string category, string? logoUrl, string? coverImageUrl, string? phoneNumber, string ownerId)
            : base(id)
        {
            Name = name;
            Description = description;
            this.category = category;
            LogoUrl = logoUrl;
            CoverImageUrl = coverImageUrl;
            PhoneNumber = phoneNumber;
            OwnerId = ownerId;
        }

        public static Result<Resturant> Create(Guid id, string name, string description, string category, string? logoUrl, string? coverImageUrl, string? phoneNumber, string ownerId)
        {
            if (id == Guid.Empty)
            {
                return ResturantError.IdRequired;
            }

            if (string.IsNullOrWhiteSpace(name))
            {
                return ResturantError.NameRequired;
            }
            if (string.IsNullOrWhiteSpace(description))
            {
                return ResturantError.DescriptionRequired;
            }
            if (string.IsNullOrWhiteSpace(category))
            {
                return ResturantError.CategoryRequired;
            }
            if (string.IsNullOrWhiteSpace(ownerId))
            {
                return Error.Validation("Resturant.OwnerRequired", "Restaurant owner is required.");
            }

            var resturant = new Resturant(id, name.Trim(), description.Trim(), category.Trim(), logoUrl?.Trim(), coverImageUrl?.Trim(), phoneNumber, ownerId);
            resturant.RaiseDomainEvent(new ResturantCreatedEvent(resturant.Id, resturant.Name));

            return resturant;
        }

        public Result<Updated> Update(string name, string description, string category, string? logoUrl, string? coverImageUrl, string? phoneNumber)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return ResturantError.NameRequired;
            }
            if (string.IsNullOrWhiteSpace(description))
            {
                return ResturantError.DescriptionRequired;
            }
            if (string.IsNullOrWhiteSpace(category))
            {
                return ResturantError.CategoryRequired;
            }
            Name = name.Trim();
            Description = description.Trim();
            this.category = category.Trim();
            LogoUrl = logoUrl?.Trim();
            CoverImageUrl = coverImageUrl?.Trim();
            PhoneNumber = phoneNumber?.Trim();
            return Result.Updated;
        }

        public void UpdateRating(decimal averageRating, int reviewCount)
        {
            AverageRating = averageRating;
            ReviewCount = reviewCount;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateName(string name)
        {
            if (!string.IsNullOrWhiteSpace(name))
            {
                Name = name.Trim();
                UpdatedAt = DateTime.UtcNow;
            }
        }

        public void SetLocation(double latitude, double longitude, string? addressTitle, double deliveryRadiusKm = 10.0)
        {
            Latitude = latitude;
            Longitude = longitude;
            AddressTitle = string.IsNullOrWhiteSpace(addressTitle) ? "مقر المطعم" : addressTitle.Trim();
            DeliveryRadiusKm = deliveryRadiusKm > 0 ? deliveryRadiusKm : 10.0;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetOperatingSettings(bool isOpen, decimal minOrderValue, double? deliveryRadiusKm = null)
        {
            IsOpen = isOpen;
            MinOrderValue = Math.Max(0, minOrderValue);
            if (deliveryRadiusKm.HasValue && deliveryRadiusKm.Value > 0)
            {
                DeliveryRadiusKm = deliveryRadiusKm.Value;
            }
            UpdatedAt = DateTime.UtcNow;
        }
    }
}

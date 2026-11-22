using System;
using System.Collections.Generic;
using System.Net.Mail;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.Customer
{
    public class Customer : AuditableEntity
    {
        public string FirstName { get; private set; } = string.Empty;
        public string LastName { get; private set; } = string.Empty;
        public string Email { get; private set; } = string.Empty;
        public string PhoneNumber { get; private set; } = string.Empty;
        public bool IsActive { get; private set; } = true;

        public double? Latitude { get; private set; }
        public double? Longitude { get; private set; }
        public string? DeliveryAddressTitle { get; private set; }
        public bool HasDeliveryLocation => Latitude.HasValue && Longitude.HasValue;

        public string UserId { get; private set; } = default!;

        public ICollection<Addres.Address> Addresses { get; private set; } = [];
        public ICollection<Order.Order> Orders { get; private set; } = [];
        public ICollection<Review.Review> Reviews { get; private set; } = [];
        public Cart.Cart? Cart { get; private set; }

        private Customer()
        {
        }

        private Customer(Guid id, string firstName, string lastName, string email, string phoneNumber, string userId)
            : base(id)
        {
            FirstName = firstName;
            LastName = lastName;
            Email = email;
            PhoneNumber = phoneNumber;
            UserId = userId;
            IsActive = true;
        }

        public static Result<Customer> Create(Guid id, string firstName, string lastName, string email, string phoneNumber, string userId)
        {
            if (string.IsNullOrWhiteSpace(firstName))
            {
                return CustomerError.FirstNameRequired;
            }

            if (string.IsNullOrWhiteSpace(lastName))
            {
                return CustomerError.LastNameRequired;
            }

            if (string.IsNullOrWhiteSpace(email))
            {
                return CustomerError.EmailRequired;
            }

            if (!IsValidEmail(email))
            {
                return CustomerError.EmailInvalid;
            }

            if (string.IsNullOrWhiteSpace(phoneNumber))
            {
                return CustomerError.PhoneNumberRequired;
            }

            if (string.IsNullOrWhiteSpace(userId))
            {
                return Error.Validation("Customer.UserIdRequired", "User ID is required.");
            }

            return new Customer(id, firstName.Trim(), lastName.Trim(), email.Trim().ToLowerInvariant(), phoneNumber.Trim(), userId);
        }

        public Result<Updated> Update(string firstName, string lastName, string email, string phoneNumber, bool isActive)
        {
            if (string.IsNullOrWhiteSpace(firstName))
            {
                return CustomerError.FirstNameRequired;
            }

            if (string.IsNullOrWhiteSpace(lastName))
            {
                return CustomerError.LastNameRequired;
            }

            if (string.IsNullOrWhiteSpace(email))
            {
                return CustomerError.EmailRequired;
            }

            if (!IsValidEmail(email))
            {
                return CustomerError.EmailInvalid;
            }

            if (string.IsNullOrWhiteSpace(phoneNumber))
            {
                return CustomerError.PhoneNumberRequired;
            }

            FirstName = firstName.Trim();
            LastName = lastName.Trim();
            Email = email.Trim().ToLowerInvariant();
            PhoneNumber = phoneNumber.Trim();
            IsActive = isActive;
            UpdatedAt = DateTime.UtcNow;

            return Result.Updated;
        }

        public void SetDeliveryLocation(double latitude, double longitude, string? addressTitle)
        {
            Latitude = latitude;
            Longitude = longitude;
            DeliveryAddressTitle = string.IsNullOrWhiteSpace(addressTitle) ? "موقعي الحالي" : addressTitle.Trim();
            UpdatedAt = DateTime.UtcNow;
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

        private static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new MailAddress(email);
                return addr.Address == email.Trim();
            }
            catch
            {
                return false;
            }
        }
    }
}

using System;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Customer;
using Multi_Vendor_Marketplace.Domain.Resturants;

namespace Multi_Vendor_Marketplace.Domain.Addres
{
    public class Address : AuditableEntity
    {
        public Guid ResturantId { get; private set; }
        public Resturant? Resturant { get; private set; }

        public string Street { get; private set; } = string.Empty;
        public string City { get; private set; } = string.Empty;

        
       

        private Address()
        {
        }

        private Address(Guid id, Guid resturantId, string street, string city)
            : base(id)
        {
            ResturantId = resturantId;
            Street = street;
            City = city;
        }

        public static Result<Address> Create(Guid id, Guid resturantId, string street, string city)
        {
            if (resturantId == Guid.Empty)
            {
                return AddressError.ResturantRequired;
            }

            if (string.IsNullOrWhiteSpace(street))
            {
                return AddressError.StreetRequired;
            }

            if (string.IsNullOrWhiteSpace(city))
            {
                return AddressError.CityRequired;
            }

           
            return new Address(id, resturantId, street.Trim(), city.Trim());
        }

        public Result<Updated> Update(string street, string city)
        {
            if (string.IsNullOrWhiteSpace(street))
            {
                return AddressError.StreetRequired;
            }

            if (string.IsNullOrWhiteSpace(city))
            {
                return AddressError.CityRequired;
            }


            Street = street.Trim();
            City = city.Trim();
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

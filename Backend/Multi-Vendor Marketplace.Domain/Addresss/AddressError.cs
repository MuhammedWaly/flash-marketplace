using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.Addres
{
    public static class AddressError
    {
        public static Error NotFound =>
            Error.NotFound("Address_Not_Found", "Address was not found");

        public static Error ResturantRequired =>
            Error.Validation("Address_Resturant_Required", "Resturant ID is required");

        public static Error StreetRequired =>
            Error.Validation("Address_Street_Required", "Street is required");

        public static Error CityRequired =>
            Error.Validation("Address_City_Required", "City is required");

        public static Error CountryRequired =>
            Error.Validation("Address_Country_Required", "Country is required");
    }
}

using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.Customer
{
    public static class CustomerError
    {
        public static Error NotFound =>
            Error.NotFound("Customer_Not_Found", "Customer was not found");

        public static Error FirstNameRequired =>
            Error.Validation("Customer_FirstName_Required", "First name is required");

        public static Error LastNameRequired =>
            Error.Validation("Customer_LastName_Required", "Last name is required");

        public static Error EmailRequired =>
            Error.Validation("Customer_Email_Required", "Email is required");

        public static Error EmailInvalid =>
            Error.Validation("Customer_Email_Invalid", "Email is invalid");

        public static Error PhoneNumberRequired =>
            Error.Validation("Customer_PhoneNumber_Required", "Phone number is required");

        public static Error PhoneNumberInvalid =>
            Error.Validation("Customer_PhoneNumber_Invalid", "Phone number is invalid");

        public static Error EmailExists =>
            Error.Conflict("Customer_Email_Exists", "A customer with this email already exists");

        public static Error CannotDelete =>
            Error.Conflict("Customer_Cannot_Delete", "Customer cannot be deleted due to active orders");
    }
}

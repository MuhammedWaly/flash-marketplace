using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.Order
{
    public static class OrderError
    {
        public static Error NotFound =>
            Error.NotFound("Order_Not_Found", "Order was not found");

        public static Error OrderNumberRequired =>
            Error.Validation("Order_Number_Required", "Order number is required");

        public static Error CustomerRequired =>
            Error.Validation("Order_Customer_Required", "Customer ID is required");

        public static Error EmptyItems =>
            Error.Validation("Order_Empty_Items", "Order must contain at least one item");

        public static Error CannotDelete =>
            Error.Conflict("Order_Cannot_Delete", "Order cannot be deleted in its current status");

        public static Error InvalidStatusTransition =>
            Error.Conflict("Order_Invalid_Status_Transition", "Invalid order status transition");
    }
}

using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Domain.Review
{
    public static class ReviewError
    {
        public static Error NotFound =>
            Error.NotFound("Review_Not_Found", "Review was not found");

        public static Error TargetRequired =>
            Error.Validation("Review_Target_Required", "Either Restaurant ID or Dish ID is required");

        public static Error CustomerRequired =>
            Error.Validation("Review_Customer_Required", "Customer ID is required");

        public static Error RatingInvalid =>
            Error.Validation("Review_Rating_Invalid", "Rating must be between 1 and 5");

        public static Error CommentTooLong =>
            Error.Validation("Review_Comment_Too_Long", "Comment cannot exceed 1000 characters");

        public static Error NotVerifiedPurchase =>
            Error.Forbidden("Review_Not_Verified", "You can only review restaurants or dishes you have received a delivered order from");

        public static Error AlreadyReviewed =>
            Error.Conflict("Review_Already_Reviewed", "You have already reviewed this restaurant or dish");
    }
}

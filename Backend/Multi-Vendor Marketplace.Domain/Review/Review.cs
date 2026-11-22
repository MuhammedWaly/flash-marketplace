using System;
using Multi_Vendor_Marketplace.Domain.Common;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Customer;
using Multi_Vendor_Marketplace.Domain.Dishes;
using Multi_Vendor_Marketplace.Domain.Order;
using Multi_Vendor_Marketplace.Domain.Resturants;

namespace Multi_Vendor_Marketplace.Domain.Review
{
    public class Review : AuditableEntity
    {
        public Guid? ResturantId { get; private set; }
        public Resturant? Resturant { get; private set; }

        public Guid? DishId { get; private set; }
        public Dish? Dish { get; private set; }

        public Guid CustomerId { get; private set; }
        public Customer.Customer? Customer { get; private set; }

        public Guid? OrderId { get; private set; }
        public Order.Order? Order { get; private set; }

        public int Rating { get; private set; }
        public string? Comment { get; private set; }
        public bool IsVerifiedPurchase { get; private set; } = true;

        private Review()
        {
        }

        private Review(Guid id, Guid? resturantId, Guid? dishId, Guid customerId, Guid? orderId, int rating, string? comment, bool isVerifiedPurchase)
            : base(id)
        {
            ResturantId = resturantId;
            DishId = dishId;
            CustomerId = customerId;
            OrderId = orderId;
            Rating = rating;
            Comment = comment;
            IsVerifiedPurchase = isVerifiedPurchase;
        }

        public static Result<Review> Create(Guid id, Guid? resturantId, Guid? dishId, Guid customerId, Guid? orderId, int rating, string? comment = null, bool isVerifiedPurchase = true)
        {
            if (!resturantId.HasValue && !dishId.HasValue)
            {
                return ReviewError.TargetRequired;
            }

            if (customerId == Guid.Empty)
            {
                return ReviewError.CustomerRequired;
            }

            if (rating < 1 || rating > 5)
            {
                return ReviewError.RatingInvalid;
            }

            if (comment != null && comment.Length > 1000)
            {
                return ReviewError.CommentTooLong;
            }

            return new Review(id, resturantId, dishId, customerId, orderId, rating, comment?.Trim(), isVerifiedPurchase);
        }

        public Result<Updated> Update(int rating, string? comment)
        {
            if (rating < 1 || rating > 5)
            {
                return ReviewError.RatingInvalid;
            }

            if (comment != null && comment.Length > 1000)
            {
                return ReviewError.CommentTooLong;
            }

            Rating = rating;
            Comment = comment?.Trim();
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

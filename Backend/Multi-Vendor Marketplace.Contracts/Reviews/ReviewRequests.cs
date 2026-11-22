using System;

namespace Multi_Vendor_Marketplace.Contracts.Reviews
{
    public record CreateReviewRequest(
        Guid? ResturantId,
        Guid? DishId,
        Guid? OrderId,
        int Rating,
        string? Comment = null
    );

    public record UpdateReviewRequest(
        int Rating,
        string? Comment = null
    );

    public record ReviewResponse(
        Guid Id,
        Guid? ResturantId,
        string? ResturantName,
        Guid? DishId,
        string? DishName,
        Guid CustomerId,
        string CustomerName,
        Guid? OrderId,
        int Rating,
        string? Comment,
        bool IsVerifiedPurchase,
        DateTime CreatedAt
    );
}

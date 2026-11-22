using System;

namespace Multi_Vendor_Marketplace.Application.Features.Reviews.Dtos
{
    public record ReviewDto(
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

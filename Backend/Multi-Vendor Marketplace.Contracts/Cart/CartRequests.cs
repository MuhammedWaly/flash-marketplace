using System;

namespace Multi_Vendor_Marketplace.Contracts.Cart
{
    public record AddCartItemRequest(
        Guid ResturantId,
        Guid DishId,
        int Quantity = 1,
        bool OverrideExisting = false
    );

    public record UpdateCartItemRequest(
        int Quantity
    );
}

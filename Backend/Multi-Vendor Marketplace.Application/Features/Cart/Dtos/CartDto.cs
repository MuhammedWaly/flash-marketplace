using System;
using System.Collections.Generic;
using System.Linq;

namespace Multi_Vendor_Marketplace.Application.Features.Cart.Dtos
{
    public class CartDto
    {
        public string CustomerId { get; set; } = string.Empty;
        public Guid? ResturantId { get; set; }
        public string? ResturantName { get; set; }
        public List<CartItemDto> Items { get; set; } = [];
        public decimal TotalAmount => Items.Sum(i => i.TotalPrice);
        public int TotalItems => Items.Sum(i => i.Quantity);
    }

    public class CartItemDto
    {
        public Guid DishId { get; set; }
        public string DishName { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal TotalPrice => UnitPrice * Quantity;
        public string? ImageUrl { get; set; }
    }
}

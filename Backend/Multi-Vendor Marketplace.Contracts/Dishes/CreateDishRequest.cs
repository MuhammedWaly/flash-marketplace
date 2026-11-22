using System;
using System.Collections.Generic;
using System.Text;

namespace Multi_Vendor_Marketplace.Contracts.Dishes
{
    public class CreateDishRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }

    }
}

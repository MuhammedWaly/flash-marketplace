namespace Multi_Vendor_Marketplace.Contracts.Dishes
{
    public class UpdateDishRequest
    {
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
    }
}

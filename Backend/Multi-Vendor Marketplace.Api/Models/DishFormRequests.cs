using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Multi_Vendor_Marketplace.Api.Models
{
    public class CreateDishFormRequest
    {
        [Required]
        public string Name { get; set; } = default!;

        [Required]
        public string Description { get; set; } = default!;

        [Range(0.01, 100000.0)]
        public decimal Price { get; set; }

        public string? ImageUrl { get; set; }

        public IFormFile? Image { get; set; }
        public IFormFile? ImageFile { get; set; }
        public IFormFile? File { get; set; }

        public IFormFile? GetUploadFile() => Image ?? ImageFile ?? File;
    }

    public class UpdateDishFormRequest
    {
        [Required]
        public string Name { get; set; } = default!;

        [Required]
        public string Description { get; set; } = default!;

        [Range(0.01, 100000.0)]
        public decimal Price { get; set; }

        public string? ImageUrl { get; set; }

        public IFormFile? Image { get; set; }
        public IFormFile? ImageFile { get; set; }
        public IFormFile? File { get; set; }

        public IFormFile? GetUploadFile() => Image ?? ImageFile ?? File;
    }

    public class UploadRestaurantMediaFormRequest
    {
        public IFormFile? Logo { get; set; }
        public IFormFile? Cover { get; set; }
    }
}

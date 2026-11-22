using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Multi_Vendor_Marketplace.Contracts.Resturants
{
    public class CreateResturantRequest
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(250)]
        [Required]
        public string Description { get; set; }

        [StringLength(100)]
        [Required]  
        public string Category { get; set; }
        [Url]
        public string? LogoUrl { get; set; }
        [Url]
        public string? CoverImageUrl { get; set; }
       
        [Required(ErrorMessage = "PhoneNumber is required.")]
        [RegularExpression(@"^\+?\d{7,15}$", ErrorMessage = "Phone number must be 7–15 digits and may start with '+'.")]
        public string? PhoneNumber { get; set; }


    }
}

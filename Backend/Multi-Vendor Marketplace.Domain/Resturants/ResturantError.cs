using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;
using System.Collections.Generic;
using System.Text;

namespace Multi_Vendor_Marketplace.Domain.Resturants
{
    public class ResturantError
    {
        public static Error IdRequired =>
            Error.Validation("Resturant_Id_Required", "Resturant ID is required");

        public static Error NotFound =>
            Error.NotFound("Resturant_Not_Found", "Resturant was not found");

        public static Error NameRequired =>
            Error.Validation("Resturant_Name_Required", "Resturant name is required");

        public static Error DescriptionRequired =>
            Error.Validation("Resturant_Description_Required", "Resturant description is required");

        public static Error CategoryRequired =>
            Error.Validation("Resturant_Category_Required", "Resturant category is required");
    }
}

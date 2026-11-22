using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;
using System.Collections.Generic;
using System.Text;

namespace Multi_Vendor_Marketplace.Domain.Dishes
{
    public class DishError
    {
        public static Error NotFound =>
            Error.NotFound("Dish_Not_Found", "Dish was not found");
        public static Error NameRequired =>
            Error.Validation("Dish_Name_Required", "Dish name is required");
        public static Error DescriptionRequired =>
            Error.Validation("Dish_Description_Required", "Dish description is required");
        public static Error PriceInvalid =>
            Error.Validation("Dish_Price_Invalid", "Dish price is invalid");
        public static Error ResturantNotFound =>
            Error.NotFound("Dish_Resturant_NotFound", "Restaurant was not found");
    }
}

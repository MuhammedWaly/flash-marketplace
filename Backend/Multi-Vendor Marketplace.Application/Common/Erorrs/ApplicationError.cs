using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;
using System.Collections.Generic;
using System.Text;

namespace Multi_Vendor_Marketplace.Application.Common.Erorrs
{
    public static class ApplicationError
    {
        public static Error ResrurantNotFound =>
            Error.NotFound("Resturant_Not_Found", "Resturant was not found");

        public static Error DishNotFound =>
            Error.NotFound("Dish_Not_Found", "Dish was not found");

       

    }
}

using Multi_Vendor_Marketplace.Application.Features.Dishes.Dtos;
using Multi_Vendor_Marketplace.Domain.Dishes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Multi_Vendor_Marketplace.Application.Features.Dishes.Mappers
{
    public static class DishMapper
    {
        public static DishDto ToDto(this Dish dish)
        {
            return new DishDto
            {
                Id = dish.Id,
                Name = dish.Name,
                Description = dish.description,
                Price = dish.Price,
                ImageUrl = dish.ImageUrl,
                ResturantId = dish.ResturantId
            };
        }

        public static List<DishDto> ToDto(this IEnumerable<Dish> dishes)
        {
            return dishes.Select(d => d.ToDto()).ToList();
        }
    }
}

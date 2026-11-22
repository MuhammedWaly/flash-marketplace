using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Dishes.Dtos;
using Multi_Vendor_Marketplace.Application.Features.Dishes.Mappers;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Dishes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Multi_Vendor_Marketplace.Application.Features.Dishes.Quries.GetDishByIdForResturant
{
    public class GetDishByIdForResturantHandler(IAppDbContext context) : IRequestHandler<GetDishByIdForResturantQuery, Result<DishDto>>
    {
        private readonly IAppDbContext _context = context;

        public async Task<Result<DishDto>> Handle(GetDishByIdForResturantQuery query, CancellationToken cancellationToken)
        {
            var dish = await _context.Dishes
                .FirstOrDefaultAsync(d => d.Id == query.DishId && d.ResturantId == query.ResturantId, cancellationToken);

            if (dish is null)
            {
                return DishError.NotFound;
            }

            return dish.ToDto();
        }
    }
}

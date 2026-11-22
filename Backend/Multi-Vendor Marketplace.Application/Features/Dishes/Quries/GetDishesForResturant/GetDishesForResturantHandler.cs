using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Dishes.Dtos;
using Multi_Vendor_Marketplace.Application.Features.Dishes.Mappers;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Dishes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Multi_Vendor_Marketplace.Application.Features.Dishes.Quries.GetDishesForResturant
{
    public class GetDishesForResturantHandler(IAppDbContext context) : IRequestHandler<GetDishesForResturantQuery, Result<List<DishDto>>>
    {
        private readonly IAppDbContext _context = context;

        public async Task<Result<List<DishDto>>> Handle(GetDishesForResturantQuery query, CancellationToken cancellationToken)
        {
            var resturantExists = await _context.Resturants
                .AnyAsync(r => r.Id == query.ResturantId, cancellationToken);

            if (!resturantExists)
            {
                return DishError.ResturantNotFound;
            }

            var dishes = await _context.Dishes
                .Where(d => d.ResturantId == query.ResturantId)
                .ToListAsync(cancellationToken);

            return dishes.ToDto();
        }
    }
}

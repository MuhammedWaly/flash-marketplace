using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Resturants.Dtos;
using Multi_Vendor_Marketplace.Application.Features.Resturants.Mappers;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using Multi_Vendor_Marketplace.Domain.Resturants;
using System;
using System.Collections.Generic;
using System.Text;

namespace Multi_Vendor_Marketplace.Application.Features.Resturants.Quries.GetResturantById
{
    public class GetResturantByIdHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<GetResturantByIdQuery, Result<ResturantDto>>
    {
        private readonly IAppDbContext _context = context;
        private readonly ICurrentUserService _currentUserService = currentUserService;

        public async Task<Result<ResturantDto>> Handle(GetResturantByIdQuery query, CancellationToken cancellationToken)
        {

            var merchantQuery = _context.Merchants
              .Where(m => m.IsActive)
              .AsNoTracking();

            var resturant = await _context.Resturants
                .Where( r => merchantQuery.Any(m => m.UserId == r.OwnerId ))
                .Include(r => r.Dishes)
                .FirstOrDefaultAsync(r => r.Id == query.Id, cancellationToken);

            if (resturant is null)
            {
                return ResturantError.NotFound;
            }

            double? custLat = query.UserLat;
            double? custLng = query.UserLng;

            if (!custLat.HasValue && !string.IsNullOrWhiteSpace(_currentUserService.UserId))
            {
                var customer = await _context.Customers
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.UserId == _currentUserService.UserId, cancellationToken);

                if (customer != null && customer.Latitude.HasValue && customer.Longitude.HasValue)
                {
                    custLat = customer.Latitude.Value;
                    custLng = customer.Longitude.Value;
                }
            }

            var dto = resturant.ToDto(custLat, custLng);

          
                
            var merchant = await merchantQuery.FirstOrDefaultAsync(m => m.UserId == resturant.OwnerId, cancellationToken);

            dto.HasStripeEnabled = merchant != null &&
                                   !string.IsNullOrWhiteSpace(merchant.StripeAccountId) &&
                                   merchant.IsStripeChargesEnabled;

            return dto;
        }
    }
}

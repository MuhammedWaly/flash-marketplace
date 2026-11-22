using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Common.Models;
using Multi_Vendor_Marketplace.Application.Features.Reviews.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Reviews.Queries.GetRestaurantReviews
{
    public class GetRestaurantReviewsQueryHandler(IAppDbContext context) : IRequestHandler<GetRestaurantReviewsQuery, Result<PagedResult<ReviewDto>>>
    {
        public async Task<Result<PagedResult<ReviewDto>>> Handle(GetRestaurantReviewsQuery request, CancellationToken cancellationToken)
        {
            var pageNumber = request.PageNumber > 0 ? request.PageNumber : 1;
            var pageSize = request.PageSize > 0 ? request.PageSize : 10;

            var query = context.Reviews
                .AsNoTracking()
                .Where(r => r.ResturantId == request.ResturantId);

            var totalCount = await query.CountAsync(cancellationToken);

            var reviews = await query
                .Include(r => r.Customer)
                .Include(r => r.Resturant)
                .Include(r => r.Dish)
                .OrderByDescending(r => r.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new ReviewDto(
                    r.Id,
                    r.ResturantId,
                    r.Resturant != null ? r.Resturant.Name : null,
                    r.DishId,
                    r.Dish != null ? r.Dish.Name : null,
                    r.CustomerId,
                    $"{r.Customer!.FirstName} {r.Customer.LastName}".Trim(),
                    r.OrderId,
                    r.Rating,
                    r.Comment,
                    r.IsVerifiedPurchase,
                    r.CreatedAt
                ))
                .ToListAsync(cancellationToken);

            return new PagedResult<ReviewDto>(reviews, totalCount, pageNumber, pageSize);
        }
    }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Search.Queries.GetCategories
{
    public class GetSearchCategoriesQueryHandler(IAppDbContext context) : IRequestHandler<GetSearchCategoriesQuery, Result<List<string>>>
    {
        public async Task<Result<List<string>>> Handle(GetSearchCategoriesQuery request, CancellationToken cancellationToken)
        {
            var rawCategories = await context.Resturants
                .AsNoTracking()
                .Where(r => !string.IsNullOrWhiteSpace(r.category))
                .Select(r => r.category.Trim())
                .Distinct()
                .ToListAsync(cancellationToken);

            var sanitizedCategories = rawCategories
                .Where(c => !string.IsNullOrWhiteSpace(c)
                            && !c.Equals("string", StringComparison.OrdinalIgnoreCase)
                            && !c.Equals("test", StringComparison.OrdinalIgnoreCase)
                            && !c.Equals("null", StringComparison.OrdinalIgnoreCase)
                            && !c.Equals("undefined", StringComparison.OrdinalIgnoreCase)
                            && c.Length >= 2)
                .OrderBy(c => c)
                .ToList();

            return sanitizedCategories;
        }
    }
}

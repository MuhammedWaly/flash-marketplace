using MediatR;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System.Collections.Generic;

namespace Multi_Vendor_Marketplace.Application.Features.Search.Queries.GetCategories
{
    public record GetSearchCategoriesQuery : IRequest<Result<List<string>>>;
}

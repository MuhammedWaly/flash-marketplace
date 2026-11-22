using MediatR;
using Multi_Vendor_Marketplace.Domain.Common.Result;

namespace Multi_Vendor_Marketplace.Application.Features.Admin.Finance.Queries.GetFinanceOverview
{
    public record GetFinanceOverviewQuery : IRequest<Result<FinanceOverviewDto>>;
}

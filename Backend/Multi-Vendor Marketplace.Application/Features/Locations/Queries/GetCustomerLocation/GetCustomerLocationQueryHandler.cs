using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Locations.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Locations.Queries.GetCustomerLocation
{
    public class GetCustomerLocationQueryHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<GetCustomerLocationQuery, Result<CustomerLocationDto>>
    {
        public async Task<Result<CustomerLocationDto>> Handle(GetCustomerLocationQuery request, CancellationToken cancellationToken)
        {
            var userId = currentUserService.UserId;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Error.Unauthorized("User.Unauthorized", "User is not authenticated.");
            }

            var customer = await context.Customers
                .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);

            if (customer is null)
            {
                return Error.NotFound("Customer.NotFound", "Customer profile was not found.");
            }

            return new CustomerLocationDto(
                customer.HasDeliveryLocation,
                customer.Latitude,
                customer.Longitude,
                customer.DeliveryAddressTitle
            );
        }
    }
}

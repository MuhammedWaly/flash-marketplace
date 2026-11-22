using MediatR;
using Microsoft.EntityFrameworkCore;
using Multi_Vendor_Marketplace.Application.Common.Interfaces;
using Multi_Vendor_Marketplace.Application.Features.Locations.Dtos;
using Multi_Vendor_Marketplace.Domain.Common.Result;
using System.Threading;
using System.Threading.Tasks;

namespace Multi_Vendor_Marketplace.Application.Features.Locations.Commands.SetCustomerLocation
{
    public class SetCustomerLocationCommandHandler(
        IAppDbContext context,
        ICurrentUserService currentUserService) : IRequestHandler<SetCustomerLocationCommand, Result<CustomerLocationDto>>
    {
        public async Task<Result<CustomerLocationDto>> Handle(SetCustomerLocationCommand command, CancellationToken cancellationToken)
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

            customer.SetDeliveryLocation(command.Latitude, command.Longitude, command.AddressTitle);
            await context.SaveChangesAsync(cancellationToken);

            return new CustomerLocationDto(
                customer.HasDeliveryLocation,
                customer.Latitude,
                customer.Longitude,
                customer.DeliveryAddressTitle
            );
        }
    }
}

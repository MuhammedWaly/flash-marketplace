using MediatR;
using Microsoft.Extensions.Logging;
using Multi_Vendor_Marketplace.Domain.Resturants.Events;

namespace Multi_Vendor_Marketplace.Application.Features.Resturants.Events
{
    public class ResturantCreatedEventHandler(ILogger<ResturantCreatedEventHandler> logger) : INotificationHandler<ResturantCreatedEvent>
    {
        public Task Handle(ResturantCreatedEvent notification, CancellationToken cancellationToken)
        {
            logger.LogInformation("Domain Event Handled: Restaurant '{ResturantName}' (Id: {ResturantId}) was created successfully.",
                notification.Name,
                notification.ResturantId);

            return Task.CompletedTask;
        }
    }
}

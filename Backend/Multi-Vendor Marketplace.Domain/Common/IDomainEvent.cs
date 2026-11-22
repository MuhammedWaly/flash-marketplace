using MediatR;

namespace Multi_Vendor_Marketplace.Domain.Common
{
    public interface IDomainEvent : INotification
    {
        Guid EventId => Guid.NewGuid();
        DateTime OccurredOn => DateTime.UtcNow;
    }
}

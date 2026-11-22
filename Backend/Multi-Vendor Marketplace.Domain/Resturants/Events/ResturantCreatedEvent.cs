using Multi_Vendor_Marketplace.Domain.Common;

namespace Multi_Vendor_Marketplace.Domain.Resturants.Events;

public record ResturantCreatedEvent(Guid ResturantId, string Name) : IDomainEvent;

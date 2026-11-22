using System;

namespace Multi_Vendor_Marketplace.Domain.Payments
{
    public class ProcessedWebhookEvent
    {
        public string EventId { get; private set; } = string.Empty;
        public string EventType { get; private set; } = string.Empty;
        public DateTime ProcessedAt { get; private set; } = DateTime.UtcNow;

        private ProcessedWebhookEvent()
        {
        }

        public ProcessedWebhookEvent(string eventId, string eventType)
        {
            EventId = eventId;
            EventType = eventType;
            ProcessedAt = DateTime.UtcNow;
        }
    }
}

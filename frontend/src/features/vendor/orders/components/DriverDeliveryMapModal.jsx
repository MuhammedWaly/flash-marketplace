import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { Modal, Button } from '../../../../components/ui';

/**
 * DriverDeliveryMapModal Component
 * Interactive modal showing customer delivery location on Leaflet map
 */
export function DriverDeliveryMapModal({
  order,
  mapContainerRef,
  onClose,
  onCopyForDelivery,
}) {
  if (!order) return null;

  const orderId = order.orderNumber || order.orderId || order.id;
  const lat = order.deliveryLocation?.latitude || order.latitude || order.lat || 30.0382;
  const lng = order.deliveryLocation?.longitude || order.longitude || order.lng || 31.2117;
  const address =
    order.shippingAddress ||
    order.deliveryAddress ||
    order.deliveryLocation?.addressTitle ||
    order.addressTitle ||
    'موقع محدد بالدبوس على الخريطة';
  const customer = order.customerName || order.customer || 'عميل';
  const phone = order.customerPhone || order.phone || '';

  return (
    <Modal
      isOpen={!!order}
      onClose={onClose}
      title={`موقع توصيل الطلب #${orderId}`}
      size="lg"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <div className="text-right">
            <span className="text-[11px] text-ink-muted block">العميل:</span>
            <span className="text-xs font-semibold text-ink">
              {customer} • <span dir="ltr">{phone}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <ExternalLink size={13} />
              <span>فتح في Google Maps</span>
            </a>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onCopyForDelivery(order)}
            >
              نسخ للطيار
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {/* تفاصيل العنوان المحدد بالدبوس */}
        <div className="p-3 bg-paper rounded-xl border border-rule flex items-start gap-2.5">
          <MapPin size={18} className="text-accent flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] text-ink-muted block">عنوان استلام العميل:</span>
            <span className="text-xs font-bold text-ink">{address}</span>
            <span className="text-[10px] text-ink-faint block mt-0.5">
              الإحداثيات: {lat}، {lng}
            </span>
          </div>
        </div>

        {/* الخريطة التفاعلية لموقع العميل */}
        <div className="relative w-full h-80 bg-paper-subtle rounded-xl border border-rule overflow-hidden shadow-inner">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>
      </div>
    </Modal>
  );
}

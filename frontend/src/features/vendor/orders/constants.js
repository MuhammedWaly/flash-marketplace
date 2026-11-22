import L from 'leaflet';

export const STATUS_TABS = [
  { value: 'all', label: 'جميع الطلبات' },
  { value: 'pending', label: 'معلقة (Pending)' },
  { value: 'preparing', label: 'جاري التحضير (Preparing)' },
  { value: 'active', label: 'نشطة ومخرجة (Active)' },
  { value: 'delivered', label: 'تم التسليم (Delivered)' },
  { value: 'cancelled', label: 'ملغاة (Cancelled)' },
];

export const UPDATE_STATUSES = [
  { value: 'Confirmed', label: 'تأكيد الطلب (Confirmed)' },
  { value: 'Preparing', label: 'بدء التحضير (Preparing)' },
  { value: 'Shipped', label: 'خرج مع المندوب (Shipped)' },
  { value: 'Delivered', label: 'تم التسليم بنجاح (Delivered)' },
  { value: 'Cancelled', label: 'إلغاء الطلب (Cancelled)' },
];

// دبوس موقع العميل باللون persimmon
export const createCustomerPinIcon = () =>
  L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
        <div style="background-color: #C44D26; color: white; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; font-family: 'Readex Pro', sans-serif; white-space: nowrap; margin-bottom: 2px;">
          موقع العميل 🛵
        </div>
        <div style="width: 20px; height: 20px; background-color: #C44D26; border: 3px solid #FDFDFB; border-radius: 50%;"></div>
        <div style="width: 2px; height: 12px; background-color: #C44D26; margin-top: -1px;"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

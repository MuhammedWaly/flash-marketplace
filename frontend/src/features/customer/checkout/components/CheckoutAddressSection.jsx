import React from 'react';

/**
 * CheckoutAddressSection Component
 * Customer address details and notes for courier
 */
export function CheckoutAddressSection({
  selectedLocation,
  restaurantName,
  addressDetails,
  onAddressDetailsChange,
  onOpenLocationModal,
}) {
  return (
    <section className="bg-surface border border-rule rounded-xl p-5 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-ink">عنوان التوصيل المحدد بالدبوس</h2>
        <button
          type="button"
          onClick={onOpenLocationModal}
          className="text-xs text-accent hover:underline font-medium cursor-pointer"
        >
          تغيير الموقع الجغرافي
        </button>
      </div>

      <div className="p-3 bg-paper rounded-lg border border-rule text-xs">
        <p className="font-semibold text-ink">
          {selectedLocation?.addressName || 'موقعك المحدد على الخريطة'}
        </p>
        {restaurantName && (
          <span className="text-ink-faint block mt-0.5 tabular-nums">
            طلب مباشر من مطبخ: {restaurantName}
          </span>
        )}
      </div>

      <div>
        <label className="block text-[11px] font-medium text-ink-muted mb-1">
          تفاصيل إضافية للعنوان أو ملاحظات للسائق (اختياري):
        </label>
        <input
          type="text"
          value={addressDetails}
          onChange={(e) => onAddressDetailsChange(e.target.value)}
          placeholder="مثال: عمارة 14، الدور الثالث، شقة 5 أمام المسجد"
          className="w-full text-xs p-2.5 bg-paper rounded-lg border border-rule focus:outline-none focus:border-accent text-ink"
        />
      </div>

      <p className="text-[11px] text-ink-faint">
        التوصيل يتم وفقاً للإحداثيات الجغرافية المحددة بالدبوس على الخريطة وملاحظات العنوان.
      </p>
    </section>
  );
}

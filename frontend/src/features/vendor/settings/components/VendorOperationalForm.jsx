import React from "react";

/**
 * VendorOperationalForm Component
 * Controls for opening/closing the store, delivery radius slider, and minimum order value.
 */
export function VendorOperationalForm({
  isOpen,
  deliveryRadiusKm,
  minOrderValue,
  onIsOpenChange,
  onDeliveryRadiusChange,
  onMinOrderValueChange,
}) {
  return (
    <>
      {/* ── Section: Store Open/Closed Status ── */}
      <section className="bg-surface border border-rule rounded-xl p-5 space-y-4 shadow-2xs">
        <h2 className="text-xs font-bold text-ink pb-2 border-b border-rule">
          حالة استقبال الطلبات
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-ink block">
              فتح / إغلاق المطبخ
            </span>
            <span className="text-[11px] text-ink-muted">
              عند الإغلاق، سيظهر المطعم كـ "مغلق مؤقتاً" للزبائن ولا يمكنهم الطلب منه
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isOpen}
              onChange={(e) => onIsOpenChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-paper-subtle peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </section>

      {/* ── Section: Operating Rules & Delivery Radius ── */}
      <section className="bg-surface border border-rule rounded-xl p-5 space-y-4 shadow-2xs">
        <h2 className="text-xs font-bold text-ink pb-2 border-b border-rule">
          نطاق التوصيل والحد الأدنى للطلب
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-ink">
                نصف قطر دائرة التوصيل (كم)
              </label>
              <span className="text-xs font-bold text-accent tabular-nums">
                {deliveryRadiusKm} كم
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="0.5"
              value={deliveryRadiusKm}
              onChange={(e) => onDeliveryRadiusChange(parseFloat(e.target.value) || 1)}
              className="w-full accent-accent cursor-pointer"
            />
            <span className="text-[11px] text-ink-muted block">
              الزبائن خارج هذه الدائرة لن يتمكنوا من إتمام الطلب وسيرى الزبون تنبيهاً ببعد المسافة
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-ink block">
              الحد الأدنى لقيمة الطلب (ج.م)
            </label>
            <input
              type="number"
              min="0"
              step="5"
              value={minOrderValue}
              onChange={(e) => onMinOrderValueChange(parseFloat(e.target.value) || 0)}
              className="w-full text-xs p-2.5 bg-paper rounded-lg border border-rule focus:outline-none focus:border-accent focus:bg-surface text-ink transition-colors tabular-nums mt-1"
            />
            <span className="text-[11px] text-ink-muted block">
              أقل مبلغ يجب أن يطلبه الزبون من مطعمك لإتمام عملية الدفع
            </span>
          </div>
        </div>
      </section>
    </>
  );
}

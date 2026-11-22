import React from "react";
import { Loader2, Navigation } from "lucide-react";

/**
 * VendorLocationMap Component
 * Interactive Leaflet map container with restaurant pin, delivery radius circle, coordinates inputs,
 * and GPS current location button.
 */
export function VendorLocationMap({
  mapContainerRef,
  isGeocoding,
  latitude,
  longitude,
  addressTitle,
  onLatitudeChange,
  onLongitudeChange,
  onAddressTitleChange,
  onUseCurrentLocation,
}) {
  return (
    <section className="bg-surface border border-rule rounded-xl p-5 space-y-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-rule">
        <div>
          <h2 className="text-xs font-bold text-ink">
            موقع الفرع على الخريطة (Pin Location)
          </h2>
          <p className="text-[11px] text-ink-muted mt-0.5">
            انقر على الخريطة أو اسحب الدبوس لتحديد نقطة مطبخك بالضبط، والدائرة
            الحمراء توضح نطاق التوصيل
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isGeocoding && (
            <span className="text-[11px] text-accent flex items-center gap-1 font-medium">
              <Loader2 size={12} className="animate-spin" />
              <span>جاري قراءة المنطقة…</span>
            </span>
          )}

          {onUseCurrentLocation && (
            <button
              type="button"
              onClick={onUseCurrentLocation}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-paper border border-rule hover:border-accent rounded-lg text-xs font-semibold text-ink transition-colors cursor-pointer shadow-2xs"
              title="تحديد إحداثيات موقعك الحالي عبر GPS"
            >
              <Navigation size={13} className="text-accent" />
              <span>موقعي الحالي (GPS)</span>
            </button>
          )}
        </div>
      </div>

      {/* الخريطة التفاعلية مع زر عائم للـ GPS */}
      <div className="relative w-full h-80 bg-paper-subtle rounded-xl border border-rule overflow-hidden shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div>
          <label className="text-xs font-semibold text-ink block mb-1.5">
            خط العرض (Latitude)
          </label>
          <input
            type="number"
            step="0.00001"
            value={latitude}
            onChange={(e) => onLatitudeChange(parseFloat(e.target.value) || 0)}
            className="w-full text-xs p-2.5 bg-paper rounded-lg border border-rule focus:outline-none focus:border-accent focus:bg-surface text-ink transition-colors tabular-nums"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink block mb-1.5">
            خط الطول (Longitude)
          </label>
          <input
            type="number"
            step="0.00001"
            value={longitude}
            onChange={(e) => onLongitudeChange(parseFloat(e.target.value) || 0)}
            className="w-full text-xs p-2.5 bg-paper rounded-lg border border-rule focus:outline-none focus:border-accent focus:bg-surface text-ink transition-colors tabular-nums"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink block mb-1.5">
            عنوان المقر المكتوب
          </label>
          <input
            type="text"
            value={addressTitle}
            onChange={(e) => onAddressTitleChange(e.target.value)}
            placeholder="مثال: الدقي، شارع التحرير"
            className="w-full text-xs p-2.5 bg-paper rounded-lg border border-rule focus:outline-none focus:border-accent focus:bg-surface text-ink transition-colors"
          />
        </div>
      </div>
    </section>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { getFullImageUrl } from "../../../utils/imageUrl";

/**
 * Editorial Food Marketplace Restaurant Card
 * تعرض بيانات المطعم الحقيقية القادمة من الـ API بدون أي أرقام وهمية مصطنعة
 */
export function RestaurantCard({ restaurant }) {
  if (!restaurant) return null;

  const {
    id,
    name,
    cuisine,
    category,
    logoUrl,
    coverImageUrl,
    rating = restaurant.averageRating || null,
    reviewsCount = restaurant.reviewCount || null,
    deliveryTimeMinutes = restaurant.estimatedDeliveryTime || null,
    deliveryFee = restaurant.deliveryFee !== undefined
      ? restaurant.deliveryFee
      : null,
    distanceKm = restaurant.distance || null,
    isDeliverable = restaurant.isDeliverable !== undefined
      ? restaurant.isDeliverable
      : true,
  } = restaurant;

  // الحرف الأول للشعار كرمز فني
  const brandInitial = name ? name.trim().charAt(0) : "م";

  // استخراج التخصصات من النص
  const specialties =
    cuisine || category
      ? (cuisine || category)
          .split(/[،,]/)
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 3)
      : [];

  const logoSrc = getFullImageUrl(logoUrl || coverImageUrl);

  return (
    <article
      className={`group bg-surface rounded-xl border border-rule transition-[border-color,box-shadow,transform] duration-150 hover:border-rule-strong hover:shadow-sm flex flex-col justify-between p-5 relative ${
        !isDeliverable ? "opacity-75" : ""
      }`}
    >
      <div>
        {/* ── Top Header: Logo/Monogram, Status, & Rating ── */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* الشعار الحقيقي أو الرمز المميز */}
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={name}
                className="w-12 h-12 rounded-lg object-cover border border-rule flex-shrink-0 bg-paper"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-paper-subtle border border-rule flex items-center justify-center text-accent font-bold text-lg flex-shrink-0 group-hover:bg-accent-light group-hover:border-accent/30 transition-colors">
                {brandInitial}
              </div>
            )}

            <div>
              <h3 className="text-base font-bold text-ink group-hover:text-accent transition-colors line-clamp-1 leading-snug">
                <Link to={`/restaurant/${id}`} className="hover:underline">
                  {name}
                </Link>
              </h3>

              <div className="flex items-center gap-1.5 mt-0.5">
                {rating ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink bg-paper-subtle px-2 py-0.5 rounded border border-rule/60 tabular-nums">
                      <svg
                        className="text-amber-600 flex-shrink-0"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span>{Number(rating).toFixed(1)}</span>
                    </span>
                    {reviewsCount && (
                      <span className="text-[11px] text-ink-faint tabular-nums">
                        ({reviewsCount} تقييم)
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[11px] font-medium text-ink-muted bg-paper px-2 py-0.5 rounded border border-rule">
                    مطعم مسجل
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Deliverability Badge */}
          <div className="w-30">
            {isDeliverable ? (
              <span
                style={{ width: "100%", justifyContent: "center" }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                توصيل متاح
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-paper-subtle text-ink-muted border border-rule">
                خارج النطاق
              </span>
            )}
          </div>
        </div>

        {/* ── Cuisine / Category Pills ── */}
        {specialties.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-4 min-h-[26px]">
            {specialties.map((item, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-paper rounded-md text-[11px] font-medium text-ink-secondary border border-rule/70"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Key Metrics Bar & CTA ── */}
      <div className="pt-3 border-t border-rule mt-auto">
        <div className="flex items-center justify-between py-1 text-xs text-ink-muted gap-2">
          {deliveryTimeMinutes ? (
            <div className="flex items-center gap-1.5">
              <svg
                className="text-ink-faint flex-shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="tabular-nums font-medium text-ink">
                {deliveryTimeMinutes} دقيقة
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-ink-faint">تحضير مباشر</span>
          )}

          {deliveryFee !== null ? (
            <div className="flex items-center gap-1.5">
              <svg
                className="text-ink-faint flex-shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
              <span className="tabular-nums font-medium text-ink">
                {Number(deliveryFee).toFixed(0)} ج.م توصيل
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-ink-faint">حسب العنوان</span>
          )}

          {distanceKm ? (
            <div className="flex items-center gap-1.5">
              <svg
                className="text-ink-faint flex-shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="tabular-nums font-medium text-ink">
                {distanceKm} كم
              </span>
            </div>
          ) : null}
        </div>

        {/* Action Link */}
        <div className="mt-3">
          <Link
            to={`/restaurant/${id}`}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-accent bg-accent-light/50 hover:bg-accent hover:text-white border border-accent/20 transition-colors cursor-pointer"
          >
            <span>قائمة الوجبات والأسعار</span>
            <svg
              className="rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

import React from "react";
import { Star, Clock, Share2 } from "lucide-react";
import { DEFAULT_COVER, DEFAULT_LOGO, getFullImageUrl } from "../constants";

/**
 * RestaurantHeroCover Component
 * The appetizing cinematic cover banner with Ken Burns zoom, warm steam glow,
 * elevated restaurant logo, badges, and quick stats.
 */
export function RestaurantHeroCover({
  restaurant,
  reviewsCount = 0,
  currentRating = 5,
  onReviewsClick,
}) {
  if (!restaurant) return null;

  // دعم كاش الـ localStorage الفوري كـ Fallback في حالة تعديل صاحب المطعم مؤخراً
  let cachedMedia = {};
  try {
    const raw = localStorage.getItem(`vendor_media_${restaurant.id}`);
    if (raw) cachedMedia = JSON.parse(raw);
  } catch {}

  const coverSrc = getFullImageUrl(
    restaurant.coverImageUrl || cachedMedia.coverImageUrl,
    DEFAULT_COVER,
  );
  const logoSrc = getFullImageUrl(
    restaurant.logoUrl || cachedMedia.logoUrl,
    DEFAULT_LOGO,
  );

  return (
    <section className="relative w-full bg-ink overflow-hidden border-b border-rule">
      {/* Cover Image Container with Ken Burns Slow Zoom & Warm Sizzle */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden select-none">
        <img
          src={coverSrc}
          alt={restaurant.name}
          className="w-full h-full object-cover animate-ken-burns transform-gpu origin-center"
          onError={(e) => {
            if (e.currentTarget.src !== DEFAULT_COVER) {
              e.currentTarget.src = DEFAULT_COVER;
            }
          }}
        />

        {/* Ambient Warm Glow & Shimmering Heat Waves (Appetizing Effect) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/35 via-transparent to-rose-700/25 mix-blend-color-dodge pointer-events-none animate-warm-glow" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-radial-[at_50%_75%] from-amber-500/20 via-transparent to-transparent pointer-events-none animate-steam-shimmer" />

        {/* Top Floating Action Pill (Share) */}
        <div className="absolute top-4 left-4 z-20">
          <button
            type="button"
            className="backdrop-blur-md bg-black/40 hover:bg-black/60 text-white border border-white/20 text-xs px-3.5 py-1.5 rounded-full cursor-pointer flex items-center gap-1.5 shadow-lg transition-all"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert("تم نسخ رابط المطعم بنجاح.");
            }}
          >
            <Share2 className="w-3.5 h-3.5 text-amber-300" />
            مشاركة الرابط
          </button>
        </div>
      </div>

      {/* Foreground Restaurant Details Overlay */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative -mt-16 sm:-mt-20 z-20 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-end gap-4 sm:gap-5">
            {/* Restaurant Logo / Profile Picture */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-surface border-4 border-surface shadow-2xl overflow-hidden flex-shrink-0 relative group">
              <img
                src={logoSrc}
                alt={restaurant.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  if (e.currentTarget.src !== DEFAULT_LOGO) {
                    e.currentTarget.src = DEFAULT_LOGO;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>

            {/* Title & Badges */}
            <div className="space-y-1.5 mb-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-ink sm:text-white drop-shadow-sm">
                  {restaurant.name}
                </h1>
                {restaurant.isOpen !== false ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-white backdrop-blur-md shadow-sm border border-emerald-400/40">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    مفتوح للطلب الآن
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-600/90 text-white backdrop-blur-md shadow-sm border border-red-400/40">
                    مغلق مؤقتاً
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-ink-muted sm:text-white/80 font-medium flex items-center gap-2 flex-wrap mt-[20px]">
                <span className="text-amber-600 sm:text-amber-300 font-semibold flex items-center gap-1">
                  {restaurant.cuisine || "أشهى المأكولات"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  طازج ويُحضر عند الطلب خصيصاً لك
                </span>
              </p>
            </div>
          </div>

          {/* Quick Stat Badges */}
          <div className="flex items-center gap-2.5 flex-wrap text-xs font-semibold tabular-nums">
            {currentRating ? (
              <button
                type="button"
                onClick={onReviewsClick}
                className="inline-flex items-center gap-1.5 bg-surface sm:bg-white/10 sm:backdrop-blur-md sm:text-white px-3 py-1.5 rounded-xl border border-rule sm:border-white/20 hover:border-amber-400 transition-all cursor-pointer shadow-xs"
                title="عرض آراء وتقييمات العملاء"
              >
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold">
                  {Number(currentRating).toFixed(1)}
                </span>
                <span className="opacity-80 font-normal">
                  ({reviewsCount} تقييم)
                </span>
              </button>
            ) : null}

            <div className="inline-flex items-center gap-1.5 bg-surface sm:bg-white/10 sm:backdrop-blur-md sm:text-white px-3 py-1.5 rounded-xl border border-rule sm:border-white/20 shadow-xs">
              <Clock className="w-4 h-4 text-emerald-500 sm:text-emerald-300" />
              <span>
                {restaurant.deliveryTimeMinutes
                  ? `${restaurant.deliveryTimeMinutes} دقيقة`
                  : "تحضير فوري"}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-surface sm:bg-white/10 sm:backdrop-blur-md sm:text-white px-3 py-1.5 rounded-xl border border-rule sm:border-white/20 shadow-xs">
              <span>
                {restaurant.deliveryFee !== null &&
                restaurant.deliveryFee !== undefined
                  ? `${restaurant.deliveryFee} ج.م توصيل`
                  : "حسب العنوان"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { Star, Clock, Bike, MapPin, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../../components/ui';

/**
 * RestaurantHeader Component
 * Authentic editorial banner and metadata
 */
export function RestaurantHeader({ restaurant }) {
  if (!restaurant) return null;

  const {
    name,
    cuisine,
    coverImage,
    logo,
    rating = null,
    reviewsCount = null,
    deliveryTimeMinutes = null,
    deliveryFee = null,
    distanceKm = null,
    isDeliverable = true,
    address = '',
  } = restaurant;

  const brandInitial = name ? name.trim().charAt(0) : 'م';

  return (
    <div className="bg-surface border-b border-rule">
      {/* 1. Header Banner */}
      <div className="h-40 sm:h-52 w-full bg-paper-subtle border-b border-rule relative overflow-hidden flex items-center justify-center">
        {coverImage ? (
          <img
            src={coverImage}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-paper-subtle/50 to-paper-muted/30">
            <span className="text-3xl font-extrabold text-ink-faint/30 select-none tracking-widest">
              {name}
            </span>
          </div>
        )}
      </div>

      {/* 2. Restaurant Identity & Badges */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-10 sm:-mt-12 mb-5">
          {/* Logo + Title */}
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-surface border-2 border-surface shadow-sm overflow-hidden flex items-center justify-center flex-shrink-0">
              {logo ? (
                <img src={logo} alt={name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="w-full h-full bg-accent-light text-accent rounded-lg flex items-center justify-center font-bold text-2xl border border-accent/20">
                  {brandInitial}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-ink leading-tight">{name}</h1>
              <p className="text-xs text-ink-muted">{cuisine || address || 'مطعم مأكولات معتمد'}</p>
            </div>
          </div>

          {/* Rating Pill */}
          {rating ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-paper border border-rule self-stretch sm:self-auto justify-center tabular-nums">
              <Star size={16} className="fill-amber-500 text-amber-500" />
              <span className="font-bold text-sm text-ink">{Number(rating).toFixed(1)}</span>
              {reviewsCount && (
                <span className="text-xs text-ink-faint">({reviewsCount} تقييم)</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-paper border border-rule self-stretch sm:self-auto justify-center text-xs text-ink-muted">
              <span>مطعم مسجل</span>
            </div>
          )}
        </div>

        {/* 3. Specs Bar */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-ink-muted pt-3 border-t border-rule/60">
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-ink-faint" />
            <span>وقت التوصيل:</span>
            <strong className="text-ink tabular-nums">
              {deliveryTimeMinutes ? `${deliveryTimeMinutes} دقيقة` : 'تحضير مباشر'}
            </strong>
          </div>

          <div className="flex items-center gap-1.5">
            <Bike size={14} className="text-ink-faint" />
            <span>رسوم التوصيل:</span>
            <strong className="text-ink tabular-nums">
              {deliveryFee !== null && deliveryFee !== undefined ? `${deliveryFee} ج.م` : 'حسب العنوان'}
            </strong>
          </div>

          {distanceKm && (
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-ink-faint" />
              <span>المسافة:</span>
              <strong className="text-ink tabular-nums">{distanceKm} كم</strong>
            </div>
          )}

          <div className="mr-auto w-fit" style={{ width: "fit-content" }}>
            {isDeliverable ? (
              <span
                style={{ width: "100%", justifyContent: "center" }}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                <CheckCircle2 size={13} className="text-emerald-600" />
                توصيل متاح
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-paper-subtle text-ink-muted border border-rule">
                خارج نطاق التوصيل
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

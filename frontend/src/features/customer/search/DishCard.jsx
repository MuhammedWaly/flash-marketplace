import React from 'react';
import { getFullImageUrl } from '../../../utils/imageUrl';

/**
 * Editorial Dish Card
 * Crafted for food marketplace with or without photography:
 * Clean typography, dish photo preview, clear pricing in tabular numerals, and accessible add-to-cart action.
 */
export function DishCard({ dish, onAddToCart }) {
  if (!dish) return null;

  const {
    id,
    name,
    description,
    price = 0,
    restaurantName,
    tag,
    imageUrl,
    image,
  } = dish;

  const resolvedImage = getFullImageUrl(imageUrl || image);

  return (
    <article className="group bg-surface rounded-xl border border-rule p-4 transition-[border-color,box-shadow] duration-150 hover:border-rule-strong hover:shadow-xs flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4 className="text-sm font-bold text-ink group-hover:text-accent transition-colors line-clamp-1">
              {name}
            </h4>
            {tag && (
              <span className="inline-block text-[10px] font-semibold text-accent bg-accent-light px-2 py-0.5 rounded-full border border-accent/20 flex-shrink-0">
                {tag}
              </span>
            )}
          </div>

          {restaurantName && (
            <p className="text-[11px] font-medium text-ink-muted mb-1.5">
              {restaurantName}
            </p>
          )}

          {description && (
            <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed mb-3">
              {description}
            </p>
          )}
        </div>

        {resolvedImage && (
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-rule/80 flex-shrink-0 bg-paper">
            <img
              src={resolvedImage}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-rule/60 flex items-center justify-between gap-3 mt-auto">
        <div className="text-sm font-bold text-ink tabular-nums">
          {Number(price).toFixed(2)}{' '}
          <span className="text-xs font-normal text-ink-faint">ج.م</span>
        </div>

        <button
          type="button"
          onClick={() => onAddToCart?.(dish)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-paper hover:bg-accent hover:text-white text-ink text-xs font-semibold rounded-lg border border-rule hover:border-accent transition-colors cursor-pointer"
          aria-label={`أضف ${name} إلى سلة الطلبات`}
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>إضافة</span>
        </button>
      </div>
    </article>
  );
}
import React from 'react';

/**
 * SearchControlsHeader Component
 * Top bar containing the search query input, live match counts, and sorting select dropdown.
 */
export function SearchControlsHeader({
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  queryParam,
  restaurantsCount,
  dishesCount,
  sortParam,
  onSortChange,
}) {
  return (
    <div className="bg-surface border border-rule rounded-2xl p-4 sm:p-5 shadow-sm mb-6">
      <form onSubmit={onSearchSubmit} className="relative">
        <div className="flex items-center gap-3 bg-paper rounded-xl border border-rule px-4 py-2 focus-within:border-accent transition-colors">
          <svg
            className="text-ink-faint flex-shrink-0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="ابحث باسم المطعم أو الوجبة أو نوع المطبخ…"
            className="flex-1 min-w-0 bg-transparent border-0 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <button
            type="submit"
            className="flex-shrink-0 bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            تحديث البحث
          </button>
        </div>
      </form>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-rule/60 text-xs">
        <div className="text-ink-muted">
          {queryParam ? (
            <>
              نتائج البحث عن <strong className="text-ink font-semibold">«{queryParam}»</strong>
            </>
          ) : (
            <span>تصفح جميع المطاعم والأطباق</span>
          )}
          <span className="text-ink-faint mr-2 tabular-nums">
            ({restaurantsCount} مطعم · {dishesCount} وجبة)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-ink-muted">الترتيب:</span>
          <select
            value={sortParam}
            onChange={(e) => onSortChange(e.target.value)}
            className="form-select text-xs py-1.5 px-3 bg-paper rounded-lg border border-rule text-ink cursor-pointer focus:outline-none"
          >
            <option value="nearest">الأقرب مسافة</option>
            <option value="rating">الأعلى تقييماً</option>
            <option value="price_asc">السعر: من الأقل للأعلى</option>
            <option value="price_desc">السعر: من الأعلى للأقل</option>
            <option value="name">أبجدياً (أ-ي)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

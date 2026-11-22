import React from 'react';
import { CATEGORY_NAMES_AR } from './constants';

/**
 * FiltersSidebar Component
 * Sidebar filters for search catalog: deliverable toggle, categories, price range, and min rating.
 */
export function FiltersSidebar({
  deliverableOnly,
  onToggleDeliverableOnly,
  categories = [],
  categoryParam,
  onSelectCategory,
  minPriceInput,
  maxPriceInput,
  onMinPriceChange,
  onMaxPriceChange,
  onApplyPriceFilter,
  minRating,
  onSelectMinRating,
  onResetFilters,
}) {
  return (
    <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 bg-surface border border-rule rounded-xl p-4 space-y-5 shadow-2xs md:sticky md:top-20">
      <div className="flex items-center justify-between pb-3 border-b border-rule">
        <h2 className="text-xs font-bold text-ink">تصفية النتائج</h2>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-[11px] text-accent hover:underline cursor-pointer"
        >
          إعادة ضبط
        </button>
      </div>

      {/* Deliverable Only Toggle */}
      <div className="p-2.5 bg-paper rounded-lg border border-rule/70">
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-ink">
          <input
            type="checkbox"
            checked={deliverableOnly}
            onChange={(e) => onToggleDeliverableOnly(e.target.checked)}
            className="w-4 h-4 accent-accent cursor-pointer"
          />
          <span>توصيل متاح لموقعي فقط</span>
        </label>
      </div>

      {/* Categories Filter (Dynamic from DB) */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-ink-muted">التصنيف المعتمد</h3>
        <div className="space-y-1.5 text-xs text-ink-secondary">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category_filter"
              checked={!categoryParam}
              onChange={() => onSelectCategory(null)}
              className="accent-accent w-3.5 h-3.5"
            />
            <span>جميع التصنيفات</span>
          </label>
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category_filter"
                checked={categoryParam?.toLowerCase() === cat.toLowerCase()}
                onChange={() => onSelectCategory(cat)}
                className="accent-accent w-3.5 h-3.5"
              />
              <span>{CATEGORY_NAMES_AR[cat] || cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="pt-3 border-t border-rule space-y-2.5">
        <h3 className="text-xs font-semibold text-ink-muted">نطاق السعر (ج.م)</h3>
        <form onSubmit={onApplyPriceFilter} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-ink-faint mb-1">الحد الأدنى</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={minPriceInput}
                onChange={(e) => onMinPriceChange(e.target.value)}
                className="w-full text-xs p-1.5 bg-paper rounded border border-rule focus:outline-none focus:border-accent tabular-nums"
              />
            </div>
            <div>
              <label className="block text-[10px] text-ink-faint mb-1">الحد الأقصى</label>
              <input
                type="number"
                min="0"
                placeholder="500"
                value={maxPriceInput}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                className="w-full text-xs p-1.5 bg-paper rounded border border-rule focus:outline-none focus:border-accent tabular-nums"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-1.5 bg-paper hover:bg-accent hover:text-white text-ink text-xs font-medium rounded border border-rule transition-colors cursor-pointer"
          >
            تطبيق فلتر السعر
          </button>
        </form>
      </div>

      {/* Min Rating */}
      <div className="pt-3 border-t border-rule space-y-2">
        <h3 className="text-xs font-semibold text-ink-muted">التقييم الأدنى</h3>
        <div className="space-y-1.5 text-xs text-ink-secondary">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="rating_filter"
              checked={minRating === null}
              onChange={() => onSelectMinRating(null)}
              className="accent-accent"
            />
            <span>أي تقييم</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="rating_filter"
              checked={minRating === 4}
              onChange={() => onSelectMinRating(4)}
              className="accent-accent"
            />
            <span>4.0 نجوم فما فوق</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="rating_filter"
              checked={minRating === 3.5}
              onChange={() => onSelectMinRating(3.5)}
              className="accent-accent"
            />
            <span>3.5 نجوم فما فوق</span>
          </label>
        </div>
      </div>
    </aside>
  );
}

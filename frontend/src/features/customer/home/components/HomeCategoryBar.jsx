import React from 'react';

/**
 * HomeCategoryBar Component
 * Horizontal scrolling category pills navigation
 */
export function HomeCategoryBar({
  categories = [],
  activeCategory = 'all',
  onCategoryChange,
}) {
  return (
    <nav aria-label="أقسام الأطعمة" className="border-b border-rule bg-surface sticky top-16 z-10 shadow-2xs">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`text-xs px-4 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer font-medium ${
                activeCategory === cat.id
                  ? 'bg-accent text-white shadow-xs font-bold'
                  : 'bg-paper text-ink-secondary hover:bg-paper-subtle border border-rule hover:border-rule-strong'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

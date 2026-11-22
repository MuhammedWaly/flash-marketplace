import React from 'react';

/**
 * HomeHero Component
 * The authentic editorial Hero Section with search form and quick keyword pills.
 */
export function HomeHero({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onKeywordClick,
}) {
  return (
    <section className="bg-paper-subtle/40 border-b border-rule">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-2xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-ink tracking-tight leading-tight mb-3">
            <span className="block">طعامك المفضل،</span>
            <span className="block">من مطاعم منطقتك المختارة</span>
          </h1>
          <p className="text-sm sm:text-base text-ink-muted mb-6 leading-relaxed">
            اختر وجبتك واستقبلها مباشرة عند النقطة المحددة بدقة على الخريطة.
          </p>

          {/* Unified Inline Search Form */}
          <form onSubmit={onSearchSubmit} className="relative max-w-xl">
            <div className="flex items-center gap-3 bg-surface rounded-xl border border-rule px-3.5 py-2 shadow-sm focus-within:border-accent transition-colors">
              <div className="text-ink-faint flex-shrink-0 pr-1">
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>

              <input
                type="text"
                placeholder="ابحث باسم المطعم أو نوع الوجبة…"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="flex-1 min-w-0 bg-transparent border-0 px-2 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
              />

              <button
                type="submit"
                className="flex-shrink-0 bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                بحث
              </button>
            </div>
          </form>

          {/* Quick Keyword Pills */}
          <div className="flex items-center gap-2 mt-4 text-xs text-ink-faint flex-wrap">
            <span>أصناف متداولة:</span>
            <button
              type="button"
              onClick={() => onKeywordClick('شاورما')}
              className="text-ink-muted hover:text-accent underline underline-offset-2 cursor-pointer"
            >
              شاورما
            </button>
            <span>،</span>
            <button
              type="button"
              onClick={() => onKeywordClick('برجر')}
              className="text-ink-muted hover:text-accent underline underline-offset-2 cursor-pointer"
            >
              برجر
            </button>
            <span>،</span>
            <button
              type="button"
              onClick={() => onKeywordClick('بيتزا')}
              className="text-ink-muted hover:text-accent underline underline-offset-2 cursor-pointer"
            >
              بيتزا
            </button>
            <span>،</span>
            <button
              type="button"
              onClick={() => onKeywordClick('مشويات')}
              className="text-ink-muted hover:text-accent underline underline-offset-2 cursor-pointer"
            >
              مشويات
            </button>
            <span>،</span>
            <button
              type="button"
              onClick={() => onKeywordClick('أكلات مصرية')}
              className="text-ink-muted hover:text-accent underline underline-offset-2 cursor-pointer"
            >
              أكلات مصرية
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

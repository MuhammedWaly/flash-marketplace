import React from 'react';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

/**
 * Generic Pagination Component
 * متوافق مع PagedResult<T> في ASP.NET Core Backend
 * يدعم RTL العربي بدقة وتصميم Hallmark المميز
 */
export function Pagination({
  pageNumber = 1,
  pageSize = 10,
  totalCount = 0,
  totalPages = 1,
  hasPreviousPage = false,
  hasNextPage = false,
  onPageChange,
  isLoading = false,
  entityName = 'عنصر',
  className = '',
}) {
  if (totalCount <= 0 || totalPages <= 1) {
    return null;
  }

  // حساب أرقام الصفحات المعروضة مع دعم النقاط (...)
  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 7;

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (pageNumber <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (pageNumber >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', pageNumber - 1, pageNumber, pageNumber + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const fromItem = Math.min((pageNumber - 1) * pageSize + 1, totalCount);
  const toItem = Math.min(pageNumber * pageSize, totalCount);

  const handlePageClick = (p) => {
    if (isLoading || p === pageNumber || typeof p !== 'number') return;
    if (p >= 1 && p <= totalPages) {
      onPageChange(p);
    }
  };

  return (
    <nav
      aria-label="التنقل بين الصفحات"
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none font-readex ${className}`}
    >
      {/* ── Summary Indicator ── */}
      <div className="text-xs text-ink-muted flex items-center gap-1.5 tabular-nums">
        {isLoading && <Loader2 size={13} className="animate-spin text-accent" />}
        <span>
          عرض <span className="font-bold text-ink">{fromItem}</span> -{' '}
          <span className="font-bold text-ink">{toItem}</span> من أصل{' '}
          <span className="font-bold text-accent">{totalCount}</span> {entityName}
        </span>
      </div>

      {/* ── Buttons and Numbers ── */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* Previous Button (في RTL: السهم يشير لليمين للانتقال للخلف) */}
        <button
          type="button"
          onClick={() => handlePageClick(pageNumber - 1)}
          disabled={!hasPreviousPage || isLoading || pageNumber <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rule bg-surface text-xs font-semibold text-ink hover:bg-paper hover:border-rule-strong disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
          aria-label="الصفحة السابقة"
        >
          <ChevronRight size={14} />
          <span className="hidden xs:inline">السابق</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-xs text-ink-faint select-none"
                >
                  …
                </span>
              );
            }

            const isCurrent = p === pageNumber;
            return (
              <button
                key={p}
                type="button"
                onClick={() => handlePageClick(p)}
                disabled={isLoading}
                aria-current={isCurrent ? 'page' : undefined}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center tabular-nums ${
                  isCurrent
                    ? 'bg-accent text-white shadow-xs border border-accent'
                    : 'bg-surface text-ink hover:bg-paper hover:border-rule-strong border border-rule'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button (في RTL: السهم يشير لليسار للانتقال للأمام) */}
        <button
          type="button"
          onClick={() => handlePageClick(pageNumber + 1)}
          disabled={!hasNextPage || isLoading || pageNumber >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rule bg-surface text-xs font-semibold text-ink hover:bg-paper hover:border-rule-strong disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
          aria-label="الصفحة التالية"
        >
          <span className="hidden xs:inline">التالي</span>
          <ChevronLeft size={14} />
        </button>
      </div>
    </nav>
  );
}

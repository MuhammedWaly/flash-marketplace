import React from 'react';

/**
 * PageLoader Component
 * شاشة تحميل أنيقة وخفيفة تظهر أثناء الـ Code Splitting والـ Lazy Loading للصفحات
 */
export function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8">
      <div className="w-8 h-8 rounded-full border-2 border-rule border-t-accent animate-spin" />
      <p className="text-xs text-muted font-medium">جاري تحميل الصفحة...</p>
    </div>
  );
}

import React from 'react';
import { Star, CheckCircle, MessageSquare } from 'lucide-react';

/**
 * ReviewsList Component
 * قائمة تقييمات وتعليقات العملاء الذين اشتروا بالفعل
 */
export function ReviewsList({ reviews = [], averageRating = null, totalCount = 0 }) {
  if (reviews.length === 0) {
    return (
      <div className="p-8 border border-dashed border-rule rounded-2xl text-center space-y-2 bg-surface">
        <MessageSquare size={28} className="mx-auto text-muted" />
        <p className="text-sm font-semibold text-ink">لا توجد تقييمات مكتوبة بعد</p>
        <p className="text-xs text-muted">كن أول من يطلب من هذا المطعم ويكتب تقييماً له!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink">
          مراجعات الزبائن ({totalCount || reviews.length})
        </h3>
        {averageRating && (
          <div className="flex items-center gap-1 text-xs">
            <Star size={14} className="fill-warning text-warning" />
            <span className="font-bold text-ink">{Number(averageRating).toFixed(1)}</span>
            <span className="text-muted">من 5.0</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-4 rounded-xl border border-rule bg-surface space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink">{rev.userName}</span>
                {rev.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                    <CheckCircle size={10} />
                    <span>مشتري مؤكد</span>
                  </span>
                )}
              </div>
              {rev.createdAt && <span className="text-muted text-[11px]">{rev.createdAt}</span>}
            </div>

            {/* نجوم تقييم صاحب التعليق */}
            <div className="flex items-center gap-0.5 text-warning">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < rev.rating ? 'fill-warning text-warning' : 'text-rule'}
                />
              ))}
            </div>

            {rev.comment && (
              <p className="text-muted leading-relaxed mt-1">{rev.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

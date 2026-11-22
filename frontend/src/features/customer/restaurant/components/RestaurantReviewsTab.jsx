import React, { useState } from "react";
import {
  Star,
  MessageSquare,
  CheckCircle2,
  Calendar,
  UtensilsCrossed,
} from "lucide-react";
import { formatDate } from "../../../../utils/formatters";

/**
 * RestaurantReviewsTab Component
 * Detailed ratings overview, percentage distribution bars, quick filters,
 * and customer review cards.
 */
export function RestaurantReviewsTab({
  reviews = [],
  currentRating = 5,
  totalReviewsCount = 0,
}) {
  const [ratingFilter, setRatingFilter] = useState("all");

  // حساب نسب النجوم للرسم البياني
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.round(Number(r.rating) || 5);
    if (ratingCounts[star] !== undefined) {
      ratingCounts[star]++;
    }
  });

  const filteredReviews = reviews.filter((r) => {
    if (ratingFilter === "all") return true;
    if (ratingFilter === "with_comments")
      return Boolean(r.comment && r.comment.trim());
    return Math.round(Number(r.rating)) === Number(ratingFilter);
  });

  return (
    <div className="space-y-6">
      {/* Reviews Overview Breakdown Box */}
      <section className="bg-surface border border-rule rounded-2xl p-6 shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Big Score Block */}
          <div className="text-center lg:border-l lg:border-rule lg:pl-6 space-y-2">
            <div className="text-4xl sm:text-5xl font-black text-ink tracking-tight tabular-nums">
              {Number(currentRating || 5).toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(Number(currentRating || 5))
                      ? "text-amber-500 fill-amber-500"
                      : "text-gray-200 fill-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-ink-muted">
              استناداً إلى{" "}
              <span className="font-bold text-ink">
                {totalReviewsCount}
              </span>{" "}
              تقييم موثق من عملاء حقيقيين
            </p>
          </div>

          {/* Stars Breakdown Bars */}
          <div className="lg:col-span-2 space-y-2 max-w-md mx-auto w-full">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingCounts[stars] || 0;
              const percent =
                totalReviewsCount > 0
                  ? Math.round((count / totalReviewsCount) * 100)
                  : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setRatingFilter(ratingFilter === stars ? "all" : stars)
                    }
                    className={`flex items-center gap-1 font-semibold w-14 hover:text-accent transition-colors cursor-pointer ${
                      ratingFilter === stars
                        ? "text-accent"
                        : "text-ink-secondary"
                    }`}
                  >
                    <span>{stars}</span>
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  </button>
                  <div className="flex-1 h-2 bg-paper rounded-full overflow-hidden border border-rule">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-ink-muted w-10 text-left tabular-nums">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-2 pt-6 mt-6 border-t border-rule flex-wrap">
          <span className="text-xs font-semibold text-ink-muted ml-2">
            تصفية الآراء:
          </span>
          <button
            type="button"
            onClick={() => setRatingFilter("all")}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              ratingFilter === "all"
                ? "bg-ink text-surface"
                : "bg-paper text-ink-secondary hover:bg-paper-subtle border border-rule"
            }`}
          >
            جميع التقييمات ({reviews.length})
          </button>

          <button
            type="button"
            onClick={() => setRatingFilter("with_comments")}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              ratingFilter === "with_comments"
                ? "bg-ink text-surface"
                : "bg-paper text-ink-secondary hover:bg-paper-subtle border border-rule"
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            مع تعليقات فقط (
            {reviews.filter((r) => r.comment && r.comment.trim()).length})
          </button>

          {[5, 4, 3].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() =>
                setRatingFilter(ratingFilter === star ? "all" : star)
              }
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                ratingFilter === star
                  ? "bg-amber-600 text-white"
                  : "bg-paper text-ink-secondary hover:bg-paper-subtle border border-rule"
              }`}
            >
              <span>{star} نجوم</span>
              <span className="text-[11px] opacity-75">
                ({ratingCounts[star] || 0})
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-sm font-bold text-ink">
            تعليقات وآراء العملاء ({filteredReviews.length})
          </h3>
        </div>

        {filteredReviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredReviews.map((rev) => {
              const reviewerInitial = rev.customerName
                ? rev.customerName.trim().charAt(0)
                : "ع";
              return (
                <div
                  key={rev.id}
                  className="bg-surface border border-rule rounded-xl p-5 shadow-2xs space-y-3 hover:border-rule-strong transition-colors"
                >
                  {/* User Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 text-accent font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {reviewerInitial}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-ink">
                            {rev.customerName || "عميل في المنصة"}
                          </span>
                          {rev.isVerifiedPurchase !== false && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              شراء مؤكد ومستلم
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-ink-muted flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-ink-faint" />
                          {formatDate(rev.createdAt) || "مؤخراً"}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/60 px-2 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-amber-900 tabular-nums">
                        {rev.rating || 5}.0
                      </span>
                    </div>
                  </div>

                  {/* Dish Tag (if review is linked to specific dish) */}
                  {rev.dishName && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-paper border border-rule text-xs text-ink-secondary">
                      <UtensilsCrossed className="w-3 h-3 text-accent" />
                      <span>طلب: {rev.dishName}</span>
                    </div>
                  )}

                  {/* Comment Text */}
                  {rev.comment && rev.comment.trim() ? (
                    <div className="bg-paper/60 border-r-2 border-accent p-3.5 rounded-l-lg text-xs sm:text-sm text-ink leading-relaxed">
                      "{rev.comment}"
                    </div>
                  ) : (
                    <p className="text-xs text-ink-muted italic">
                      تقييم بالنجوم بدون كتابة تعليق نصي.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-surface rounded-xl border border-rule space-y-2">
            <MessageSquare className="w-10 h-10 text-ink-faint mx-auto opacity-50" />
            <p className="text-sm font-semibold text-ink">
              لا توجد مراجعات مطابقة لهذا الفلتر
            </p>
            <p className="text-xs text-ink-muted">
              جرب اختيار "جميع التقييمات" لعرض كافة آراء العملاء.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

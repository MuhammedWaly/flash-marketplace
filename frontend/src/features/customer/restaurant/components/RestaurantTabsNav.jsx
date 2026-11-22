import React from "react";
import { UtensilsCrossed, MessageSquare } from "lucide-react";

/**
 * RestaurantTabsNav Component
 * Sticky bar for switching between Menu Dishes and Customer Reviews
 */
export function RestaurantTabsNav({
  activeTab,
  onTabChange,
  dishesCount = 0,
  reviewsCount = 0,
}) {
  return (
    <div className="bg-surface border-b border-rule sticky top-0 sm:top-16 z-10 shadow-2xs">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center gap-6">
        <button
          type="button"
          onClick={() => onTabChange("menu")}
          className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "menu"
              ? "border-accent text-accent"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          قائمة الوجبات والأطباق
          <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-paper text-ink-muted">
            {dishesCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("reviews")}
          className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "reviews"
              ? "border-accent text-accent"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          التقييمات والآراء
          <span
            className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${
              activeTab === "reviews"
                ? "bg-accent/15 text-accent"
                : "bg-paper text-ink-muted"
            }`}
          >
            {reviewsCount}
          </span>
        </button>
      </div>
    </div>
  );
}

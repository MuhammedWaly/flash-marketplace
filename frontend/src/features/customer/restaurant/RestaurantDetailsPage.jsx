import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { useRestaurantDetails } from "./hooks/useRestaurantDetails";
import { RestaurantHeroCover } from "./components/RestaurantHeroCover";
import { RestaurantTabsNav } from "./components/RestaurantTabsNav";
import { RestaurantMenuTab } from "./components/RestaurantMenuTab";
import { RestaurantReviewsTab } from "./components/RestaurantReviewsTab";

export function RestaurantDetailsPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState("menu"); // 'menu' | 'reviews'

  const { restaurant, dishes, reviews, isLoading, error } = useRestaurantDetails(id);

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 space-y-6 font-readex">
        <div className="h-64 sm:h-80 bg-surface rounded-3xl border border-rule animate-pulse p-6 space-y-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-28 bg-surface rounded-xl border border-rule animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-16 text-center font-readex">
        <div className="bg-surface border border-rule rounded-2xl p-8 space-y-4 shadow-sm">
          <p className="text-sm text-ink-muted">
            {error || "لم يتم العثور على المطعم المطلوب."}
          </p>
          <Link
            to="/search"
            className="btn btn-outline text-xs px-4 py-2 inline-block"
          >
            العودة لقائمة المطاعم
          </Link>
        </div>
      </div>
    );
  }

  const totalReviewsCount = reviews.length || restaurant.reviewsCount || 0;
  const currentRating =
    restaurant.rating ||
    (reviews.length > 0
      ? reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length
      : 0);

  return (
    <div className="pb-16 font-readex">
      {/* ── Breadcrumb ── */}
      <nav
        aria-label="مسار التصفح"
        className="border-b border-rule bg-surface py-2.5"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center gap-2 text-xs text-ink-muted">
          <Link to="/" className="hover:text-accent transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <Link to="/search" className="hover:text-accent transition-colors">
            المطاعم
          </Link>
          <span>/</span>
          <span className="text-ink font-semibold">{restaurant.name}</span>
        </div>
      </nav>

      {/* ── Enhanced Appetizing Animated Hero Cover Section ── */}
      <RestaurantHeroCover
        restaurant={restaurant}
        reviewsCount={totalReviewsCount}
        currentRating={currentRating}
        onReviewsClick={() => setActiveTab("reviews")}
      />

      {/* ── Tabs Navigation Bar ── */}
      <RestaurantTabsNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dishesCount={dishes.length}
        reviewsCount={totalReviewsCount}
      />

      {/* ── Main Tab Contents ── */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-8">
        {activeTab === "menu" && (
          <RestaurantMenuTab
            dishes={dishes}
            restaurant={restaurant}
            onAddToCart={addItem}
          />
        )}

        {activeTab === "reviews" && (
          <RestaurantReviewsTab
            reviews={reviews}
            currentRating={currentRating}
            totalReviewsCount={totalReviewsCount}
          />
        )}
      </main>
    </div>
  );
}

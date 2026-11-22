import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RestaurantCard } from "./RestaurantCard";
import { Pagination } from "../../../components/ui";
import { HomeHero } from "./components/HomeHero";
import { HomeCategoryBar } from "./components/HomeCategoryBar";
import { useHomeRestaurants } from "./hooks/useHomeRestaurants";

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    categories,
    activeCategory,
    restaurants,
    pageNumber,
    pageSize,
    pagination,
    isLoading,
    error,
    handleCategoryChange,
    handlePageChange,
  } = useHomeRestaurants(6);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeywordClick = (keyword) => {
    setSearchQuery(keyword);
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="pb-16 font-readex">
      {/* ── Hero: Stage (Editorial, Calm, Unified Search) ── */}
      <HomeHero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onKeywordClick={handleKeywordClick}
      />

      {/* ── Category Filter Bar ── */}
      <HomeCategoryBar
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* ── Nearby Restaurants Grid ── */}
      <main id="restaurants-grid-section" className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-ink">
              مطاعم ضمن نطاق التوصيل
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              مرتبة وفق المسافة المباشرة والتقييم الأعلى
            </p>
          </div>
          <Link
            to="/search"
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
          >
            <span>
              تصفح الكل (
              {pagination.totalCount > 0 ? pagination.totalCount : restaurants.length}{" "}
              مطعم)
            </span>
            <svg
              className="rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-surface rounded-xl border border-rule p-5 animate-pulse space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-paper-subtle rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-paper-subtle rounded w-3/4" />
                    <div className="h-3 bg-paper-subtle rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-paper-subtle rounded w-full" />
                <div className="pt-3 border-t border-rule/50 flex justify-between">
                  <div className="h-3 bg-paper-subtle rounded w-1/4" />
                  <div className="h-3 bg-paper-subtle rounded w-1/4" />
                  <div className="h-3 bg-paper-subtle rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-surface rounded-xl border border-rule p-6">
            <p className="text-sm text-ink-muted mb-3">{error}</p>
            <p className="text-xs text-ink-faint mb-4">
              تأكد من تشغيل خادم الـ API عبر http://localhost:5107
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn btn-outline text-xs px-4 py-2"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : restaurants.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>

            {/* ── Generic Backend Pagination Component ── */}
            <Pagination
              pageNumber={pagination.pageNumber || pageNumber}
              pageSize={pagination.pageSize || pageSize}
              totalCount={pagination.totalCount}
              totalPages={pagination.totalPages}
              hasPreviousPage={pagination.hasPreviousPage}
              hasNextPage={pagination.hasNextPage}
              onPageChange={handlePageChange}
              isLoading={isLoading}
              entityName="مطعم"
              className="mt-8 pt-4 border-t border-rule"
            />
          </div>
        ) : (
          <div className="text-center py-12 bg-surface rounded-xl border border-rule">
            <p className="text-sm text-ink-muted mb-2">
              لا توجد مطاعم مسجلة في هذا النطاق حالياً.
            </p>
            {activeCategory !== "all" && (
              <button
                type="button"
                onClick={() => handleCategoryChange("all")}
                className="text-xs font-medium text-accent hover:underline cursor-pointer"
              >
                عرض جميع الأصناف
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

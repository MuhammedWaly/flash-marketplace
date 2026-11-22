import React from 'react';
import { RestaurantCard } from '../home/RestaurantCard';
import { DishCard } from './DishCard';
import { FiltersSidebar } from './FiltersSidebar';
import { SearchControlsHeader } from './components/SearchControlsHeader';
import { useCart } from '../../../context/CartContext';
import { Pagination } from '../../../components/ui';
import { useSearchCatalog } from './hooks/useSearchCatalog';

export function SearchPage() {
  const { addItem } = useCart();

  const {
    queryParam,
    sortParam,
    activeTab,
    categoryParam,
    minRating,
    minPriceInput,
    maxPriceInput,
    deliverableOnly,
    pageParam,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    setDeliverableOnly,
    setMinRating,
    setMinPriceInput,
    setMaxPriceInput,
    categories,
    restaurants,
    restaurantsPagination,
    dishes,
    isLoading,
    error,
    updateQueryParam,
    handleSearchSubmit,
    handleApplyPriceFilter,
    handleResetFilters,
    handlePageChange,
  } = useSearchCatalog();

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 font-readex w-full">
      {/* ── 1. Search Bar & Controls Header ── */}
      <SearchControlsHeader
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        queryParam={queryParam}
        restaurantsCount={restaurants.length}
        dishesCount={dishes.length}
        sortParam={sortParam}
        onSortChange={(newSort) => updateQueryParam({ sort: newSort, page: 1 })}
      />

      {/* ── 2. Content: Sidebar Filters + Results Feed ── */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Filters Sidebar */}
        <FiltersSidebar
          deliverableOnly={deliverableOnly}
          onToggleDeliverableOnly={(checked) => {
            setDeliverableOnly(checked);
            updateQueryParam({ deliverableOnly: checked ? 'true' : null, page: 1 });
          }}
          categories={categories}
          categoryParam={categoryParam}
          onSelectCategory={(cat) => updateQueryParam({ category: cat, page: 1 })}
          minPriceInput={minPriceInput}
          maxPriceInput={maxPriceInput}
          onMinPriceChange={setMinPriceInput}
          onMaxPriceChange={setMaxPriceInput}
          onApplyPriceFilter={handleApplyPriceFilter}
          minRating={minRating}
          onSelectMinRating={(rating) => {
            setMinRating(rating);
            updateQueryParam({ minRating: rating, page: 1 });
          }}
          onResetFilters={handleResetFilters}
        />

        {/* Results Feed */}
        <section className="flex-1 min-w-0 space-y-5">
          {/* Tab Strip */}
          <div className="flex border-b border-rule">
            <button
              type="button"
              onClick={() => {
                setActiveTab('restaurants');
                updateQueryParam({ tab: 'restaurants' });
              }}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'restaurants'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              المطاعم المتطابقة ({restaurants.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('dishes');
                updateQueryParam({ tab: 'dishes' });
              }}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'dishes'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              الأطباق والوجبات ({dishes.length})
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-surface rounded-xl border border-rule p-5 animate-pulse space-y-3">
                  <div className="h-4 bg-paper-subtle rounded w-1/4" />
                  <div className="h-3 bg-paper-subtle rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-surface rounded-xl border border-rule p-6">
              <p className="text-sm text-ink-muted mb-2">{error}</p>
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="btn btn-outline text-xs px-4 py-1.5"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : activeTab === 'restaurants' ? (
            restaurants.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {restaurants.map((res) => (
                    <RestaurantCard key={res.id} restaurant={res} />
                  ))}
                </div>

                {/* Generic Pagination for Restaurants */}
                <Pagination
                  pageNumber={restaurantsPagination.pageNumber || pageParam}
                  pageSize={restaurantsPagination.pageSize || 10}
                  totalCount={restaurantsPagination.totalCount}
                  totalPages={restaurantsPagination.totalPages}
                  hasPreviousPage={restaurantsPagination.hasPreviousPage}
                  hasNextPage={restaurantsPagination.hasNextPage}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                  entityName="مطعم"
                  className="mt-6 pt-4 border-t border-rule"
                />
              </div>
            ) : (
              <div className="text-center py-12 bg-surface rounded-xl border border-rule space-y-2">
                <p className="text-sm font-semibold text-ink">لم يتم العثور على مطاعم مطابقة</p>
                <p className="text-xs text-ink-muted">
                  جرب تغيير كلمات البحث أو تخفيف شروط الفلاتر لعرض نتائج أوسع.
                </p>
              </div>
            )
          ) : dishes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dishes.map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  onAddToCart={(d) =>
                    addItem(
                      { id: d.id, name: d.name, price: d.price, imageUrl: d.imageUrl },
                      {
                        id: d.restaurantId || d.resturantId,
                        name: d.restaurantName || d.resturantName || 'المطعم',
                        deliveryFee: d.deliveryFee || 15,
                      }
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-surface rounded-xl border border-rule space-y-2">
              <p className="text-sm font-semibold text-ink">لم يتم العثور على أطباق مطابقة</p>
              <p className="text-xs text-ink-muted">
                جرب البحث باسم صنف شائع مثل: برجر، شاورما، أو بيتزا.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

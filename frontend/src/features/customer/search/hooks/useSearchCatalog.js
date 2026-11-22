import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLocationState } from '../../../../context/LocationContext';
import { searchService } from '../../../../services/searchService';

/**
 * Custom Hook: useSearchCatalog
 * Manages search parameters, category list, query execution, pagination, and filter updates.
 */
export function useSearchCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedLocation } = useLocationState();

  const queryParam = searchParams.get('q') || '';
  const sortParam = searchParams.get('sort') || 'nearest';
  const tabParam = searchParams.get('tab') || 'restaurants';
  const categoryParam = searchParams.get('category') || null;
  const minRatingParam = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : null;
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const deliverableOnlyParam = searchParams.get('deliverableOnly') === 'true';
  const pageParam = Number(searchParams.get('page')) || 1;

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState(tabParam);
  const [deliverableOnly, setDeliverableOnly] = useState(deliverableOnlyParam);
  const [minRating, setMinRating] = useState(minRatingParam);
  const [minPriceInput, setMinPriceInput] = useState(minPriceParam);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam);

  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantsPagination, setRestaurantsPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [dishes, setDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. جلب التصنيفات الحقيقية من السيرفر
  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const res = await searchService.getCategories();
        if (isMounted) {
          const list = Array.isArray(res) ? res : res?.value || [];
          const cleanCategories = list.filter(
            (c) => typeof c === 'string' && c.trim() && c.toLowerCase() !== 'string'
          );
          setCategories(cleanCategories);
        }
      } catch (err) {
        console.warn('تعذر جلب التصنيفات من السيرفر:', err);
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. جلب النتائج من السيرفر مع جميع الفلاتر ونظام الـ Generic Pagination
  useEffect(() => {
    let isMounted = true;
    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await searchService.searchCatalog({
          query: queryParam,
          category: categoryParam,
          minRating: minRating,
          minPrice: minPriceParam,
          maxPrice: maxPriceParam,
          onlyDeliverable: deliverableOnly,
          sortBy: sortParam,
          pageNumber: pageParam,
          pageSize: 10,
          userLat: selectedLocation?.isConfigured ? selectedLocation.lat : undefined,
          userLng: selectedLocation?.isConfigured ? selectedLocation.lng : undefined,
        });

        if (isMounted) {
          const resObj = response?.restaurants;
          const resList = Array.isArray(resObj) ? resObj : resObj?.items || [];
          const dishList = response?.dishes?.items || response?.dishes || [];
          setRestaurants(resList);
          setDishes(dishList);

          if (resObj && !Array.isArray(resObj)) {
            setRestaurantsPagination({
              pageNumber: resObj.pageNumber || pageParam,
              pageSize: resObj.pageSize || 10,
              totalCount: resObj.totalCount ?? resList.length,
              totalPages:
                resObj.totalPages ??
                Math.max(1, Math.ceil((resObj.totalCount || resList.length) / 10)),
              hasPreviousPage: Boolean(resObj.hasPreviousPage),
              hasNextPage: Boolean(resObj.hasNextPage),
            });
          } else {
            setRestaurantsPagination({
              pageNumber: 1,
              pageSize: resList.length,
              totalCount: resList.length,
              totalPages: 1,
              hasPreviousPage: false,
              hasNextPage: false,
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('فشل البحث من السيرفر:', err);
          setError('تعذر جلب نتائج البحث من الخادم.');
          setRestaurants([]);
          setDishes([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchSearchResults();
    return () => {
      isMounted = false;
    };
  }, [
    queryParam,
    categoryParam,
    sortParam,
    minRating,
    minPriceParam,
    maxPriceParam,
    deliverableOnly,
    pageParam,
    selectedLocation?.lat,
    selectedLocation?.lng,
    selectedLocation?.isConfigured,
  ]);

  const updateQueryParam = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '' || val === false || val === undefined) {
        updated.delete(key);
      } else {
        updated.set(key, val);
      }
    });
    setSearchParams(updated);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault?.();
    updateQueryParam({ q: searchQuery.trim(), page: 1 });
  };

  const handleApplyPriceFilter = (e) => {
    e?.preventDefault?.();
    updateQueryParam({
      minPrice: minPriceInput.trim() || null,
      maxPrice: maxPriceInput.trim() || null,
      page: 1,
    });
  };

  const handleResetFilters = () => {
    setDeliverableOnly(false);
    setMinRating(null);
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams(new URLSearchParams(queryParam ? { q: queryParam } : {}));
  };

  const handlePageChange = (newPage) => {
    updateQueryParam({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredRestaurants = restaurants.filter(
    (r) => (!deliverableOnly ? true : r.isDeliverable !== false)
  );

  return {
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
    restaurants: filteredRestaurants,
    restaurantsPagination,
    dishes,
    isLoading,
    error,
    updateQueryParam,
    handleSearchSubmit,
    handleApplyPriceFilter,
    handleResetFilters,
    handlePageChange,
  };
}

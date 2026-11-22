import { useState, useEffect } from 'react';
import { restaurantService } from '../../../../services/restaurantService';
import { searchService } from '../../../../services/searchService';
import { useLocationState } from '../../../../context/LocationContext';

/**
 * Custom Hook: useHomeRestaurants
 * Manages category list fetching, paginated restaurant list querying,
 * GPS-based location filtering, and pagination state.
 */
export function useHomeRestaurants(pageSize = 6) {
  const { selectedLocation } = useLocationState();
  const [activeCategory, setActiveCategory] = useState('all');
  const [restaurants, setRestaurants] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize,
    totalCount: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const [categories, setCategories] = useState([
    { id: 'all', name: 'جميع الأصناف' },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. جلب التصنيفات الحقيقية من السيرفر (GET /api/search/categories)
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const res = await searchService.getCategories();
        const rawList = Array.isArray(res) ? res : res?.value || [];
        if (isMounted && rawList.length > 0) {
          const formatted = [
            { id: 'all', name: 'جميع الأصناف' },
            ...rawList
              .filter((c) => c && c !== 'string')
              .map((c) => ({ id: c, name: c })),
          ];
          setCategories(formatted);
        }
      } catch (e) {
        console.warn('تعذر جلب الأقسام من السيرفر:', e);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. جلب المطاعم بنظام الـ Generic Pagination المباشر من السيرفر
  useEffect(() => {
    let isMounted = true;
    const fetchRestaurants = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await restaurantService.getRestaurants({
          pageNumber,
          pageSize,
          category: activeCategory !== 'all' ? activeCategory : undefined,
          userLat: selectedLocation?.isConfigured ? selectedLocation.lat : undefined,
          userLng: selectedLocation?.isConfigured ? selectedLocation.lng : undefined,
        });

        if (isMounted) {
          const list = Array.isArray(response)
            ? response
            : response?.items || [];
          setRestaurants(list);

          if (response && !Array.isArray(response)) {
            setPagination({
              pageNumber: response.pageNumber || pageNumber,
              pageSize: response.pageSize || pageSize,
              totalCount: response.totalCount ?? list.length,
              totalPages:
                response.totalPages ??
                Math.max(1, Math.ceil((response.totalCount || list.length) / pageSize)),
              hasPreviousPage: Boolean(response.hasPreviousPage),
              hasNextPage: Boolean(response.hasNextPage),
            });
          } else {
            setPagination({
              pageNumber: 1,
              pageSize: list.length,
              totalCount: list.length,
              totalPages: 1,
              hasPreviousPage: false,
              hasNextPage: false,
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('فشل جلب المطاعم من السيرفر:', err);
          setError('تعذر تحميل المطاعم من الخادم حالياً.');
          setRestaurants([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchRestaurants();
    return () => {
      isMounted = false;
    };
  }, [pageNumber, activeCategory, selectedLocation?.lat, selectedLocation?.lng, selectedLocation?.isConfigured, pageSize]);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setPageNumber(1);
  };

  const handlePageChange = (newPage) => {
    setPageNumber(newPage);
    document.getElementById('restaurants-grid-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return {
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
  };
}

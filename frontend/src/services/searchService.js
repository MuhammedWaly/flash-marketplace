import api from './api';

/**
 * Search Service
 * البحث الموحد في المطاعم والأطباق بنظام الـ Pagination وجلب الأقسام
 */
export const searchService = {
  /**
   * جلب تصنيفات الأطعمة الديناميكية من الباك إند
   * GET /api/search/categories
   */
  getCategories: async () => {
    return await api.get('/search/categories');
  },

  /**
   * البحث الموحد في المطاعم والأطباق مع دعم كامل للفلترة
   * GET /api/search
   */
  searchCatalog: async ({
    query = '',
    category = null,
    minRating = null,
    minPrice = null,
    maxPrice = null,
    onlyDeliverable = false,
    sortBy = 'nearest',
    pageNumber = 1,
    pageSize = 20,
    userLat = null,
    userLng = null,
  } = {}) => {
    return await api.get('/search', {
      params: {
        query: query?.trim() || undefined,
        category: category || undefined,
        minRating: minRating || undefined,
        minPrice: minPrice !== '' && minPrice !== null && !isNaN(Number(minPrice)) ? Number(minPrice) : undefined,
        maxPrice: maxPrice !== '' && maxPrice !== null && !isNaN(Number(maxPrice)) ? Number(maxPrice) : undefined,
        onlyDeliverable: onlyDeliverable ? true : undefined,
        sortBy: sortBy || undefined,
        pageNumber,
        pageSize,
        userLat: userLat || undefined,
        userLng: userLng || undefined,
      },
    });
  },
};

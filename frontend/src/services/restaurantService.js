import api from './api';

/**
 * Restaurant Service
 * تصفح المطاعم، المنيو، وتقييمات العملاء
 */
export const restaurantService = {
  /**
   * جلب قائمة المطاعم بنظام الـ Pagination
   * GET /api/restaurants?pageNumber=1&pageSize=10
   */
  getRestaurants: async ({
    pageNumber = 1,
    pageSize = 10,
    category = null,
    userLat = null,
    userLng = null,
  } = {}) => {
    return await api.get('/restaurants', {
      params: {
        pageNumber,
        pageSize,
        category: category && category !== 'all' ? category : undefined,
        userLat: userLat || undefined,
        userLng: userLng || undefined,
      },
    });
  },

  /**
   * جلب تفاصيل مطعم محدد وقائمته (المنيو)
   * GET /api/restaurants/:id
   */
  getRestaurantById: async (id) => {
    return await api.get(`/restaurants/${id}`);
  },

  getById: async (id) => {
    return await api.get(`/restaurants/${id}`);
  },

  /**
   * جلب مراجعات وتقييمات المطعم
   * GET /api/restaurants/:id/reviews?pageNumber=1&pageSize=10
   */
  getRestaurantReviews: async (id, { pageNumber = 1, pageSize = 10 } = {}) => {
    return await api.get(`/restaurants/${id}/reviews`, {
      params: { pageNumber, pageSize },
    });
  },
};

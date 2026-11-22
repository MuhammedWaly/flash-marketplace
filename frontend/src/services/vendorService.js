import api from './api';

/**
 * Vendor Service
 * لوحة تحكم صاحب المطعم: الإحصائيات، الطلبات الواردة، أطباق المنيو، وإعدادات الفرع
 */
export const vendorService = {
  /**
   * جلب إحصائيات المحفظة والأوردرات
   * GET /api/vendor/stats
   * response: { totalRevenue, todayOrdersCount, pendingOrdersCount, activeOrdersCount, averageRating, isOpen }
   */
  getStats: async () => {
    return await api.get('/vendor/stats');
  },

  /**
   * جلب الطلبات الواردة للمطعم
   * GET /api/vendor/orders?status=all&pageNumber=1&pageSize=10
   * status options: (all, pending, preparing, active, delivered, cancelled)
   */
  getOrders: async ({ status = 'all', pageNumber = 1, pageSize = 10 } = {}) => {
    return await api.get('/vendor/orders', {
      params: { status, pageNumber, pageSize },
    });
  },

  /**
   * تحديث حالة الطلب من قبل صاحب المطعم
   * PATCH /api/vendor/orders/:id/status
   * payload: { status: 'Confirmed' | 'Preparing' | 'Shipped' | 'Delivered' | 'Cancelled' }
   */
  updateOrderStatus: async (orderId, status) => {
    return await api.patch(`/vendor/orders/${orderId}/status`, { status });
  },

  /**
   * جلب أطباق مطعمه
   * GET /api/vendor/dishes
   */
  getDishes: async () => {
    return await api.get('/vendor/dishes');
  },

  /**
   * إضافة طبق جديد للمنيو (يدعم JSON و FormData لرفع الصور)
   * POST /api/vendor/dishes
   */
  addDish: async (dishData) => {
    const isFormData = dishData instanceof FormData;
    return await api.post('/vendor/dishes', dishData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
  },

  /**
   * تعديل طبق في المنيو (يدعم JSON و FormData لرفع الصور)
   * PUT /api/vendor/dishes/:id
   */
  updateDish: async (dishId, dishData) => {
    const isFormData = dishData instanceof FormData;
    return await api.put(`/vendor/dishes/${dishId}`, dishData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
  },

  /**
   * حذف طبق من المنيو
   * DELETE /api/vendor/dishes/:id
   */
  deleteDish: async (dishId) => {
    return await api.delete(`/vendor/dishes/${dishId}`);
  },

  /**
   * جلب إعدادات المحل ونطاق التوصيل
   * GET /api/vendor/settings
   */
  getSettings: async () => {
    return await api.get('/vendor/settings');
  },

  /**
   * حفظ إعدادات المحل ونطاق التوصيل
   * PUT /api/vendor/settings
   * payload: { isOpen, minOrderValue, deliveryRadiusKm, latitude, longitude, addressTitle, logoUrl, coverImageUrl }
   */
  updateSettings: async (settingsData) => {
    return await api.put('/vendor/settings', settingsData);
  },

  /**
   * رفع وسائط وهوية المطعم (اللوجو وصورة الغلاف)
   * POST /api/vendor/media
   * formData: { logo: File, cover: File }
   */
  uploadMedia: async (formData) => {
    return await api.post('/vendor/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

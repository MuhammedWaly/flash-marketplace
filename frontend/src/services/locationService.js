import api from './api';

/**
 * Location Service (Pin-Based Location)
 * إلغاء الفورمات اليدوية؛ الاعتماد الكلي على تثبيت الدبوس على الخريطة
 */
export const locationService = {
  /**
   * فحص موقع العميل المحفوظ
   * GET /api/locations/customer
   * response: { isConfigured: boolean, latitude: number, longitude: number, addressTitle: string }
   */
  getCustomerLocation: async () => {
    return await api.get('/locations/customer');
  },

  /**
   * حفظ أو تحديث موقع العميل بالدبوس
   * POST /api/locations/customer
   * payload: { latitude, longitude, addressTitle }
   */
  saveCustomerLocation: async ({ latitude, longitude, addressTitle }) => {
    return await api.post('/locations/customer', {
      latitude,
      longitude,
      addressTitle,
    });
  },
};

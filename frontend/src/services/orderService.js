import api from './api';

/**
 * Order Service
 * دورة الطلب الآمنة: لا يتم إرسال أسعار من المتصفح
 */
export const orderService = {
  /**
   * تأكيد الطلب والدفع بأمان
   * POST /api/orders/checkout
   * payload: { shippingAddress: string, paymentMethod: "CashOnDelivery" }
   */
  checkout: async ({ shippingAddress = '', paymentMethod = 'CashOnDelivery' } = {}) => {
    return await api.post('/orders/checkout', {
      shippingAddress: shippingAddress?.trim() || 'عنوان التوصيل المحدد بالخريطة',
      paymentMethod,
    });
  },

  /**
   * جلب سجل طلبات العميل بنظام الـ Pagination
   * GET /api/orders/my-orders?pageNumber=1&pageSize=5
   */
  getMyOrders: async ({ pageNumber = 1, pageSize = 5 } = {}) => {
    return await api.get('/orders/my-orders', {
      params: { pageNumber, pageSize },
    });
  },

  /**
   * جلب تفاصيل طلب محدد
   * GET /api/orders/:orderId
   */
  getOrderById: async (orderId) => {
    return await api.get(`/orders/${orderId}`);
  },

  /**
   * تقييم الطلب السريع بعد وصوله (Delivered)
   * POST /api/orders/:orderId/rate
   * payload: { rating: number, comment: string }
   */
  rateOrder: async (orderId, { rating, comment = '' }) => {
    return await api.post(`/orders/${orderId}/rate`, {
      rating,
      comment,
    });
  },
};

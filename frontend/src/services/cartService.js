import api from './api';

/**
 * Cart Service (HybridCache Server-Side Cart)
 * العميل لا يرسل أسعار؛ السيرفر يحسب الأسعار والمجاميع بأمان
 */
export const cartService = {
  /**
   * جلب السلة الحالية للعميل المحسوبة من السيرفر
   * GET /api/cart
   */
  getCart: async () => {
    return await api.get('/cart');
  },

  /**
   * إضافة طبق للسلة
   * POST /api/cart/items
   * payload: { resturantId, dishId, quantity, overrideExisting }
   * ملاحظة معمارية هامة: الباك إند يشترط resturantId (بدون حرف a) كحقل إلزامي
   */
  addItem: async ({ resturantId, restaurantId, dishId, quantity = 1, overrideExisting = false }) => {
    const finalResturantId = resturantId || restaurantId;
    return await api.post('/cart/items', {
      resturantId: finalResturantId,
      dishId,
      quantity,
      overrideExisting,
    });
  },

  /**
   * حذف صنف من السلة
   * DELETE /api/cart/items/:dishId
   */
  removeItem: async (dishId) => {
    return await api.delete(`/cart/items/${dishId}`);
  },

  /**
   * تفريغ السلة بالكامل
   * DELETE /api/cart
   */
  clearCart: async () => {
    return await api.delete('/cart');
  },
};

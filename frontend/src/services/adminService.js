import api from './api';

export const adminService = {
  /**
   * جلب قائمة المطاعم والتجار مع الفلترة والترقيم
   * @param {{ status?: string, search?: string, pageNumber?: number, pageSize?: number }} params
   */
  async getMerchants(params = {}) {
    return api.get('/admin/merchants', { params });
  },

  /**
   * اعتماد وتفعيل مطعم/تاجر جديد (KYC Approval)
   * @param {string} id
   */
  async approveMerchant(id) {
    return api.put(`/admin/merchants/${id}/approve`);
  },

  /**
   * رفض مطعم/تاجر مع سبب الرفض
   * @param {string} id
   * @param {string} [reason]
   */
  async rejectMerchant(id, reason) {
    return api.put(`/admin/merchants/${id}/reject`, { reason });
  },

  /**
   * تجميد / إعادة تنشيط حساب تاجر
   * @param {string} id
   */
  async toggleMerchantStatus(id) {
    return api.put(`/admin/merchants/${id}/toggle-status`);
  },

  /**
   * جلب مؤشرات ونظرة عامة على المالية والعمولات
   */
  async getFinanceOverview() {
    return api.get('/admin/finance/overview');
  },

  /**
   * جلب تفاصيل أرباح ومستحقات كل تاجر
   * @param {string} [search]
   */
  async getMerchantFinances(search) {
    return api.get('/admin/finance/merchants', { params: { search } });
  },

  /**
   * تعديل نسبة عمولة المنصة لتاجر معين
   * @param {string} id
   * @param {number} commissionRate
   */
  async updateCommissionRate(id, commissionRate) {
    return api.put(`/admin/merchants/${id}/commission`, { commissionRate });
  },

  /**
   * تسجيل سداد أرباح لتاجر (Payout Record)
   * @param {{ merchantId: string, amount: number, method: string, referenceNumber?: string, notes?: string }} payload
   */
  async recordPayout(payload) {
    return api.post('/admin/finance/payout', payload);
  },

  /**
   * جلب جميع طلبات المنصة للمتابعة اللحظية (Platform-wide Orders Monitoring)
   * @param {{ status?: string, pageNumber?: number, pageSize?: number }} params
   */
  async getPlatformOrders(params = {}) {
    return api.get('/admin/orders', { params }).catch(() => {
      // Fallback gracefully if endpoint is not implemented on backend
      return api.get('/orders/all', { params }).catch(() => ({ items: [], totalCount: 0 }));
    });
  },
};

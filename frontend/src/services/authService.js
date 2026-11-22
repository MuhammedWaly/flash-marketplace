import api from './api';

/**
 * Auth Service
 * متطابق بالمللي مع Swagger Schema لـ Multi-Vendor Marketplace.Api
 */
export const authService = {
  /**
   * تسجيل الدخول
   * POST /api/Auth/login
   * payload: { email, password }
   */
  login: async ({ email, password }) => {
    return await api.post('/Auth/login', { email, password });
  },

  /**
   * تسجيل حساب عميل جديد
   * POST /api/Auth/register-customer
   * payload: { firstName, lastName, email, password, phoneNumber }
   */
  registerCustomer: async (customerData) => {
    return await api.post('/Auth/register-customer', {
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      password: customerData.password,
      phoneNumber: customerData.phoneNumber || customerData.PhoneNumber || customerData.phone,
    });
  },

  /**
   * تسجيل حساب شريك مطعم جديد
   * POST /api/Auth/register-restaurant-owner
   * payload: { ownerName, restaurantName, category, description, email, password, phoneNumber }
   */
  registerVendor: async (vendorData) => {
    return await api.post('/Auth/register-restaurant-owner', {
      ownerName: vendorData.ownerName,
      restaurantName: vendorData.storeName || vendorData.restaurantName,
      category: vendorData.cuisine || vendorData.category || 'FastFood',
      description: vendorData.description || 'مطعم شريك في منصة طلبلي',
      email: vendorData.email,
      password: vendorData.password,
      phoneNumber: vendorData.phoneNumber || vendorData.PhoneNumber || vendorData.phone,
      logoUrl: vendorData.logoUrl || null,
      coverImageUrl: vendorData.coverImageUrl || null,
    });
  },

  /**
   * جلب بيانات المستخدم الحالي
   * GET /api/Auth/me
   */
  getCurrentUser: async () => {
    return await api.get('/Auth/me');
  },
};

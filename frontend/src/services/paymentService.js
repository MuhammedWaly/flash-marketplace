import api from './api';

export const paymentService = {
  /**
   * 1. Seller Stripe Onboarding
   * POST /api/vendor/stripe/onboard
   */
  startOnboarding: async () => {
    return await api.post('/vendor/stripe/onboard', {});
  },

  /**
   * 2. Seller Stripe Status
   * GET /api/vendor/stripe/status
   */
  getSellerStatus: async () => {
    return await api.get('/vendor/stripe/status');
  },

  /**
   * 3. Create Checkout Session
   * POST /api/payments/checkout-session
   */
  createCheckoutSession: async (orderId) => {
    return await api.post('/payments/checkout-session', { orderId });
  },

  /**
   * 4. Get Payment & Order Status
   * GET /api/payments/order/{orderId}
   */
  getPaymentStatus: async (orderId) => {
    return await api.get(`/payments/order/${orderId}`);
  },
};

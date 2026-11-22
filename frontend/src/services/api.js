import axios from 'axios';

/**
 * Base Axios Client
 * مهيأ للربط مع الـ ASP.NET Core Backend
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

// 1. Request Interceptor: إرفاق التوكن في الـ Headers تلقائياً
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('foodmarketplace_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('فشل قراءة التوكن:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: استخراج البيانات ومعالجة رسائل أخطاء الـ Validation من ASP.NET Core
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response ? error.response.status : null;
    let message = 'حدث خطأ في الاتصال بالخادم';

    // فحص رسائل الـ Model Validation من ASP.NET Core { errors: { field: ["msg"] } }
    if (error.response?.data?.errors) {
      const errObj = error.response.data.errors;
      const errorList = Object.values(errObj).flat();
      if (errorList.length > 0) {
        message = errorList.join(' · ');
      }
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.response?.data?.title) {
      message = error.response.data.title;
    } else if (error.message) {
      message = error.message;
    }

    if (status === 401) {
      localStorage.removeItem('foodmarketplace_auth_token');
    }

    const customErr = new Error(message);
    customErr.status = status;
    customErr.data = error.response?.data;
    return Promise.reject(customErr);
  }
);

export default api;

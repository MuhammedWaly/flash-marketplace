import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const TOKEN_KEY = 'foodmarketplace_auth_token';
const REFRESH_TOKEN_KEY = 'foodmarketplace_refresh_token';
const USER_KEY = 'foodmarketplace_user_data';

const AuthContext = createContext(null);

/**
 * دالة مساعدة لفك تشفير الـ Payload من الـ JWT لاستخراج الدور (Role) والبيانات
 */
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * AuthProvider
 * يدير حالة تسجيل الدخول، توكن الجلسة (JWT)، وبيانات المستخدم الحقيقية من السيرفر
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // حفظ التوكن وبيانات المستخدم في localStorage
  const saveSession = (authToken, refreshToken, userData) => {
    setToken(authToken);
    setUser(userData);
    try {
      localStorage.setItem(TOKEN_KEY, authToken);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (e) {
      console.error('فشل حفظ الجلسة:', e);
    }
  };

  // تسجيل الخروج
  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('فشل إزالة الجلسة:', e);
    }
  };

  /**
   * استخراج بيانات المستخدم من الرد والـ JWT
   */
  const processAuthResponse = (res, fallbackEmail = '') => {
    const authToken = res?.accessToken || res?.token;
    if (!authToken) {
      throw new Error('لم يرجع السيرفر رمز الدخول (accessToken).');
    }

    const jwtPayload = parseJwt(authToken);
    const rawRole =
      jwtPayload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      jwtPayload?.role ||
      res?.role ||
      '';

    const roleStr = String(rawRole).toLowerCase();
    let role = 'customer';
    if (roleStr.includes('admin')) {
      role = 'admin';
    } else if (
      roleStr.includes('vendor') ||
      roleStr.includes('owner') ||
      roleStr.includes('restaurant')
    ) {
      role = 'vendor';
    }

    const userData = {
      id: res.id || jwtPayload?.sub || 'user',
      email: res.email || jwtPayload?.email || fallbackEmail,
      name: res.userName || res.name || (res.email || fallbackEmail).split('@')[0],
      role,
    };

    saveSession(authToken, res.refreshToken, userData);
    return userData;
  };

  /**
   * دالة تسجيل الدخول
   */
  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      return processAuthResponse(res, email);
    } finally {
      setLoading(false);
    }
  };

  /**
   * تسجيل زبون جديد
   */
  const registerCustomer = async (formData) => {
    setLoading(true);
    try {
      const res = await authService.registerCustomer({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber || formData.PhoneNumber || formData.phone,
      });
      return processAuthResponse(res, formData.email);
    } finally {
      setLoading(false);
    }
  };

  /**
   * تسجيل شريك مطعم جديد
   */
  const registerVendor = async (formData) => {
    setLoading(true);
    try {
      const res = await authService.registerVendor({
        ownerName: formData.ownerName,
        storeName: formData.storeName,
        cuisine: formData.cuisine,
        description: formData.description,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber || formData.phone,
      });
      return processAuthResponse(res, formData.email);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
        isVendor: user?.role === 'vendor',
        isCustomer: user?.role === 'customer' || (!user?.role && !!token),
        loading,
        login,
        registerCustomer,
        registerVendor,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

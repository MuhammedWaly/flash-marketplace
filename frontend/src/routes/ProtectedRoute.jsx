import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui';

/**
 * ProtectedRoute Guard
 * حارس أمني متعدد الأدوار (Role-Based Route Guard):
 * 1. إذا لم يكن المستخدم مسجلاً ➔ يوجهه لصفحة /login مع حفظ المسار المطلوب.
 * 2. إذا كانت الصفحة خاصة بالتاجر (requiredRole="vendor") والمستخدم ليس تاجراً ➔ يوجهه لـ /
 * 3. إذا كانت الصفحة خاصة بالزبون (requiredRole="customer") والمستخدم تاجر ➔ يوجهه لـ /vendor
 * 
 * @param {'customer' | 'vendor' | 'any'} requiredRole
 */
export function ProtectedRoute({ children, requiredRole = 'any' }) {
  const { isAuthenticated, isVendor, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  // 1. إذا لم يسجل الدخول بعد
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. إذا كانت الصفحة خاصة بالأدمن المركزي
  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 3. إذا كانت الصفحة خاصة بالتاجر والمستخدم ليس تاجراً ولا أدمن
  if (requiredRole === 'vendor' && !isVendor && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 4. إذا كانت الصفحة خاصة بالعميل والمستخدم تاجر
  if (requiredRole === 'customer' && isVendor) {
    return <Navigate to="/vendor" replace />;
  }

  return children;
}
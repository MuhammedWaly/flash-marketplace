import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PageLoader } from '../components/ui';
import { ProtectedRoute } from './ProtectedRoute';

// Layouts
import { CustomerLayout } from '../layouts/CustomerLayout';
import { VendorLayout } from '../layouts/VendorLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';

// Lazy Loaded Feature Pages - Admin
const AdminDashboardPage = lazy(() =>
  import('../features/admin/dashboard/AdminDashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  }))
);

const AdminMerchantsPage = lazy(() =>
  import('../features/admin/merchants/AdminMerchantsPage').then((module) => ({
    default: module.AdminMerchantsPage,
  }))
);

const AdminFinancePage = lazy(() =>
  import('../features/admin/finance/AdminFinancePage').then((module) => ({
    default: module.AdminFinancePage,
  }))
);

const AdminOrdersPage = lazy(() =>
  import('../features/admin/orders/AdminOrdersPage').then((module) => ({
    default: module.AdminOrdersPage,
  }))
);

// Lazy Loaded Feature Pages - Customer
const HomePage = lazy(() =>
  import('../features/customer/home/HomePage').then((module) => ({ default: module.HomePage }))
);

const SearchPage = lazy(() =>
  import('../features/customer/search/SearchPage').then((module) => ({ default: module.SearchPage }))
);

const RestaurantDetailsPage = lazy(() =>
  import('../features/customer/restaurant/RestaurantDetailsPage').then((module) => ({
    default: module.RestaurantDetailsPage,
  }))
);

const CheckoutPage = lazy(() =>
  import('../features/customer/checkout/CheckoutPage').then((module) => ({
    default: module.CheckoutPage,
  }))
);

const MyOrdersPage = lazy(() =>
  import('../features/customer/orders/MyOrdersPage').then((module) => ({
    default: module.MyOrdersPage,
  }))
);

const PaymentSuccessPage = lazy(() =>
  import('../features/customer/payment/PaymentSuccessPage').then((module) => ({
    default: module.PaymentSuccessPage,
  }))
);

// Lazy Loaded Feature Pages - Vendor
const VendorDashboardPage = lazy(() =>
  import('../features/vendor/dashboard/VendorDashboardPage').then((module) => ({
    default: module.VendorDashboardPage,
  }))
);

const VendorOrdersPage = lazy(() =>
  import('../features/vendor/orders/VendorOrdersPage').then((module) => ({
    default: module.VendorOrdersPage,
  }))
);

const VendorMenuPage = lazy(() =>
  import('../features/vendor/menu/VendorMenuPage').then((module) => ({
    default: module.VendorMenuPage,
  }))
);

const VendorSettingsPage = lazy(() =>
  import('../features/vendor/settings/VendorSettingsPage').then((module) => ({
    default: module.VendorSettingsPage,
  }))
);

// Lazy Loaded Feature Pages - Auth
const LoginPage = lazy(() =>
  import('../features/auth/LoginPage').then((module) => ({ default: module.LoginPage }))
);

const RegisterCustomerPage = lazy(() =>
  import('../features/auth/RegisterCustomerPage').then((module) => ({
    default: module.RegisterCustomerPage,
  }))
);

const RegisterVendorPage = lazy(() =>
  import('../features/auth/RegisterVendorPage').then((module) => ({
    default: module.RegisterVendorPage,
  }))
);

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── مسار الزبون (Customer Flow) ── */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="restaurant/:id" element={<RestaurantDetailsPage />} />
          <Route
            path="checkout"
            element={
              <ProtectedRoute requiredRole="customer">
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-orders"
            element={
              <ProtectedRoute requiredRole="customer">
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route path="payment/success" element={<PaymentSuccessPage />} />
        </Route>

        {/* ── مسار لوحة تحكم صاحب المطعم (محمي بـ Role Guard: vendor فقط) ── */}
        <Route
          path="/vendor"
          element={
            <ProtectedRoute requiredRole="vendor">
              <VendorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<VendorDashboardPage />} />
          <Route path="orders" element={<VendorOrdersPage />} />
          <Route path="menu" element={<VendorMenuPage />} />
          <Route path="settings" element={<VendorSettingsPage />} />
        </Route>

        {/* ── مسار لوحة تحكم الإدارة المركزية (Super Admin) ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="merchants" element={<AdminMerchantsPage />} />
          <Route path="finance" element={<AdminFinancePage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
        </Route>

        {/* ── مسار المصادقة (Auth Pages) ── */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register-customer" element={<RegisterCustomerPage />} />
          <Route path="/register-vendor" element={<RegisterVendorPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

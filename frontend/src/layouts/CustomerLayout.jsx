import React, { useState, useEffect, useCallback } from "react";
import {
  Outlet,
  Link,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { useLocationState } from "../context/LocationContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useOrderHub } from "../hooks/useOrderHub";
import { playOrderStatusSound, unlockAudio } from "../utils/soundEffects";
import { RealtimeToast } from "../components/ui";
import { LocationModal } from "../features/customer/location/LocationModal";
import { CartDrawer } from "../features/customer/cart/CartDrawer";
import { CartConflictModal } from "../features/customer/cart/CartConflictModal";
import { HeaderSearchBar } from "../features/customer/search/HeaderSearchBar";

/**
 * CustomerLayout
 * واجهة العميل (Customer View):
 * معزولة تماماً عن أصحاب المطاعم. لو المستخدم مسجل كـ Vendor يتم تحويله فوراً إلى /vendor.
 * تتضمن محرك الإشعارات اللحظية العالمي (Global SignalR Notification Hub).
 */
export function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedLocation, openLocationModal } = useLocationState();
  const { itemsCount, openDrawer } = useCart();
  const { user, isAuthenticated, isVendor, isAdmin, logout } = useAuth();

  const [toastNotification, setToastNotification] = useState(null);

  // تفعيل الصوت عند أول تفاعل للمستخدم مع المتصفح
  useEffect(() => {
    const handleInteraction = () => {
      unlockAudio();
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  const getStatusLabel = (status) => {
    const s = String(status || "").toLowerCase();
    switch (s) {
      case "1":
      case "pending":
      case "placed":
        return "تم استلام طلبك بنجاح";
      case "confirmed":
        return "المطعم قبل طلبك وبدأ في التجهيز";
      case "2":
      case "processing":
      case "preparing":
        return "وجبتك الآن قيد التحضير في المطبخ";
      case "3":
      case "shipped":
      case "outfordelivery":
        return "الطيار استلم الوجبة وفي الطريق إليك!";
      case "4":
      case "delivered":
        return "بالهناء والشفاء! تم تسليم طلبك بنجاح";
      case "5":
      case "cancelled":
      case "canceled":
        return "تم إلغاء الطلب";
      default:
        return status || "تحديث جديد في الطلب";
    }
  };

  // معالجة وصول تحديث لحالة الأوردر لحظياً في أي صفحة
  const handleOrderStatusChanged = useCallback((payload) => {
    playOrderStatusSound();
    const label = getStatusLabel(payload.newStatus);
    setToastNotification({
      title: "تحديث في حالة طلبك ",
      message: `طلبك من "${payload.restaurantName || "المطعم"}": ${label}`,
      orderId: payload.orderId,
    });

    // إرسال حدث عام بالمتصفح لأي صفحة داخلية ترغب في تحديث بياناتها فوراً
    window.dispatchEvent(
      new CustomEvent("customer-order-status-changed", { detail: payload }),
    );
  }, []);

  // ربط SignalR على مستوى الـ Layout الكامل
  useOrderHub({
    onOrderStatusChanged:
      isAuthenticated && !isVendor ? handleOrderStatusChanged : undefined,
  });

  // عزل صارم: صاحب المطعم يتوجه مباشرة لواجهة مطعمه ولوحة تحكمه
  if (isAuthenticated && isVendor) {
    return <Navigate to="/vendor" replace />;
  }

  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink font-readex">
      {/* ── Header Navigation ── */}
      <header className="sticky top-0 z-30 bg-white/95 border-b border-rule backdrop-blur">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand & Location Pin */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-xl font-bold tracking-tight text-ink group-hover:text-accent transition-colors">
                طلبلي
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            </Link>

            {/* Location Pin Trigger */}
            <button
              type="button"
              onClick={openLocationModal}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper border border-rule hover:border-rule-strong text-xs font-medium text-ink-secondary transition-colors whitespace-nowrap cursor-pointer"
            >
              <svg
                className="text-accent flex-shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="truncate max-w-[160px]">
                {selectedLocation?.isConfigured && selectedLocation?.addressName
                  ? selectedLocation.addressName
                  : "تحديد موقع التوصيل"}
              </span>
              <span className="text-ink-faint">
                {selectedLocation?.isConfigured ? "تغيير" : "اختيار"}
              </span>
            </button>
          </div>

          {/* Quick Search Bar (Only on non-homepages: Live Top 7 Autocomplete Search) */}
          {!isHomePage ? (
            <div className="hidden md:flex flex-1 justify-center">
              <HeaderSearchBar />
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Trigger */}
            <button
              type="button"
              onClick={openDrawer}
              className="relative p-2 rounded-lg text-ink-secondary hover:bg-paper transition-colors cursor-pointer"
              aria-label="عرض سلة الطلبات"
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {itemsCount > 0 && (
                <span className="absolute -top-1 -left-1 w-4 h-4 bg-accent text-white rounded-full text-[10px] font-semibold flex items-center justify-center">
                  {itemsCount}
                </span>
              )}
            </button>

            {/* My Orders Link */}
            <Link
              to="/my-orders"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink rounded-md transition-colors"
            >
              <span>سجل طلباتي</span>
            </Link>

            {/* Vendor Portal Link */}
            <Link
              to="/vendor"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink rounded-md transition-colors"
            >
              <span>بوابة المطاعم</span>
            </Link>

            {/* Super Admin Console Link */}
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-accent-light text-accent border border-accent/20 rounded-lg hover:bg-accent hover:text-surface transition-colors"
              >
                <span>لوحة الإدارة ⚡</span>
              </Link>
            )}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-ink px-2">
                  {user.name}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs text-ink-muted hover:text-red-600 transition"
                >
                  خروج
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-2.5 py-1.5 text-xs font-medium text-ink-muted hover:text-ink transition-colors"
                >
                  دخول
                </Link>
                <Link
                  to="/register-customer"
                  className="btn btn-primary text-xs py-1.5 px-3"
                >
                  حساب جديد
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Address Bar */}
      <div className="sm:hidden bg-paper-subtle border-b border-rule px-4 py-2 flex items-center justify-between text-xs text-ink-muted">
        <div className="flex items-center gap-1.5 truncate">
          <svg
            className="text-accent flex-shrink-0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>
            موقع التوصيل:{" "}
            <strong className="text-ink">
              {selectedLocation?.addressName || "الدقي، شارع التحرير"}
            </strong>
          </span>
        </div>
        <button
          type="button"
          onClick={openLocationModal}
          className="text-accent font-medium text-[11px] whitespace-nowrap mr-2"
        >
          تعديل
        </button>
      </div>

      {/* Main Dynamic View */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Modals & Drawers */}
      <LocationModal />
      <CartDrawer />
      <CartConflictModal />

      {/* Global Realtime Notification Toast */}
      <RealtimeToast
        isOpen={Boolean(toastNotification)}
        onClose={() => setToastNotification(null)}
        type="customer"
        title={toastNotification?.title}
        message={toastNotification?.message}
        actionText="سجل طلباتي"
        onAction={() => navigate("/my-orders")}
      />

      {/* Footer (Exact HTML structure) */}
      <footer className="border-t border-rule bg-white py-10 mt-16 text-xs text-ink-muted">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 طلبلي. منصة طلب الطعام بدقة الموقع على الخريطة.</p>
          <div className="flex items-center gap-5">
            <Link to="/vendor" className="hover:text-accent transition-colors">
              بوابة أصحاب المطاعم
            </Link>
            <Link
              to="/my-orders"
              className="hover:text-accent transition-colors"
            >
              تتبع الطلبات
            </Link>
            <a href="#" className="hover:text-accent transition-colors">
              الشروط والأحكام
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

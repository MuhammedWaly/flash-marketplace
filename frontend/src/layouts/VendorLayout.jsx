import { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vendorService } from '../services/vendorService';
import { useOrderHub } from '../hooks/useOrderHub';
import { playNewOrderSound, unlockAudio } from '../utils/soundEffects';
import { RealtimeToast } from '../components/ui';
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  Edit2,
} from 'lucide-react';

export function VendorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [vendorSettings, setVendorSettings] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(null);

  // تفعيل الصوت عند أول تفاعل
  useEffect(() => {
    const handleInteraction = () => {
      unlockAudio();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchVendorInfo = async () => {
      try {
        const settings = await vendorService.getSettings();
        if (isMounted && settings) {
          setVendorSettings(settings);
          if (settings.name) {
            localStorage.setItem('vendor_store_name', settings.name);
          }
        }
      } catch (err) {
        console.warn('تعذر جلب إعدادات المطعم في الهيدر:', err);
      }
    };

    fetchVendorInfo();

    // الاستماع للتحديثات الفورية للاسم من شاشة الإعدادات
    const handleSettingsUpdate = (e) => {
      if (e.detail) {
        setVendorSettings((prev) => ({
          ...(prev || {}),
          name: e.detail.name || prev?.name,
          addressTitle: e.detail.addressTitle !== undefined ? e.detail.addressTitle : prev?.addressTitle,
          isOpen: e.detail.isOpen !== undefined ? e.detail.isOpen : prev?.isOpen,
          logoUrl: e.detail.logoUrl || prev?.logoUrl,
        }));
      }
    };

    window.addEventListener('vendor-settings-updated', handleSettingsUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('vendor-settings-updated', handleSettingsUpdate);
    };
  }, []);

  const restaurantId = vendorSettings?.restaurantId || vendorSettings?.id;

  // معالجة وصول طلب جديد للمطبخ لحظياً في أي صفحة بلوحة التحكم
  const handleOrderReceived = useCallback((newOrder) => {
    playNewOrderSound();
    setNewOrderAlert(newOrder);

    // إرسال حدث عام بالمتصفح لتحديث شاشة الطلبات الحية في حال كانت مفتوحة
    window.dispatchEvent(
      new CustomEvent('vendor-new-order', { detail: newOrder })
    );
  }, []);

  const handleStatusChanged = useCallback((payload) => {
    window.dispatchEvent(
      new CustomEvent('vendor-order-status-changed', { detail: payload })
    );
  }, []);

  // الانضمام الدائم لغرفة المطعم والاستماع للطلبات الواردة طالما التاجر داخل البوابة
  useOrderHub({
    restaurantId: restaurantId ? String(restaurantId) : undefined,
    onOrderReceived: restaurantId ? handleOrderReceived : undefined,
    onOrderStatusChanged: restaurantId ? handleStatusChanged : undefined,
  });

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const storeName =
    vendorSettings?.name ||
    vendorSettings?.storeName ||
    localStorage.getItem('vendor_store_name') ||
    user?.storeName ||
    user?.name ||
    'مطعمي';

  const storeSubtitle = vendorSettings?.addressTitle
    ? `فرع ${vendorSettings.addressTitle}`
    : 'لوحة التحكم والعمليات';

  const isOpen = vendorSettings?.isOpen !== false;

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row font-readex text-ink antialiased" dir="rtl">
      {/* ── Mobile Top Header ── */}
      <div className="md:hidden bg-surface border-b border-rule px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="p-1.5 rounded-lg border border-rule text-ink-muted hover:bg-paper cursor-pointer"
            aria-label="القائمة الجانبية"
          >
            {isMobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-ink truncate max-w-[170px]">{storeName}</span>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${isOpen ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'}`}
                title={isOpen ? 'المطعم يستقبل الطلبات' : 'المطعم مغلق حالياً'}
              />
            </div>
            <p className="text-[10px] text-ink-muted truncate max-w-[170px]">{storeSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/vendor/settings"
            className="p-1.5 text-ink-muted hover:text-accent rounded-lg border border-rule/60 hover:bg-paper transition-colors"
            title="تعديل اسم وبيانات المطعم"
          >
            <Edit2 size={13} />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="text-[11px] text-red-600 hover:underline cursor-pointer font-medium"
          >
            خروج
          </button>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <aside className={`vendor-sidebar ${isMobileNavOpen ? 'is-open' : ''}`}>
        {/* Brand */}
        <div className="p-4 border-b border-rule flex items-center justify-between gap-2">
          <Link
            to="/vendor"
            className="text-sm font-bold text-ink hover:text-accent transition-colors flex items-center gap-1.5 group"
          >
            <span>طلبلي للشركاء</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block group-hover:scale-125 transition-transform" />
          </Link>

          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}
            title={isOpen ? 'المطعم متاح للطلب' : 'المطعم مغلق حالياً'}
          />
        </div>

        {/* Restaurant Identity Card (اسم المطعم والفرع وزر التعديل السريع) */}
        <div className="p-3 mx-3 my-2.5 bg-paper rounded-xl border border-rule/80 flex items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-surface border border-rule overflow-hidden flex items-center justify-center shrink-0">
              {vendorSettings?.logoUrl ? (
                <img
                  src={vendorSettings.logoUrl}
                  alt={storeName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <Store size={18} className="text-accent" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-ink truncate leading-tight" title={storeName}>
                {storeName}
              </p>
              <p className="text-[10px] text-ink-muted truncate mt-0.5">
                {storeSubtitle}
              </p>
            </div>
          </div>

          <Link
            to="/vendor/settings"
            onClick={() => setIsMobileNavOpen(false)}
            className="p-1.5 rounded-lg text-ink-muted hover:text-accent hover:bg-surface border border-transparent hover:border-rule/80 transition-colors shrink-0 cursor-pointer"
            title="تعديل اسم وبيانات المطعم"
          >
            <Edit2 size={13} />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="vendor-sidebar__nav space-y-1">
          <NavLink
            to="/vendor"
            end
            onClick={() => setIsMobileNavOpen(false)}
            className={({ isActive }) =>
              `vendor-sidebar__link ${isActive ? 'vendor-sidebar__link--active' : ''}`
            }
          >
            <LayoutDashboard size={16} />
            <span>نظرة عامة على اليوم</span>
          </NavLink>

          <NavLink
            to="/vendor/orders"
            onClick={() => setIsMobileNavOpen(false)}
            className={({ isActive }) =>
              `vendor-sidebar__link ${isActive ? 'vendor-sidebar__link--active' : ''}`
            }
          >
            <ClipboardList size={16} />
            <span>إدارة الطلبات الحية</span>
          </NavLink>

          <NavLink
            to="/vendor/menu"
            onClick={() => setIsMobileNavOpen(false)}
            className={({ isActive }) =>
              `vendor-sidebar__link ${isActive ? 'vendor-sidebar__link--active' : ''}`
            }
          >
            <UtensilsCrossed size={16} />
            <span>قائمة أطباق المنيو</span>
          </NavLink>

          <NavLink
            to="/vendor/settings"
            onClick={() => setIsMobileNavOpen(false)}
            className={({ isActive }) =>
              `vendor-sidebar__link ${isActive ? 'vendor-sidebar__link--active' : ''}`
            }
          >
            <Settings size={16} />
            <span>إعدادات المطعم والفرع</span>
          </NavLink>
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-rule mt-auto">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-xs text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer font-medium"
          >
            <LogOut size={14} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for Mobile */}
      {isMobileNavOpen && (
        <div
          onClick={() => setIsMobileNavOpen(false)}
          className="fixed inset-0 bg-ink/25 backdrop-blur-xs z-30 md:hidden transition-opacity"
        />
      )}

      {/* ── Main Workspace ── */}
      <main className="vendor-main flex-1 flex flex-col min-h-screen">
        <Outlet />
      </main>

      {/* Global Realtime Order Toast */}
      <RealtimeToast
        isOpen={Boolean(newOrderAlert)}
        onClose={() => setNewOrderAlert(null)}
        type="vendor"
        title={`طلب جديد للمطبخ! #${newOrderAlert?.orderNumber || ''}`}
        message={`العميل: ${newOrderAlert?.customerName || 'عميل كرام'} · بقيمة: ${newOrderAlert?.totalAmount || ''} ج.م`}
        actionText="شاشة الطلبات الحية"
        onAction={() => navigate('/vendor/orders')}
        duration={12000}
      />
    </div>
  );
}

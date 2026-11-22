import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import {
  LayoutDashboard,
  Store,
  Receipt,
  ShoppingBag,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // جلب عدد المطاعم بانتظار الاعتماد لعرض شارة تنبيهية
  useEffect(() => {
    let isMounted = true;
    const fetchPendingCount = async () => {
      try {
        const overview = await adminService.getFinanceOverview();
        if (isMounted && overview && typeof overview.pendingMerchantsCount === 'number') {
          setPendingCount(overview.pendingMerchantsCount);
        }
      } catch (err) {
        console.warn('تعذر قراءة إحصائيات الأدمن في السايدبار:', err);
      }
    };
    fetchPendingCount();
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    {
      to: '/admin',
      end: true,
      label: 'نظرة عامة والتحليلات',
      icon: <LayoutDashboard size={18} />,
    },
    {
      to: '/admin/merchants',
      label: 'اعتماد ومراجعة المطاعم',
      icon: <Store size={18} />,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeVariant: 'warning',
    },
    {
      to: '/admin/finance',
      label: 'المالية والعمولات والتحويلات',
      icon: <Receipt size={18} />,
    },
    {
      to: '/admin/orders',
      label: 'مراقبة طلبات المنصة',
      icon: <ShoppingBag size={18} />,
    },
  ];

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row text-ink font-readex antialiased" dir="rtl">
      {/* ── Mobile Header ── */}
      <header className="md:hidden bg-surface/95 border-b border-rule px-4 py-3 flex items-center justify-between sticky top-0 z-30 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="p-2 rounded-xl border border-rule text-ink-muted hover:bg-paper hover:text-ink transition-colors cursor-pointer"
            aria-label="القائمة الجانبية"
          >
            {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-ink">طلبلي</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent-light text-accent font-semibold mr-1">
              الإدارة
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs text-danger hover:underline font-medium cursor-pointer"
        >
          خروج
        </button>
      </header>

      {/* ── Desktop Sidebar ── */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 w-64 bg-surface border-l border-rule flex flex-col justify-between transition-transform duration-200 ease-out md:translate-x-0 md:static md:z-auto shadow-sm ${
          isMobileNavOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1">
          {/* Brand header */}
          <div className="px-6 py-5 border-b border-rule flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center font-bold text-sm shadow-sm">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-ink group-hover:text-accent transition-colors">
                    طلبلي
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                </div>
                <span className="text-[11px] text-ink-muted block font-medium">لوحة الإدارة المركزية</span>
              </div>
            </Link>

            {isMobileNavOpen && (
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="md:hidden text-ink-muted hover:text-ink p-1 rounded-lg hover:bg-paper cursor-pointer"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Nav links */}
          <nav className="p-3.5 space-y-1.5 flex-1">
            <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-ink-faint tracking-wider uppercase">
              التحكم والمراقبة
            </div>

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setIsMobileNavOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-accent-light text-accent font-semibold shadow-xs border border-accent/20'
                      : 'text-ink-muted hover:text-ink hover:bg-paper'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-warning-light text-warning border border-warning/30 text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}

            <div className="pt-4 px-3 pb-1 text-[11px] font-bold text-ink-faint tracking-wider uppercase">
              معاينة المنصة
            </div>

            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-ink-muted hover:text-ink hover:bg-paper transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Store size={16} />
                <span>واجهة الزبائن</span>
              </div>
              <ExternalLink size={13} className="text-ink-faint group-hover:text-ink transition-colors" />
            </Link>

            <Link
              to="/vendor"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-ink-muted hover:text-ink hover:bg-paper transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Building2 size={16} />
                <span>بوابة التجار</span>
              </div>
              <ExternalLink size={13} className="text-ink-faint group-hover:text-ink transition-colors" />
            </Link>
          </nav>
        </div>

        {/* Footer User Info */}
        <div className="p-4 border-t border-rule bg-paper/50 space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-accent-light text-accent flex items-center justify-center font-bold text-xs shrink-0 border border-accent/20">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-ink truncate leading-tight">
                {user?.name || 'مدير النظام الرئيسي'}
              </p>
              <p className="text-[10px] text-ink-muted truncate font-mono mt-0.5">
                {user?.email || 'admin@talabli.com'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-rule hover:border-danger/30 hover:bg-danger-light text-ink-muted hover:text-danger text-xs font-medium transition-all cursor-pointer"
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
          className="fixed inset-0 bg-ink/30 backdrop-blur-xs z-30 md:hidden transition-opacity"
        />
      )}

      {/* ── Main Content Container ── */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}

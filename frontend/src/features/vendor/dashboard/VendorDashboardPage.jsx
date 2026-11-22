import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vendorService } from '../../../services/vendorService';

export function VendorDashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayOrdersCount: 0,
    pendingOrdersCount: 0,
    activeOrdersCount: 0,
    averageRating: 0,
    isOpen: true,
  });

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [statsData, ordersData] = await Promise.allSettled([
          vendorService.getStats(),
          vendorService.getOrders({ status: 'all', pageNumber: 1, pageSize: 5 }),
        ]);

        if (isMounted) {
          if (statsData.status === 'fulfilled' && statsData.value) {
            setStats(statsData.value);
          }
          if (ordersData.status === 'fulfilled' && ordersData.value) {
            const list = Array.isArray(ordersData.value)
              ? ordersData.value
              : ordersData.value?.items || [];
            setOrders(list);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('فشل جلب بيانات لوحة التحكم:', err);
          setError('تعذر تحميل بيانات لوحة التحكم.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">تم التأكيد</span>;
      case 'preparing':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800">جاري التحضير</span>;
      case 'shipped':
      case 'outfordelivery':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700">في الطريق</span>;
      case 'delivered':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800">تم التسليم</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-paper text-ink-muted">{status || 'جديد'}</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col font-readex">
      {/* Header */}
      <header className="bg-surface border-b border-rule px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-ink">
              مرحباً بك، {stats?.restaurantName || localStorage.getItem('vendor_store_name') || 'شريكنا العزيز'}
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          </div>
          <p className="text-xs text-ink-muted mt-0.5">ملخص حركة المبيعات وأداء اليوم لحظة بلحظة</p>
        </div>
        <Link to="/vendor/orders" className="btn btn-primary text-xs py-1.5 px-3">
          الطلبات الواردة ({orders.length})
        </Link>
      </header>

      {/* Main Stats and Table */}
      <main className="p-6 space-y-6 flex-1">
        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface border border-rule rounded-xl p-4 space-y-1 shadow-2xs">
            <span className="text-xs text-ink-muted block">إجمالي أرباح المحفظة</span>
            <span className="text-xl font-bold text-ink block tabular-nums text-emerald-700">
              {Number(stats.totalRevenue || 0).toLocaleString()} ج.م
            </span>
            <span className="text-[11px] text-emerald-700">تزداد فورياً مع كل تسليم ناجح</span>
          </div>

          <div className="bg-surface border border-rule rounded-xl p-4 space-y-1 shadow-2xs">
            <span className="text-xs text-ink-muted block">الطلبات المسلمة (المكتملة)</span>
            <span className="text-xl font-bold text-ink block tabular-nums">
              {stats.completedOrdersCount ?? 0} طلب مكتمل
            </span>
            <span className="text-[11px] text-ink-faint">
              من إجمالي {stats.totalOrdersCount ?? stats.todayOrdersCount ?? 0} طلب مسجل
            </span>
          </div>

          <div className="bg-surface border border-rule rounded-xl p-4 space-y-1 shadow-2xs">
            <span className="text-xs text-ink-muted block">طلبات اليوم وحالتها</span>
            <span className="text-xl font-bold text-ink block tabular-nums">
              {stats.todayOrdersCount || 0} طلباً اليوم
            </span>
            <span className="text-[11px] text-ink-faint">
              {stats.activeOrdersCount || 0} نشط · {stats.pendingOrdersCount || 0} معلق
            </span>
          </div>

          <div className="bg-surface border border-rule rounded-xl p-4 space-y-1 shadow-2xs">
            <span className="text-xs text-ink-muted block">حالة المتجر والتقييم</span>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-sm font-bold text-amber-600">
                ★ {Number(stats.averageRating || 0).toFixed(1)}
              </span>
              <span className="text-xs font-semibold">
                {stats.isOpen !== false ? (
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">مفتوح للطلب</span>
                ) : (
                  <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded">مغلق مؤقتاً</span>
                )}
              </span>
            </div>
            <span className="text-[11px] text-ink-faint block mt-0.5">
              استناداً إلى {stats.reviewCount || 0} تقييم
            </span>
          </div>
        </section>

        {/* Live Incoming Orders Table */}
        <section className="bg-surface border border-rule rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-rule">
            <h2 className="text-xs font-bold text-ink">أحدث الطلبات الواردة</h2>
            <Link to="/vendor/orders" className="text-xs text-accent hover:underline">
              عرض جميع الطلبات ({orders.length})
            </Link>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-ink-muted animate-pulse">
              جاري تحميل الطلبات الواردة…
            </div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="border-b border-rule text-ink-muted">
                    <th className="pb-2 font-semibold">رقم الطلب</th>
                    <th className="pb-2 font-semibold">اسم العميل</th>
                    <th className="pb-2 font-semibold">الأصناف</th>
                    <th className="pb-2 font-semibold">الإجمالي</th>
                    <th className="pb-2 font-semibold">الحالة</th>
                    <th className="pb-2 font-semibold">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule/60">
                  {orders.map((ord) => (
                    <tr key={ord.orderId || ord.id} className="hover:bg-paper-subtle/40">
                      <td className="py-3 font-semibold text-ink">#{ord.orderNumber || ord.orderId || ord.id}</td>
                      <td className="py-3">
                        <span className="font-medium text-ink block">{ord.customerName || ord.customer || 'عميل'}</span>
                        <span className="text-[11px] text-ink-faint">{ord.customerPhone || ''}</span>
                      </td>
                      <td className="py-3 max-w-xs truncate text-ink-secondary">
                        {Array.isArray(ord.items)
                          ? ord.items.map((i) => `${i.quantity || 1}x ${i.productName || i.name || i.dishName || i.dish?.name || i.title || i.itemName || 'صنف'}`).join('، ')
                          : ord.items || '—'}
                      </td>
                      <td className="py-3 font-bold text-ink whitespace-nowrap tabular-nums">
                        {Number(ord.totalAmount || ord.total || 0).toFixed(2)} ج.م
                      </td>
                      <td className="py-3">
                        {getStatusBadge(ord.status)}
                      </td>
                      <td className="py-3">
                        <Link
                          to="/vendor/orders"
                          className="btn btn-outline btn-sm text-[11px] py-1 px-2.5"
                        >
                          إدارة
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-ink-muted text-xs">
              لا توجد طلبات واردة في الوقت الحالي.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

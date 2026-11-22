import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../../services/orderService';
import { orderHubService } from '../../../services/orderHubService';
import { CustomerOrderCard } from './components/CustomerOrderCard';
import { RatingModal } from './RatingModal';
import { Bell, CheckCircle2 } from 'lucide-react';

export function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [ratingModalOrder, setRatingModalOrder] = useState(null);
  const [statusAlert, setStatusAlert] = useState(null);
  const [isConnected, setIsConnected] = useState(orderHubService.isConnected());

  // متابعة حالة اتصال البث المباشر (SignalR)
  useEffect(() => {
    setIsConnected(orderHubService.isConnected());
    const unsub = orderHubService.onConnectionStatus((status) => {
      setIsConnected(status === 'connected');
    });
    return unsub;
  }, []);

  // تحديث قائمة الطلبات لحظياً عند وصول حدث من CustomerLayout
  useEffect(() => {
    const handleStatusEvent = (e) => {
      const payload = e.detail;
      if (!payload) return;
      setOrders((prev) =>
        prev.map((ord) => {
          const id = ord.id || ord.orderId;
          if (id === payload.orderId || ord.orderNumber === payload.orderId) {
            return { ...ord, status: payload.newStatus };
          }
          return ord;
        })
      );

      setStatusAlert({
        orderId: payload.orderId,
        newStatus: payload.newStatus,
        restaurantName: payload.restaurantName,
      });

      setTimeout(() => {
        setStatusAlert((current) => (current?.orderId === payload.orderId ? null : current));
      }, 7000);
    };

    window.addEventListener('customer-order-status-changed', handleStatusEvent);
    return () => {
      window.removeEventListener('customer-order-status-changed', handleStatusEvent);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await orderService.getMyOrders({ pageNumber: 1, pageSize: 5 });
        if (isMounted) {
          const list = Array.isArray(response) ? response : response?.items || [];
          setOrders(list);
          setPageNumber(1);
          setHasNextPage(Boolean(response?.hasNextPage));
          setTotalCount(response?.totalCount ?? list.length);
        }
      } catch (err) {
        if (isMounted) {
          console.error('فشل جلب الطلبات:', err);
          setError('تعذر تحميل سجل طلباتك من الخادم.');
          setOrders([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasNextPage) return;
    setIsLoadingMore(true);
    try {
      const nextPage = pageNumber + 1;
      const response = await orderService.getMyOrders({ pageNumber: nextPage, pageSize: 5 });
      const nextList = Array.isArray(response) ? response : response?.items || [];

      setOrders((prev) => {
        const existingIds = new Set(prev.map((o) => o.id || o.orderId || o.orderNumber));
        const filteredNew = nextList.filter((o) => !existingIds.has(o.id || o.orderId || o.orderNumber));
        return [...prev, ...filteredNew];
      });
      setPageNumber(nextPage);
      setHasNextPage(Boolean(response?.hasNextPage));
    } catch (err) {
      console.error('فشل تحميل المزيد من الطلبات:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSendRating = async (orderId, ratingData) => {
    try {
      await orderService.rateOrder(orderId, ratingData);
      alert('تم إرسال تقييمك بنجاح، شكراً لمشاركتك!');
      setRatingModalOrder(null);
    } catch (err) {
      console.error('فشل إرسال التقييم:', err);
      alert('حدث خطأ أثناء إرسال التقييم، يرجى المحاولة لاحقاً.');
    }
  };

  return (
    <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-10 space-y-6 font-readex">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-rule">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink">سجل طلباتي</h1>
           
          </div>
          <p className="text-xs text-ink-muted mt-0.5">تتبع مراحل تنفيذ طلباتك الحالية وسجل العمليات السابقة لحظياً</p>
        </div>
        <Link to="/search" className="btn btn-outline text-xs px-4 py-2">
          طلب جديد
        </Link>
      </div>

      {/* Floating Status Update Alert */}
      {statusAlert && (
        <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl flex items-center justify-between gap-3 text-xs text-ink animate-bounce shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
              <Bell size={14} />
            </div>
            <div>
              <span className="font-bold block">تحديث فوري في طلبك!</span>
              <span className="text-ink-secondary">
                قام {statusAlert.restaurantName} بتحديث حالة طلبك إلى{' '}
                <strong className="text-accent">{statusAlert.newStatus}</strong>.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusAlert(null)}
            className="text-ink-muted hover:text-ink text-xs font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-surface rounded-xl border border-rule p-5 animate-pulse space-y-4">
              <div className="h-4 bg-paper-subtle rounded w-1/3" />
              <div className="h-3 bg-paper-subtle rounded w-1/4" />
              <div className="h-10 bg-paper-subtle rounded w-full mt-4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-rule p-6">
          <p className="text-sm text-ink-muted mb-2">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn btn-outline text-xs px-4 py-1.5"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((ord) => (
            <CustomerOrderCard
              key={ord.orderId || ord.id}
              order={ord}
              onRateOrder={setRatingModalOrder}
            />
          ))}

          {hasNextPage && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="btn btn-outline text-xs px-6 py-2.5 font-bold hover:bg-surface-elevated transition-colors inline-flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                {isLoadingMore ? (
                  <>
                    <span className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                    <span>جاري تحميل طلبات أقدم...</span>
                  </>
                ) : (
                  <>
                    <span>عرض المزيد من الطلبات السابقة</span>
                    <span className="text-[11px] text-ink-muted">({orders.length} من {totalCount})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-xl border border-rule p-8 space-y-3">
          <p className="text-base font-bold text-ink">لا توجد طلبات مسجلة بعد</p>
          <p className="text-xs text-ink-muted">
            عند إتمام أول طلب لك عبر المنصة، ستتمكن من متابعة مراحله خطوة بخطوة من هنا.
          </p>
          <div className="pt-2">
            <Link to="/search" className="btn btn-primary text-xs px-5 py-2">
              تصفح المطاعم وابدأ طلبك الأول
            </Link>
          </div>
        </div>
      )}

      {/* ── Rating Modal ── */}
      {ratingModalOrder && (
        <RatingModal
          isOpen={Boolean(ratingModalOrder)}
          onClose={() => setRatingModalOrder(null)}
          order={ratingModalOrder}
          onSubmitRating={handleSendRating}
        />
      )}
    </div>
  );
}

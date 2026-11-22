import React, { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { vendorService } from "../../../services/vendorService";
import { orderHubService } from "../../../services/orderHubService";
import { STATUS_TABS, createCustomerPinIcon } from "./constants";
import { buildDriverWhatsAppText } from "./utils/driverWhatsAppHelper";
import { VendorOrderCard } from "./components/VendorOrderCard";
import { DriverDeliveryMapModal } from "./components/DriverDeliveryMapModal";
import { playNewOrderSound, unlockAudio } from "../../../utils/soundEffects";
import { Modal } from "../../../components/ui";
import {
  Bell,
  Volume2,
  Radio,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";

export function VendorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(orderHubService.isConnected());
  const [orderToCancel, setOrderToCancel] = useState(null);

  // حالة مودال خريطة توصيل الطلب للطيار
  const [selectedOrderForMap, setSelectedOrderForMap] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const orderMapContainerRef = useRef(null);
  const orderMapInstanceRef = useRef(null);

  // متابعة حالة اتصال الـ SignalR العام
  useEffect(() => {
    setIsConnected(orderHubService.isConnected());
    const unsub = orderHubService.onConnectionStatus((status) => {
      setIsConnected(status === "connected");
    });
    return unsub;
  }, []);

  // الاستماع للأحداث اللحظية من الـ VendorLayout العام
  useEffect(() => {
    const handleNewOrder = (e) => {
      const newOrder = e.detail;
      if (!newOrder) return;
      setOrders((prev) => {
        const exists = prev.some(
          (o) => (o.id || o.orderId) === (newOrder.id || newOrder.orderId),
        );
        if (exists) return prev;
        return [newOrder, ...prev];
      });

      setNewOrderAlert({
        id: newOrder.id || newOrder.orderId,
        orderNumber: newOrder.orderNumber,
        totalAmount: newOrder.totalAmount,
        customerName: newOrder.customerName || "عميل جديد",
      });
    };

    const handleStatusChanged = (e) => {
      const payload = e.detail;
      if (!payload) return;
      setOrders((prev) =>
        prev.map((ord) => {
          const id = ord.id || ord.orderId;
          if (id === payload.orderId || ord.orderNumber === payload.orderId) {
            return { ...ord, status: payload.newStatus };
          }
          return ord;
        }),
      );
    };

    window.addEventListener("vendor-new-order", handleNewOrder);
    window.addEventListener("vendor-order-status-changed", handleStatusChanged);

    return () => {
      window.removeEventListener("vendor-new-order", handleNewOrder);
      window.removeEventListener(
        "vendor-order-status-changed",
        handleStatusChanged,
      );
    };
  }, []);

  const handleTestChime = () => {
    unlockAudio();
    playNewOrderSound();
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vendorService.getOrders({ status: filterStatus });
      setOrders(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      console.error("فشل جلب الطلبات من السيرفر:", err);
      setError("تعذر تحميل الطلبات من الخادم حالياً.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await vendorService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId || o.orderId === orderId
            ? { ...o, status: newStatus }
            : o,
        ),
      );
    } catch (err) {
      console.error("فشل تحديث حالة الطلب:", err);
      alert("حدث خطأ أثناء تحديث حالة الطلب بالسيرفر.");
    } finally {
      setUpdatingId(null);
    }
  };

  // تهيئة خريطة التوصيل عند فتح المودال للطلب المحدد
  useEffect(() => {
    if (!selectedOrderForMap) return;

    const lat =
      selectedOrderForMap.deliveryLocation?.latitude ||
      selectedOrderForMap.latitude ||
      selectedOrderForMap.lat ||
      30.0382;
    const lng =
      selectedOrderForMap.deliveryLocation?.longitude ||
      selectedOrderForMap.longitude ||
      selectedOrderForMap.lng ||
      31.2117;

    const timer = setTimeout(() => {
      if (!orderMapContainerRef.current) return;

      if (!orderMapInstanceRef.current) {
        const map = L.map(orderMapContainerRef.current, {
          center: [lat, lng],
          zoom: 15,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);

        L.marker([lat, lng], {
          icon: createCustomerPinIcon(),
        }).addTo(map);

        orderMapInstanceRef.current = map;
        setTimeout(() => map.invalidateSize(), 150);
      } else {
        orderMapInstanceRef.current.setView([lat, lng], 15);
        orderMapInstanceRef.current.invalidateSize();
      }
    }, 120);

    return () => {
      clearTimeout(timer);
    };
  }, [selectedOrderForMap]);

  // إزالة الخريطة عند إغلاق المودال
  const handleCloseMapModal = () => {
    if (orderMapInstanceRef.current) {
      orderMapInstanceRef.current.remove();
      orderMapInstanceRef.current = null;
    }
    setSelectedOrderForMap(null);
  };

  // نسخ بيانات الدليفري للطيار بصيغة واتساب جاهزة
  const handleCopyForDelivery = (ord) => {
    const text = buildDriverWhatsAppText(ord);
    const orderId = ord.orderNumber || ord.orderId || ord.id;
    navigator.clipboard.writeText(text);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const getTabCount = (tabValue) => {
    if (tabValue === "all") return orders.length;
    return orders.filter((o) => {
      const s = String(o.status || "").toLowerCase();
      if (tabValue === "pending")
        return s === "1" || s === "pending" || s === "placed";
      if (tabValue === "preparing")
        return (
          s === "2" ||
          s === "processing" ||
          s === "preparing" ||
          s === "confirmed"
        );
      if (tabValue === "active")
        return s === "3" || s === "shipped" || s === "outfordelivery";
      if (tabValue === "delivered") return s === "4" || s === "delivered";
      if (tabValue === "cancelled")
        return s === "5" || s === "cancelled" || s === "canceled";
      return false;
    }).length;
  };

  return (
    <div className="flex-1 flex flex-col font-readex max-w-6xl w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-rule">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-ink">
              إدارة الطلبات{" "}
            </h1>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            تابع تحضير الأطباق في المطبخ لحظياً وشارك خريطة وموقع العميل مباشرة
            مع كباتن التوصيل
          </p>
        </div>
      </div>

      {/* ── New Order Real-Time Alert Banner ── */}

      {/* Tabs */}
      <div className="bg-surface border border-rule rounded-xl px-4 py-2 overflow-x-auto no-scrollbar shadow-2xs">
        <div className="flex gap-2 py-1">
          {STATUS_TABS.map((tab) => {
            const count = getTabCount(tab.value);
            const isActive = filterStatus === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilterStatus(tab.value)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                  isActive
                    ? "bg-accent text-white shadow-xs"
                    : "text-ink-muted hover:text-ink hover:bg-paper"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive
                      ? "bg-white/20 text-white font-bold"
                      : "bg-paper-2 text-ink-muted"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      <main className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-surface rounded-2xl border border-rule p-6 animate-pulse space-y-3 shadow-xs"
              >
                <div className="h-4 bg-paper-subtle rounded w-1/4" />
                <div className="h-3 bg-paper-subtle rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-surface rounded-2xl border border-rule p-6">
            <p className="text-sm text-ink-muted mb-2">{error}</p>
            <button
              type="button"
              onClick={fetchOrders}
              className="btn btn-outline text-xs px-4 py-1.5 cursor-pointer"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((ord) => (
              <VendorOrderCard
                key={ord.id || ord.orderId || ord.orderNumber}
                order={ord}
                updatingId={updatingId}
                copiedId={copiedId}
                onStatusChange={handleStatusChange}
                onOpenMapModal={setSelectedOrderForMap}
                onCopyForDelivery={handleCopyForDelivery}
                onRequestCancel={setOrderToCancel}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface rounded-2xl border border-rule/80 p-8 space-y-3 shadow-2xs">
            <div className="w-12 h-12 mx-auto rounded-full bg-paper flex items-center justify-center text-ink-muted">
              <ClipboardList size={24} />
            </div>
            <p className="text-sm font-bold text-ink">
              لا توجد طلبات في هذا القسم حالياً
            </p>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              سيظهر أي طلب جديد وارد للمطبخ هنا مباشرة مع إشعار صوتي وبيانات
              التوصيل الدقيقة.
            </p>
          </div>
        )}
      </main>

      {/* ── Modal: خريطة توصيل الطلب للطيار ── */}
      {selectedOrderForMap && (
        <DriverDeliveryMapModal
          order={selectedOrderForMap}
          mapContainerRef={orderMapContainerRef}
          onClose={handleCloseMapModal}
          onCopyForDelivery={handleCopyForDelivery}
        />
      )}

      {/* ── Modal: تأكيد إلغاء الطلب ── */}
      {orderToCancel && (
        <Modal
          isOpen={Boolean(orderToCancel)}
          onClose={() => setOrderToCancel(null)}
          title={
            <span className="inline-flex items-center gap-2 text-red-600 font-bold">
              <AlertTriangle size={18} />
              <span>تأكيد إلغاء الطلب</span>
            </span>
          }
          footer={
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-paper hover:bg-paper-2 text-ink border border-rule transition cursor-pointer"
              >
                تراجع وإبقاء الطلب
              </button>
              <button
                type="button"
                disabled={
                  updatingId === (orderToCancel.id || orderToCancel.orderId)
                }
                onClick={async () => {
                  const id = orderToCancel.id || orderToCancel.orderId;
                  await handleStatusChange(id, "Cancelled");
                  setOrderToCancel(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition cursor-pointer disabled:opacity-50"
              >
                {updatingId === (orderToCancel.id || orderToCancel.orderId)
                  ? "جاري الإلغاء..."
                  : "تأكيد إلغاء الطلب نهائياً"}
              </button>
            </div>
          }
        >
          <div className="space-y-3.5 text-xs leading-relaxed font-readex">
            <p className="text-ink font-semibold">
              هل أنت متأكد من رغبتك في إلغاء الطلب رقم{" "}
              <span className="font-mono text-accent font-bold">
                #{orderToCancel.orderNumber || orderToCancel.orderId}
              </span>
              ؟
            </p>
            <div className="p-3 bg-paper rounded-xl border border-rule space-y-1.5 text-ink-secondary">
              <p>
                العميل:{" "}
                <strong className="text-ink">
                  {orderToCancel.customerName ||
                    orderToCancel.customer ||
                    "العميل"}
                </strong>
              </p>
              <p>
                إجمالي المبلغ:{" "}
                <strong className="text-accent font-mono" dir="ltr">
                  {orderToCancel.totalAmount || orderToCancel.total} ج.م
                </strong>
              </p>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-[11px] leading-relaxed">
               <strong>تنبيه:</strong> سيتم إشعار العميل فوراً بإلغاء الطلب
              عبر البث المباشر، ولا يمكن التراجع عن هذه الخطوة بعد تأكيدها.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

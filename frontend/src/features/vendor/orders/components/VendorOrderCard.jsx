import React from "react";
import {
  MapPin,
  Phone,
  ExternalLink,
  Copy,
  Check,
  Navigation,
  UtensilsCrossed,
  Loader2,
  ChefHat,
  Bike,
  CheckCircle2,
  XCircle,
  Banknote,
  CreditCard,
} from "lucide-react";
import { OrderStatusBadge } from "../../../../components/ui";
import { formatCurrency } from "../../../../utils/formatters";

/**
 * VendorOrderCard Component
 * Displays incoming order details, customer contact, items breakdown, status progression,
 * and delivery dispatch actions following Hallmark calm, ergonomic UX principles.
 */
export function VendorOrderCard({
  order,
  updatingId,
  copiedId,
  onStatusChange,
  onOpenMapModal,
  onCopyForDelivery,
  onRequestCancel,
}) {
  const orderId = order.orderNumber || order.orderId || order.id;
  const customerName = order.customerName || order.customer || "عميل";
  const customerPhone = order.customerPhone || order.phone || "";
  const address =
    order.shippingAddress ||
    order.deliveryAddress ||
    order.deliveryLocation?.addressTitle ||
    order.addressTitle ||
    "موقع محدد بالدبوس على الخريطة";
  const lat =
    order.deliveryLocation?.latitude || order.latitude || order.lat || 30.0382;
  const lng =
    order.deliveryLocation?.longitude ||
    order.longitude ||
    order.lng ||
    31.2117;
  const total = Number(order.totalAmount || order.total || 0).toFixed(2);
  const isCopied = copiedId === orderId;

  const s = String(order.status || "")
    .trim()
    .toLowerCase();
  const isUpdating = updatingId === (order.id || order.orderId);

  // منطق الخطوة التالية الذكي (Linear Action Stepper)
  let nextAction = null;
  if (s === "1" || s === "pending" || s === "placed") {
    nextAction = {
      targetStatus: "Processing",
      label: "قبول وبدء التحضير",
      className: "bg-amber-600 hover:bg-amber-700 text-white shadow-xs",
    };
  } else if (
    s === "confirmed" ||
    s === "processing" ||
    s === "preparing" ||
    s === "2"
  ) {
    nextAction = {
      targetStatus: "Shipped",
      label: "تسليم لمندوب التوصيل",
      className: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs",
    };
  } else if (s === "shipped" || s === "outfordelivery" || s === "3") {
    nextAction = {
      targetStatus: "Delivered",
      label: "تأكيد التسليم بنجاح",
      icon: <CheckCircle2 size={14} />,
      className: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs",
    };
  }

  const isTerminal =
    s === "4" ||
    s === "delivered" ||
    s === "5" ||
    s === "cancelled" ||
    s === "canceled";

  const isCash =
    order.paymentMethod === "CashOnDelivery" || order.paymentMethod === "cash";

  return (
    <article className="bg-surface border border-rule hover:border-rule-strong rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs transition-shadow duration-200">
      {/* ── 1. Top Header: Order Identifiers, Customer & Price ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-rule/70">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-paper font-mono font-bold text-ink text-xs border border-rule">
              #{orderId}
            </span>
            <span className="text-xs font-semibold text-ink bg-paper-2 px-2.5 py-1 rounded-lg border border-rule/50">
              {customerName}
            </span>
            {customerPhone && (
              <a
                href={`tel:${customerPhone}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-emerald-100 bg-paper font-mono font-bold text-ink text-xs border border-rule"
                title="اتصال هاتفي بالعميل"
              >
                <span dir="rtl" className="font-mono">
                  {customerPhone}
                </span>
              </a>
            )}
          </div>

          {/* Delivery Address & Map Navigation */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-ink-secondary">
            <div className="inline-flex items-center gap-1.5 max-w-sm sm:max-w-md truncate text-ink-muted">
              <MapPin size={14} className="text-accent shrink-0" />
              <span className="truncate font-medium text-ink">{address}</span>
            </div>

            <button
              type="button"
              onClick={() => onOpenMapModal(order)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent/10 hover:bg-accent/20 text-accent text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <Navigation size={11} />
              <span>خريطة التوصيل</span>
            </button>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-ink-muted hover:text-ink text-[11px] transition-colors"
            >
              <span>Google Maps</span>
              <ExternalLink size={10} />
            </a>
          </div>
        </div>

        {/* Total Price & Primary Status Action */}
        <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-2.5 shrink-0 pt-1 sm:pt-0">
          <div className="text-left sm:text-right">
            <span className="">إجمالي الحساب : </span>
            <span className="" dir="rtr">
              {formatCurrency(total, true)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} />

            {nextAction && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() =>
                  onStatusChange(
                    order.id || order.orderId,
                    nextAction.targetStatus,
                  )
                }
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${nextAction.className}`}
              >
                {isUpdating ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  nextAction.icon
                )}
                <span>{isUpdating ? "جاري التحديث..." : nextAction.label}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Body: Order Items Ticket ── */}
      <div className="p-3.5 bg-paper/60 rounded-xl border border-rule/60 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-ink flex items-center gap-1.5">
            <UtensilsCrossed size={14} className="text-accent" />
            <span>الأصناف المطلوبة من المطبخ:</span>
          </span>
          <span className="text-[11px] text-ink-muted font-medium bg-paper px-2 py-0.5 rounded-full border border-rule">
            {Array.isArray(order.items) ? order.items.length : 0} أصناف
          </span>
        </div>

        {Array.isArray(order.items) && order.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {order.items.map((it, idx) => {
              const itemName =
                it.productName ||
                it.name ||
                it.dishName ||
                it.dish?.name ||
                it.title ||
                it.itemName ||
                "صنف";
              const itemQty = it.quantity || it.qty || 1;
              const itemPrice = it.unitPrice || it.price;

              return (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-surface p-2.5 rounded-lg border border-rule/40 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent font-bold font-mono text-[11px]">
                      {itemQty}x
                    </span>
                    <span className="font-medium text-ink truncate max-w-[180px] sm:max-w-[220px]">
                      {itemName}
                    </span>
                  </div>
                  {itemPrice && (
                    <span
                      className="text-ink-muted font-mono tabular-nums text-[11px] shrink-0"
                      dir="ltr"
                    >
                      {formatCurrency(Number(itemPrice) * itemQty, true)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-ink-faint text-xs py-1">
            تفاصيل الأصناف غير متوفرة لهذا الطلب.
          </p>
        )}
      </div>

      {/* ── 3. Footer: Payment Pill, Driver Dispatch & Safe Cancel Action ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-rule/60 text-xs">
        {/* Payment Method */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-paper border border-rule text-ink-secondary text-[11px] font-medium">
            {isCash ? (
              <>
                <Banknote size={14} className="text-emerald-600" />
                <span>الدفع نقداً عند الاستلام</span>
              </>
            ) : (
              <>
                <CreditCard size={14} className="text-blue-600" />
                <span>دفع إلكتروني مسبق (بطاقة)</span>
              </>
            )}
          </span>
        </div>

        {/* Operational Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Safe Cancel Order Button - Positioned calmly in footer */}
          {!isTerminal && onRequestCancel && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onRequestCancel(order)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-ink-muted hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer disabled:opacity-50"
              title="إلغاء هذا الطلب"
            >
              <XCircle size={13} className="text-red-500" />
              <span>إلغاء الطلب</span>
            </button>
          )}

          {/* Copy for Driver WhatsApp */}
          <button
            type="button"
            onClick={() => onCopyForDelivery(order)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              isCopied
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300"
            }`}
          >
            {isCopied ? (
              <>
                <Check size={13} />
                <span>تم نسخ الرسالة للحافظة بنجاح ✓</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>نسخ بيانات الطلب للطيار (واتساب)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

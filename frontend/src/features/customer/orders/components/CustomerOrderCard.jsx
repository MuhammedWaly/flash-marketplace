import React from "react";
import { OrderStatusBadge } from "../../../../components/ui";
import { formatCurrency, formatDate } from "../../../../utils/formatters";
import { OrderProgressTracker } from "./OrderProgressTracker";

/**
 * CustomerOrderCard Component
 * Displays a customer order summary with status badge, item details, total amount, and rate button.
 */
export function CustomerOrderCard({ order, onRateOrder }) {
  const isDelivered = order.status?.toLowerCase() === "delivered";
  const orderId = order.orderNumber || order.orderId || order.id;
  const restaurantName =
    order.resturantName || order.restaurantName || "مطعم شريك";

  return (
    <article className="bg-surface border border-rule rounded-xl p-5 space-y-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rule">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-ink">طلب #{orderId}</h2>
            <OrderStatusBadge status={order.status} />
            <span className="text-xs text-ink-faint tabular-nums">
              {formatDate(order.createdAt)}
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1 font-medium">
            المطعم: {restaurantName}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <span className="">الإجمالي : </span>
          <span className="">
            {formatCurrency(order.totalAmount || order.total || 0, true)}
          </span>
        </div>
      </div>

      {/* Live Order Step Progress Tracker */}
      <OrderProgressTracker status={order.status} />

      {/* Items List if available */}
      {order.items && order.items.length > 0 && (
        <div className="p-3 bg-paper rounded-lg border border-rule/60 text-xs space-y-1">
          <span className="text-ink-faint block mb-1">الأصناف المشمولة:</span>
          {order.items.map((it, idx) => {
            const itemName = it.productName || it.name || it.dishName || "صنف";
            const itemPrice =
              it.unitPrice ||
              it.price ||
              (it.totalPrice ? it.totalPrice / (it.quantity || 1) : null);
            const itemQty = it.quantity || it.qty || 1;

            return (
              <div
                key={idx}
                className="flex justify-between text-ink-secondary"
              >
                <span>
                  {itemQty}x {itemName}
                </span>
                {itemPrice && (
                  <span className="tabular-nums">
                    {formatCurrency(Number(itemPrice) * itemQty, true)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 text-xs">
        <span className="text-ink-muted">
          طريقة الدفع:{" "}
          {order.paymentMethod === "CashOnDelivery" ||
          order.paymentMethod === "cash"
            ? "الدفع نقداً عند الاستلام"
            : "بطاقة إلكترونية"}
        </span>

        {isDelivered && (
          <button
            type="button"
            onClick={() => onRateOrder(order)}
            className="px-3.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold transition-colors cursor-pointer"
          >
            ★ تقييم الطلب
          </button>
        )}
      </div>
    </article>
  );
}

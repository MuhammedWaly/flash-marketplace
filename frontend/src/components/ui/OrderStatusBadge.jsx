import React from 'react';

/**
 * OrderStatusBadge Component
 * Standardized status badge used across Customer and Vendor order views
 *
 * @param {string} status - Order status ('placed', 'confirmed', 'preparing', 'shipped', 'outfordelivery', 'delivered', 'cancelled')
 * @param {string} className - Optional extra CSS classes
 */
export function OrderStatusBadge({ status, className = '' }) {
  const normalized = status?.toLowerCase() || '';

  let label;
  let badgeClasses;

  switch (normalized) {
    case '1':
    case 'pending':
    case 'placed':
      label = 'تم الطلب';
      badgeClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'confirmed':
      label = 'تم التأكيد';
      badgeClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      break;
    case '2':
    case 'processing':
    case 'preparing':
      label = 'جاري التحضير';
      badgeClasses = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
    case '3':
    case 'shipped':
    case 'outfordelivery':
      label = 'في الطريق';
      badgeClasses = 'bg-purple-50 text-purple-700 border-purple-200';
      break;
    case '4':
    case 'delivered':
      label = 'تم التسليم';
      badgeClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;
    case '5':
    case 'cancelled':
    case 'canceled':
      label = 'ملغي';
      badgeClasses = 'bg-red-50 text-red-700 border-red-200';
      break;
    default:
      label = status || 'قيد المتابعة';
      badgeClasses = 'bg-paper text-ink-muted border-rule';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeClasses} ${className}`.trim()}
    >
      {label}
    </span>
  );
}

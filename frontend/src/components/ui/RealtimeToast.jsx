import React, { useEffect } from 'react';
import { Bell, X, ArrowLeft, Bike, CheckCircle2 } from 'lucide-react';

/**
 * RealtimeToast
 * إشعار لحظي عائم يظهر في أعلى الشاشة عند وصول تنبيهات SignalR
 * للعميل (تحديث حالة الأوردر) أو صاحب المطعم (طلب جديد للمطبخ)
 */
export function RealtimeToast({
  isOpen,
  onClose,
  type = 'customer',
  title,
  message,
  actionText,
  onAction,
  duration = 8000,
}) {
  useEffect(() => {
    if (!isOpen || !duration) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const isVendor = type === 'vendor';

  return (
    <div
      dir="rtl"
      className="fixed top-20 left-4 sm:left-6 z-50 max-w-sm sm:max-w-md w-full animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto shadow-xl rounded-2xl overflow-hidden font-readex"
    >
      <div
        className={`p-4 border backdrop-blur-md ${
          isVendor
            ? 'bg-emerald-950/90 text-white border-emerald-500/50 shadow-emerald-900/30'
            : 'bg-surface/95 text-ink border-accent/40 shadow-accent/10'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Icon */}
          <div
            className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${
              isVendor
                ? 'bg-emerald-500 text-white animate-bounce'
                : 'bg-accent-light text-accent animate-pulse'
            }`}
          >
            <Bell size={18} /> 
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h4
              className={`text-xs font-bold truncate ${
                isVendor ? 'text-emerald-200' : 'text-accent'
              }`}
            >
              {title}
            </h4>
            <p
              className={`text-xs mt-0.5 leading-relaxed ${
                isVendor ? 'text-emerald-50' : 'text-ink-secondary'
              }`}
            >
              {message}
            </p>

            {actionText && onAction && (
              <button
                type="button"
                onClick={() => {
                  onAction();
                  onClose();
                }}
                className={`mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  isVendor
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-sm'
                    : 'bg-accent hover:bg-accent-hover text-white shadow-xs'
                }`}
              >
                <span>{actionText}</span>
                <ArrowLeft size={13} />
              </button>
            )}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded-lg transition shrink-0 cursor-pointer ${
              isVendor
                ? 'text-emerald-300 hover:text-white hover:bg-emerald-800/50'
                : 'text-ink-muted hover:text-ink hover:bg-paper-2'
            }`}
            aria-label="إغلاق التنبيه"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

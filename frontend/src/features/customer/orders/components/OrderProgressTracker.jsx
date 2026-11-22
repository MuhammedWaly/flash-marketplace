import React from 'react';
import { Check, Clock, Utensils, Bike } from 'lucide-react';

const STEPS = [
  { key: 'placed', label: 'تم الاستلام', icon: Clock },
  { key: 'preparing', label: 'جاري التحضير', icon: Utensils },
  { key: 'shipped', label: 'في الطريق', icon: Bike },
  { key: 'delivered', label: 'تم التسليم', icon: Check },
];

function getStepIndex(status) {
  const s = String(status || '').trim().toLowerCase();
  if (s === '4' || s === 'delivered') return 3;
  if (s === '3' || s === 'shipped' || s === 'outfordelivery') return 2;
  if (s === '2' || s === 'processing' || s === 'preparing') return 1;
  if (s === '1' || s === 'placed' || s === 'confirmed' || s === 'pending') return 0;
  return 0; // إذا كان الطلب قائماً ولكن بحالة غير معروفة، يبدأ من الخطوة الأولى بدلاً من أن يكون مطفياً
}

export function OrderProgressTracker({ status }) {
  const s = String(status || '').trim().toLowerCase();
  const isCancelled = s === '5' || s === 'cancelled' || s === 'canceled';
  if (isCancelled) {
    return (
      <div className="py-2 px-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200 text-center">
        تم إلغاء هذا الطلب
      </div>
    );
  }

  const currentIndex = getStepIndex(status);

  return (
    <div className="py-3 px-2 bg-paper/60 rounded-xl border border-rule/50">
      <div className="flex items-center justify-between relative max-w-md mx-auto">
        {/* Background Connecting Bar */}
        <div className="absolute top-1/2 -translate-y-1/2 left-6 right-6 h-0.5 bg-rule/70 z-0" />
        
        {/* Active Progress Bar */}
        <div
          className="absolute top-1/2 -translate-y-1/2 right-6 h-0.5 bg-accent transition-all duration-700 ease-out z-0"
          style={{
            width: currentIndex <= 0 ? '0%' : currentIndex === 1 ? '33%' : currentIndex === 2 ? '66%' : 'calc(100% - 3rem)',
          }}
        />

        {STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 text-xs ${
                  isDone
                    ? 'bg-accent text-white shadow-xs'
                    : isCurrent
                    ? 'bg-accent text-white ring-4 ring-accent/20 animate-pulse'
                    : 'bg-surface text-ink-faint border border-rule'
                }`}
              >
                {isDone ? <Check size={14} className="stroke-3" /> : <Icon size={13} />}
              </div>
              <span
                className={`text-[11px] mt-1.5 font-medium whitespace-nowrap transition-colors ${
                  isCurrent ? 'text-accent font-bold' : isDone ? 'text-ink font-semibold' : 'text-ink-faint'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { Check, Clock, ChefHat, Bike, CheckCircle2 } from 'lucide-react';

/**
 * مراحل دورة حياة الأوردر (Order State Machine)
 */
const ORDER_STAGES = [
  { key: 'Placed', label: 'تم الطلب', icon: Clock },
  { key: 'Confirmed', label: 'تم التأكيد', icon: Check },
  { key: 'Preparing', label: 'جاري التحضير', icon: ChefHat },
  { key: 'OutForDelivery', label: 'في الطريق', icon: Bike },
  { key: 'Delivered', label: 'تم التسليم', icon: CheckCircle2 },
];

/**
 * OrderStepper Component
 * شريط تتبع حالة الأوردر التفاعلي المكون من 5 مراحل
 * 
 * @param {string} currentStatus - 'Placed' | 'Confirmed' | 'Preparing' | 'OutForDelivery' | 'Delivered'
 */
export function OrderStepper({ currentStatus = 'Placed' }) {
  // معرفة ترتيب المرحلة الحالية (0 إلى 4)
  const currentStageIndex = ORDER_STAGES.findIndex((stage) => stage.key === currentStatus);
  const activeIndex = currentStageIndex === -1 ? 0 : currentStageIndex;

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* خط التقدم الخلفي */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-paper-2 z-0" />
        
        {/* خط التقدم الملون النشط */}
        <div
          className="absolute top-1/2 -translate-y-1/2 right-0 h-1 bg-accent z-0 transition-all duration-500"
          style={{
            width: `${(activeIndex / (ORDER_STAGES.length - 1)) * 100}%`,
          }}
        />

        {/* دوائر المراحل الخمسة */}
        {ORDER_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={stage.key} className="flex flex-col items-center relative z-10 space-y-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-accent text-accent-ink shadow-sm'
                    : isCurrent
                    ? 'bg-surface border-2 border-accent text-accent ring-4 ring-accent/15 scale-110'
                    : 'bg-surface border border-rule text-muted'
                }`}
              >
                <Icon size={14} />
              </div>
              <span
                className={`text-[11px] font-medium whitespace-nowrap ${
                  isCurrent ? 'text-accent font-bold' : isCompleted ? 'text-ink' : 'text-muted'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

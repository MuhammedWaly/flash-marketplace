import {
  TrendingUp,
  CircleDollarSign,
  Clock,
  Store,
  AlertCircle,
} from "lucide-react";
import { formatMoney } from "../../../utils/formatters";

export function FinanceKpiGrid({ overview }) {
  if (!overview) return null;

  const totalGmv = Number(overview.totalGmv || 0);
  const totalCommission = Number(overview.totalPlatformCommission || 0);
  const totalVendorBalances = Number(overview.totalVendorBalances || 0);
  const activeMerchants = overview.activeMerchantsCount || 0;
  const pendingMerchants = overview.pendingMerchantsCount || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-readex">
      {/* ── 1. مستحقات التجار المعلقة (Hero / Most Prominent Card) ── */}
      <div className="relative bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            <span className="text-xs font-bold text-amber-950">
              مستحقات التجار المعلقة
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Clock size={17} />
          </div>
        </div>

        <div className="my-3 flex items-baseline gap-1.5" dir="rtr">
          <span className="text-2xl font-bold font-mono tracking-tight text-amber-950">
            {formatMoney(totalVendorBalances)}
          </span>
          <span className="text-xs font-bold text-amber-800">ج.م</span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
          <span className="text-[11px] font-medium text-amber-900">
            أرصدة جاهزة للتحويل الفوري
          </span>
          {totalVendorBalances > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
              <AlertCircle size={10} />
              بانتظار الصرف
            </span>
          )}
        </div>
      </div>

      {/* ── 2. إجمالي المبيعات (GMV) ── */}
      <div className="bg-surface border border-rule rounded-2xl p-5 shadow-xs hover:border-rule-strong transition-colors flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-muted">
            إجمالي المبيعات (GMV)
          </span>
          <div className="w-8 h-8 rounded-xl bg-accent-light text-accent flex items-center justify-center shrink-0">
            <TrendingUp size={17} />
          </div>
        </div>

        <div className="my-3 flex items-baseline gap-1.5" dir="rtr">
          <span className="text-xl font-bold font-mono tracking-tight text-ink">
            {formatMoney(totalGmv)}
          </span>
          <span className="text-xs text-ink-muted font-medium">ج.م</span>
        </div>

        <span className="text-[11px] text-ink-faint block">
          من إجمالي {overview.completedOrdersCount || 0} طلب مكتمل
        </span>
      </div>

      {/* ── 3. عمولات المنصة المحصلة ── */}
      <div className="bg-surface border border-rule rounded-2xl p-5 shadow-xs hover:border-rule-strong transition-colors flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-muted">
            عمولات المنصة المحصلة
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CircleDollarSign size={17} />
          </div>
        </div>

        <div className="my-3 flex items-baseline gap-1.5" dir="rtr">
          <span className="text-xl font-bold font-mono tracking-tight text-ink">
            {formatMoney(totalCommission)}
          </span>
          <span className="text-xs text-ink-muted font-medium">ج.م</span>
        </div>

        <span className="text-[11px] text-ink-faint block">
          صافي إيرادات منصة "طلبلي"
        </span>
      </div>

      {/* ── 4. المطاعم الشريكة النشطة ── */}
      <div className="bg-surface border border-rule rounded-2xl p-5 shadow-xs hover:border-rule-strong transition-colors flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-muted">
            المطاعم الشريكة النشطة
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Store size={17} />
          </div>
        </div>

        <div className="my-3 flex items-baseline gap-1.5" dir="rtr">
          <span className="text-xl font-bold font-mono tracking-tight text-ink">
            {activeMerchants}
          </span>
          <span className="text-xs text-ink-muted font-medium">مطعم</span>
        </div>

        <span className="text-[11px] text-ink-faint block">
          {pendingMerchants > 0
            ? `${pendingMerchants} بانتظار الاعتماد والمراجعة`
            : "جميع المطاعم معتمدة ونشطة"}
        </span>
      </div>
    </div>
  );
}

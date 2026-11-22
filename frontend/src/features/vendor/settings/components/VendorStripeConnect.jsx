import React from "react";
import { CreditCard, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

/**
 * VendorStripeConnect Component
 * Stripe Connect onboarding flow and account status card.
 */
export function VendorStripeConnect({
  stripeStatus,
  loadingStripe,
  stripeError,
  onStartOnboarding,
}) {
  return (
    <section className="bg-surface border border-rule rounded-xl p-5 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between pb-2 border-b border-rule">
        <div>
          <h2 className="text-xs font-bold text-ink flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#635bff]" />
            <span>حساب Stripe واستلام الأرباح البنكية (Stripe Connect)</span>
          </h2>
          <p className="text-[11px] text-ink-muted mt-0.5">
            ربط حساب متجرك مع بوابة Stripe يتيح لك استلام مدفوعات البطاقات البنكية وتحويل الأرباح لحسابك
          </p>
        </div>
        {stripeStatus?.chargesEnabled ? (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 size={13} />
            <span>الحساب مفعل وجاهز</span>
          </span>
        ) : (
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
            <AlertCircle size={13} />
            <span>يتطلب الإعداد أو التفعيل</span>
          </span>
        )}
      </div>

      {stripeError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{stripeError}</span>
        </div>
      )}

      {stripeStatus?.chargesEnabled ? (
        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-900 block">
              حساب Stripe مربوط بنجاح ✅
            </span>
            <span className="text-[11px] text-emerald-700 block">
              معرف الحساب:{" "}
              <code className="bg-white/80 px-1 py-0.5 rounded text-[10px] font-mono">
                {stripeStatus.accountId}
              </code>
            </span>
            <span className="text-[11px] text-emerald-700 block">
              استقبال المدفوعات: مفعّل | التحويلات البنكية:{" "}
              {stripeStatus.payoutsEnabled ? "مفعّلة" : "قيد المراجعة"}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-paper rounded-xl border border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-ink block">
              ابدأ ربط متجرك مع Stripe Connect
            </span>
            <span className="text-[11px] text-ink-muted block">
              سيتم تحويلك لصفحة Stripe الرسمية لملء بيانات الحساب البنكي وإثبات الهوية بأمان تام.
            </span>
          </div>
          <button
            type="button"
            onClick={onStartOnboarding}
            disabled={loadingStripe}
            className="py-2 px-4 rounded-lg bg-[#635bff] hover:bg-[#5349e0] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer disabled:opacity-50"
          >
            {loadingStripe ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>جاري التحويل...</span>
              </>
            ) : (
              <>
                <CreditCard size={13} />
                <span>ربط أو استكمال بيانات Stripe</span>
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}

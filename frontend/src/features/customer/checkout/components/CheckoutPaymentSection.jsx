import React from 'react';

/**
 * CheckoutPaymentSection Component
 * Radio choices for Cash on Delivery or Stripe Credit Card
 */
export function CheckoutPaymentSection({
  paymentMethod,
  onPaymentMethodChange,
  hasStripeSupport,
}) {
  return (
    <section className="bg-surface border border-rule rounded-xl p-5 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-ink">طريقة الدفع المتاحة</h2>
        {!hasStripeSupport && (
          <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
            الدفع نقداً فقط لهذا المطعم
          </span>
        )}
      </div>

      <div className={`grid ${hasStripeSupport ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-3 text-xs`}>
        <label
          className={`p-3.5 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition-colors ${
            paymentMethod === 'cash'
              ? 'border-accent bg-accent-light/40'
              : 'border-rule bg-surface'
          }`}
        >
          <input
            type="radio"
            name="payment_method"
            value="cash"
            checked={paymentMethod === 'cash'}
            onChange={() => onPaymentMethodChange('cash')}
            className="mt-0.5 accent-accent"
          />
          <div>
            <span className="font-semibold text-ink block">الدفع نقداً عند الاستلام</span>
            <span className="text-ink-muted text-[11px]">تسليم القيمة لمندوب التوصيل فور وصول الطلب</span>
          </div>
        </label>

        {hasStripeSupport && (
          <label
            className={`p-3.5 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition-colors ${
              paymentMethod === 'card'
                ? 'border-accent bg-accent-light/40'
                : 'border-rule bg-surface'
            }`}
          >
            <input
              type="radio"
              name="payment_method"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={() => onPaymentMethodChange('card')}
              className="mt-0.5 accent-accent"
            />
            <div>
              <span className="font-semibold text-ink block">بطاقة دفع إلكترونية</span>
              <span className="text-ink-muted text-[11px]">فيزا أو ماستركارد مشفرة بالكامل عبر Stripe</span>
            </div>
          </label>
        )}
      </div>
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLocationState } from '../../../context/LocationContext';
import { useCart } from '../../../context/CartContext';
import { orderService } from '../../../services/orderService';
import { paymentService } from '../../../services/paymentService';
import { restaurantService } from '../../../services/restaurantService';
import { CheckoutAddressSection } from './components/CheckoutAddressSection';
import { CheckoutPaymentSection } from './components/CheckoutPaymentSection';
import { formatCurrency } from '../../../utils/formatters';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { selectedLocation, openLocationModal } = useLocationState();
  const { restaurant, items, subtotal, deliveryFee, totalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [hasStripeSupport, setHasStripeSupport] = useState(true);
  const [addressDetails, setAddressDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // فحص ما إذا كان المطعم يدعم الدفع بـ Stripe أو وضع الـ Test مفعل بالسيرفر
  useEffect(() => {
    if (!restaurant?.id) return;
    restaurantService
      .getRestaurantById(restaurant.id)
      .then(() => {
        // بما أن وضع الـ Test مفعل بالسيرفر (Direct Checkout)، الدفع بالبطاقة متاح دائماً
        setHasStripeSupport(true);
      })
      .catch((err) => {
        console.warn('Could not fetch restaurant details:', err);
      });
  }, [restaurant?.id]);

  // إذا كانت السلة فارغة تماماً
  if (!items || items.length === 0) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-16 text-center font-readex">
        <div className="bg-surface border border-rule rounded-2xl p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-paper flex items-center justify-center text-ink-faint">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-ink">سلة طلباتك فارغة</h2>
          <p className="text-xs text-ink-muted leading-relaxed">
            لم تقم بإضافة وجبات إلى سلتك بعد. تصفح أشهى المطاعم في منطقتك واختر وجبتك المفضلة.
          </p>
          <Link
            to="/search"
            className="inline-block py-2.5 px-6 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors"
          >
            تصفح المطاعم الآن
          </Link>
        </div>
      </div>
    );
  }

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    const resolvedAddress = [
      selectedLocation?.addressName || 'موقع العميل المحدد بالخريطة',
      addressDetails.trim(),
    ]
      .filter(Boolean)
      .join(' - ');

    try {
      // دورة الطلب الآمنة مع عنوان الشحن الإلزامي
      const order = await orderService.checkout({
        shippingAddress: resolvedAddress,
        paymentMethod: paymentMethod === 'cash' ? 'CashOnDelivery' : 'CreditCard',
      });
      clearCart();

      // إذا اختار الدفع بالبطاقة، يتم التحويل المباشر لصفحة Stripe
      if (paymentMethod === 'card') {
        const orderId = order?.id || order?.orderId;
        if (orderId) {
          localStorage.setItem('last_stripe_order_id', orderId);
          const session = await paymentService.createCheckoutSession(orderId);
          if (session?.checkoutUrl) {
            window.location.href = session.checkoutUrl;
            return;
          }
        }
      }

      navigate('/my-orders', { state: { newOrderPlaced: true } });
    } catch (err) {
      console.error('Checkout error:', err);
      if (
        err.message?.includes('Stripe onboarding') ||
        err.message?.includes('SellerNotOnboarded') ||
        err.message?.includes('SellerChargesDisabled')
      ) {
        setErrorMessage(
          '⚠️ هذا المطعم لم يقم بتفعيل الدفع بالبطاقة بعد. تم تحويل طريقة الدفع تلقائياً إلى "الدفع نقداً عند الاستلام". يمكنك الضغط على زر التأكيد الآن.'
        );
        setPaymentMethod('cash');
        setHasStripeSupport(false);
      } else {
        setErrorMessage(err.message || 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-10 space-y-6 font-readex">
      {/* Title */}
      <div className="pb-4 border-b border-rule">
        <h1 className="text-xl font-bold text-ink">تأكيد الطلب والدفع</h1>
        <p className="text-xs text-ink-muted mt-0.5">
          مراجعة بيانات التوصيل والأصناف وطريقة الدفع قبل الإرسال الآمن للسيرفر
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
          {errorMessage}
        </div>
      )}

      {/* Section 1: Location */}
      <CheckoutAddressSection
        selectedLocation={selectedLocation}
        restaurantName={restaurant?.name}
        addressDetails={addressDetails}
        onAddressDetailsChange={setAddressDetails}
        onOpenLocationModal={openLocationModal}
      />

      {/* Section 2: Order Items */}
      <section className="bg-surface border border-rule rounded-xl p-5 space-y-3 shadow-2xs">
        <h2 className="text-xs font-bold text-ink pb-2 border-b border-rule">
          الأصناف ({items.length})
        </h2>

        <div className="space-y-2 text-xs text-ink-secondary">
          {items.map((it) => (
            <div key={it.id} className="flex justify-between items-center">
              <span>{it.qty}x {it.name}</span>
              <span className="font-medium text-ink tabular-nums">{formatCurrency(it.price * it.qty, true)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Payment Method */}
      <CheckoutPaymentSection
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        hasStripeSupport={hasStripeSupport}
      />

      {/* Section 4: Account Summary */}
      <section className="bg-surface border border-rule rounded-xl p-5 space-y-2 text-xs shadow-2xs">
        <h2 className="font-bold text-ink pb-2 border-b border-rule">كشف الحساب</h2>

        <div className="flex justify-between text-ink-secondary">
          <span>قيمة الوجبات:</span>
          <span className="font-medium text-ink tabular-nums">{formatCurrency(subtotal, true)}</span>
        </div>
        <div className="flex justify-between text-ink-secondary">
          <span>مصاريف التوصيل:</span>
          <span className="font-medium text-ink tabular-nums">{formatCurrency(deliveryFee, true)}</span>
        </div>

        <div className="pt-3 border-t border-rule flex justify-between text-sm font-semibold text-ink">
          <span>المبلغ الإجمالي المستحق:</span>
          <span className="text-accent font-bold tabular-nums">{formatCurrency(totalPrice, true)}</span>
        </div>
      </section>

      {/* Submit CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleConfirmOrder}
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {isSubmitting
            ? 'جاري إرسال الطلب وتجهيز بوابة الدفع Stripe…'
            : paymentMethod === 'card'
            ? `المتابعة إلى الدفع بواسطة Stripe (${formatCurrency(totalPrice, true)})`
            : `تأكيد وإرسال الطلب نقداً (${formatCurrency(totalPrice, true)})`}
        </button>
        <p className="text-center text-[11px] text-ink-faint mt-2">
          بالضغط على تأكيد، يتم توجيه الطلب فوراً إلى المطبخ لبدء التحضير.
        </p>
      </div>
    </div>
  );
}

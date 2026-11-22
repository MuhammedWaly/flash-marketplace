import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { paymentService } from '../../../services/paymentService';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId =
    searchParams.get('orderId') ||
    searchParams.get('order_id') ||
    localStorage.getItem('last_stripe_order_id');
  const [order, setOrder] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!orderId) {
      setIsVerifying(false);
      setErrorMessage('لم يتم العثور على رقم الطلب للتحقق من الدفع.');
      return;
    }

    let intervalId;
    let attempts = 0;
    const maxAttempts = 15;

    const checkStatus = async () => {
      try {
        attempts++;
        const data = await paymentService.getPaymentStatus(orderId);
        setOrder(data);

        if (
          data.paymentStatus === 'Paid' ||
          data.paymentStatus === 'Failed' ||
          attempts >= maxAttempts
        ) {
          setIsVerifying(false);
          clearInterval(intervalId);
        }
      } catch (err) {
        setErrorMessage(err.message || 'تعذر التحقق من حالة الدفع حالياً.');
        setIsVerifying(false);
        clearInterval(intervalId);
      }
    };

    checkStatus();
    intervalId = setInterval(checkStatus, 2000);

    return () => clearInterval(intervalId);
  }, [orderId]);

  return (
    <div className="max-w-[600px] mx-auto px-4 py-16 text-center font-readex">
      <div className="bg-surface border border-rule rounded-2xl p-8 space-y-5 shadow-sm">
        {isVerifying ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-ink">جاري التحقق من عملية الدفع البنكية...</h2>
            <p className="text-xs text-ink-muted">يرجى الانتظار ثوانٍ معدودة ريثما نؤكد استلام المبلغ من Stripe.</p>
          </div>
        ) : errorMessage || order?.paymentStatus === 'Failed' ? (
          <div className="space-y-4">
            <AlertCircle className="w-14 h-14 text-red-500 mx-auto" />
            <h2 className="text-lg font-bold text-ink">تعذر تأكيد عملية الدفع</h2>
            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {errorMessage || order?.failureReason || 'فشلت معالجة الدفع عبر البطاقة.'}
            </p>
            <Link
              to="/checkout"
              className="inline-block py-2.5 px-6 rounded-lg bg-ink text-white text-xs font-semibold hover:bg-black transition-colors"
            >
              العودة لمحاولة الدفع مرة أخرى
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-bold text-ink">🎉 تم تأكيد الدفع بنجاح!</h2>
            <p className="text-xs text-ink-muted">تم استلام المبلغ بنجاح وجاري إرسال الطلب للمطبخ لبدء التحضير.</p>

            <div className="bg-paper p-4 rounded-xl border border-rule text-right text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-ink-muted">رقم الطلب:</span>
                <span className="font-bold text-ink">{order?.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">حالة الدفع:</span>
                <span className="font-semibold text-emerald-600">{order?.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">المبلغ الإجمالي:</span>
                <span className="font-bold text-accent">{order?.amount} ج.م</span>
              </div>
            </div>

            <div className="pt-2 flex gap-3 justify-center">
              <Link
                to="/my-orders"
                className="py-2.5 px-6 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors"
              >
                متابعة حالة الطلب
              </Link>
              <Link
                to="/"
                className="py-2.5 px-6 rounded-lg bg-surface border border-rule text-ink text-xs font-semibold hover:bg-paper transition-colors"
              >
                الرئيسية
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccessPage;

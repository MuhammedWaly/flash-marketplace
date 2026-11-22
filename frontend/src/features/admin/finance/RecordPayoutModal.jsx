import { useState, useEffect } from 'react';
import { Modal, Button } from '../../../components/ui';
import { CircleDollarSign, ArrowDownLeft } from 'lucide-react';
import { formatMoney } from '../../../utils/formatters';

export function RecordPayoutModal({ isOpen, onClose, merchant, onConfirm }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('InstaPay');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (merchant) {
      setAmount('');
      setReferenceNumber('');
      setNotes('');
      setError(null);
    }
  }, [merchant]);

  if (!isOpen || !merchant) return null;

  const currentBalance = Number(merchant.balance || 0);

  const handleMaxClick = () => {
    setAmount(currentBalance.toFixed(2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);

    if (numAmount <= 0) {
      setError('مبلغ السداد يجب أن يكون أكبر من صفر');
      return;
    }

    if (numAmount > currentBalance) {
      setError(`المبلغ المطلوب يتجاوز رصيد التاجر المتاح (${formatMoney(currentBalance)} ج.م)`);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await onConfirm({
        merchantId: merchant.merchantId || merchant.id,
        amount: numAmount,
        method,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'تعذر تسجيل عملية السداد');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`تسجيل سداد مستحقات: ${merchant.storeName || ''}`}
      size="default"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            إلغاء
          </Button>

          <Button
            variant="primary"
            size="sm"
            loading={submitting}
            icon={<ArrowDownLeft size={14} />}
            onClick={handleSubmit}
          >
            تأكيد صرف الأرباح
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-ink font-readex">
        {error && (
          <div className="p-3 rounded-xl bg-danger-light text-danger text-xs font-medium border border-danger/20">
            {error}
          </div>
        )}

        {/* Balance info tile */}
        <div className="p-3.5 rounded-xl bg-paper-2 border border-rule flex items-center justify-between">
          <span className="text-xs text-ink-muted">الرصيد المتاح حالياً للصرف:</span>
          <div className="inline-flex items-center gap-1 font-bold text-emerald-700" dir="ltr">
            <span className="font-mono text-base">{formatMoney(currentBalance)}</span>
            <span className="text-xs font-semibold text-emerald-800">ج.م</span>
          </div>
        </div>

        {/* Amount input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-ink">
              المبلغ المطلوب تحويله (ج.م)
            </label>
            <button
              type="button"
              onClick={handleMaxClick}
              className="text-[11px] text-accent hover:underline font-semibold cursor-pointer"
            >
              كامل الرصيد
            </button>
          </div>

          <div className="relative">
            <input
              type="number"
              step="1"
              min="1"
              max={currentBalance}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-12 pr-3 py-2 rounded-xl border border-rule bg-paper text-sm font-mono font-bold text-ink focus:bg-surface focus:border-accent transition-colors"
            />
            <span className="absolute left-3 top-2.5 text-ink-muted text-xs font-medium">ج.م</span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">
            طريقة التحويل المنفذة:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'InstaPay', label: 'انستاباي (InstaPay)' },
              { id: 'BankTransfer', label: 'تحويل بنكي مباشر' },
              { id: 'VodafoneCash', label: 'محفظة إلكترونية' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`py-2 px-2 text-[11px] font-medium rounded-xl border text-center transition-all cursor-pointer ${
                  method === m.id
                    ? 'bg-ink text-surface border-ink font-semibold shadow-xs'
                    : 'bg-paper text-ink-secondary border-rule hover:border-rule-strong'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reference Number */}
        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            رقم الحوالة أو إيصال السداد (Reference No):
          </label>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="مثال: TRX-894729175..."
            className="w-full px-3 py-2 rounded-xl border border-rule bg-surface text-xs font-mono text-ink focus:border-accent transition-colors"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            ملاحظات إضافية (اختياري):
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="أي تفاصيل خاصة بتسوية الحساب..."
            className="w-full p-2.5 rounded-xl border border-rule bg-surface text-xs text-ink focus:border-accent transition-colors"
          />
        </div>
      </form>
    </Modal>
  );
}

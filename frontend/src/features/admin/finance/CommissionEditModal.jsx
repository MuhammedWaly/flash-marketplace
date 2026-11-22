import { useState, useEffect } from 'react';
import { Modal, Button } from '../../../components/ui';
import { Percent, Sparkles } from 'lucide-react';

export function CommissionEditModal({ isOpen, onClose, merchant, onSave }) {
  const [rate, setRate] = useState(15);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (merchant) {
      setRate(merchant.commissionRate || 15);
      setError(null);
    }
  }, [merchant]);

  if (!isOpen || !merchant) return null;

  const numRate = Number(rate) || 0;
  const platformCut = ((100 * numRate) / 100).toFixed(2);
  const vendorCut = (100 - Number(platformCut)).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (numRate < 0 || numRate > 100) {
      setError('نسبة العمولة يجب أن تكون بين 0% و 100%');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await onSave(merchant.merchantId || merchant.id, numRate);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'تعذر حفظ النسبة');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`تعديل نسبة العمولة: ${merchant.storeName || ''}`}
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
            onClick={handleSubmit}
          >
            حفظ النسبة الجديدة
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

        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">
            نسبة عمولة المنصة المقتطعة (%)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.5"
              min="0"
              max="100"
              required
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-rule bg-paper text-xs font-mono font-bold text-ink focus:bg-surface focus:border-accent transition-colors"
            />
            <span className="absolute left-3 top-2.5 text-ink-muted text-xs font-mono font-bold">%</span>
          </div>
        </div>

        {/* Quick presets */}
        <div>
          <span className="block text-[11px] text-ink-muted mb-1.5">نسب شائعة وسريعة:</span>
          <div className="grid grid-cols-5 gap-1.5">
            {[10, 12, 15, 18, 20].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setRate(p)}
                className={`py-1.5 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                  Number(rate) === p
                    ? 'bg-ink text-surface border-ink font-bold shadow-xs'
                    : 'bg-paper text-ink-secondary border-rule hover:border-rule-strong'
                }`}
              >
                {p}%
              </button>
            ))}
          </div>
        </div>

        {/* Visual Distribution Calculator */}
        <div className="p-3.5 rounded-xl bg-paper-2 border border-rule space-y-2">
          <span className="text-[11px] font-semibold text-ink-muted block flex items-center gap-1">
            <Sparkles size={12} className="text-accent" />
            <span>محاكاة توزيع كل 100 جنيه مبيعات:</span>
          </span>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-ink-secondary">حصة المطعم الصافية:</span>
            <span className="font-bold text-emerald-700 font-mono">{vendorCut} ج.م</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-secondary">عمولة "طلبلي" المركزية:</span>
            <span className="font-bold text-accent font-mono">{platformCut} ج.م</span>
          </div>
        </div>
      </form>
    </Modal>
  );
}

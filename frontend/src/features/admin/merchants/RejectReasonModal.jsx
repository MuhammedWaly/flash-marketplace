import { useState } from 'react';
import { Modal, Button } from '../../../components/ui';
import { AlertTriangle } from 'lucide-react';

export function RejectReasonModal({ isOpen, onClose, onConfirm, merchantName }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const quickReasons = [
    'عدم اكتمال أوراق السجل التجاري أو الترخيص',
    'عنوان المقر غير واضح أو يقع خارج نطاق تغطية المنصة',
    'أرقام الهاتف غير متاحة للتحقق عبر الاتصال أو الواتساب',
    'البيانات الأساسية وقائمة المنيو غير مكتملة',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await onConfirm(reason);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`رفض اعتماد متجر: ${merchantName || ''}`}
      size="default"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            إلغاء
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="bg-danger hover:bg-danger/90 border-transparent text-white"
            loading={submitting}
            disabled={!reason.trim()}
            onClick={handleSubmit}
          >
            تأكيد قرار الرفض
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-ink font-readex">
        <div className="p-3.5 rounded-xl bg-danger-light border border-danger/30 text-danger flex items-start gap-2.5">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold block">تنبيه إداري:</span>
            <span>
              سيتم إشعار صاحب المطعم بسبب الرفض حتى يتمكن من تعديل واستكمال بياناته وإعادة التقديم.
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">
            نماذج أسباب جاهزة للاختيار السريع:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {quickReasons.map((qr) => (
              <button
                key={qr}
                type="button"
                onClick={() => setReason(qr)}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all text-right cursor-pointer ${
                  reason === qr
                    ? 'bg-ink text-surface border-ink font-medium shadow-xs'
                    : 'bg-paper border-rule hover:border-rule-strong text-ink-muted hover:text-ink'
                }`}
              >
                {qr}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            نص سبب الرفض المفصل (يظهر لصاحب المطعم):
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="اكتب هنا سبب الرفض أو التوجيهات المطلوبة من التاجر..."
            className="w-full p-3 rounded-xl border border-rule bg-surface text-ink text-xs focus:border-accent focus:outline-none transition-colors"
            required
          />
        </div>
      </form>
    </Modal>
  );
}

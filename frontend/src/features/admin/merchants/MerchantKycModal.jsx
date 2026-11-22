import { useState } from 'react';
import { Modal, Button, Badge } from '../../../components/ui';
import {
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  Compass,
  Percent,
  Receipt,
  FileCheck2,
  ShieldCheck,
  ShieldAlert,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';

export function MerchantKycModal({ isOpen, onClose, merchant, onApprove, onOpenReject }) {
  const [approving, setApproving] = useState(false);

  if (!isOpen || !merchant) return null;

  const handleApproveClick = async () => {
    setApproving(true);
    try {
      await onApprove(merchant.id);
    } finally {
      setApproving(false);
    }
  };

  const isPending = !merchant.isApproved;
  const whatsappUrl = merchant.phoneNumber
    ? `https://wa.me/${merchant.phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً أستاذ ${merchant.ownerName}، نتواصل معك من إدارة منصة طلبلي بخصوص مراجعة متجر ${merchant.storeName}`)}`
    : null;

  const mapUrl = merchant.latitude && merchant.longitude
    ? `https://www.google.com/maps?q=${merchant.latitude},${merchant.longitude}`
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ملف مراجعة واعتماد المطعم (KYC Profile)"
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={approving}>
            إغلاق
          </Button>

          <div className="flex items-center gap-2">
            {isPending && (
              <Button
                variant="outline"
                size="sm"
                className="text-danger hover:border-danger/30 hover:bg-danger-light"
                icon={<ShieldAlert size={14} />}
                onClick={() => {
                  onClose();
                  onOpenReject(merchant);
                }}
                disabled={approving}
              >
                رفض الاعتماد
              </Button>
            )}

            {isPending && (
              <Button
                variant="primary"
                size="sm"
                loading={approving}
                icon={<ShieldCheck size={14} />}
                onClick={handleApproveClick}
              >
                اعتماد وتفعيل المتجر
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-xs text-ink font-readex">
        {/* Merchant Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-paper-2 border border-rule">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-surface border border-rule overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
              {merchant.logoUrl ? (
                <img
                  src={merchant.logoUrl}
                  alt={merchant.storeName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <Store size={26} className="text-accent" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-ink">{merchant.storeName}</h3>
                <Badge variant={merchant.isApproved ? 'success' : 'warning'}>
                  {merchant.isApproved ? 'معتمد رسمياً' : 'بانتظار الاعتماد'}
                </Badge>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">{merchant.category || 'مأكولات ومشروبات'}</p>
            </div>
          </div>

          {/* Quick Communication Actions */}
          <div className="flex items-center gap-2">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-medium transition-colors cursor-pointer"
              >
                <MessageCircle size={14} />
                <span>واتساب المالك</span>
              </a>
            )}
            {merchant.phoneNumber && (
              <a
                href={`tel:${merchant.phoneNumber}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-paper border border-rule hover:border-rule-strong text-ink font-medium transition-colors cursor-pointer"
              >
                <Phone size={13} />
                <span dir="ltr">{merchant.phoneNumber}</span>
              </a>
            )}
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Owner & Legal Card */}
          <div className="p-4 rounded-xl border border-rule bg-surface space-y-3">
            <h4 className="font-bold text-ink flex items-center gap-1.5 text-xs text-accent">
              <User size={14} />
              <span>بيانات المالك والتوثيق</span>
            </h4>

            <div className="divide-y divide-rule/60 text-xs">
              <div className="py-2 flex items-center justify-between">
                <span className="text-ink-muted">اسم المالك:</span>
                <span className="font-semibold text-ink">{merchant.ownerName || '—'}</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-ink-muted">البريد الإلكتروني:</span>
                <span className="font-mono text-ink text-[11px]" dir="ltr">{merchant.email || '—'}</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-ink-muted">السجل التجاري / البطاقة:</span>
                <span className="font-mono font-bold text-ink bg-paper px-2 py-0.5 rounded border border-rule text-[11px]">
                  {merchant.commercialRegister || 'قيد المراجعة'}
                </span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-ink-muted">تاريخ إنشاء الحساب:</span>
                <span className="text-ink-muted font-mono">
                  {merchant.createdAt ? new Date(merchant.createdAt).toLocaleDateString('ar-EG') : 'اليوم'}
                </span>
              </div>
            </div>
          </div>

          {/* Operational & Geographical Card */}
          <div className="p-4 rounded-xl border border-rule bg-surface space-y-3">
            <h4 className="font-bold text-ink flex items-center gap-1.5 text-xs text-accent">
              <MapPin size={14} />
              <span>المقر والنطاق الجغرافي</span>
            </h4>

            <div className="divide-y divide-rule/60 text-xs">
              <div className="py-2 flex items-center justify-between">
                <span className="text-ink-muted">العنوان المسجل:</span>
                <span className="font-medium text-ink truncate max-w-[180px]">{merchant.addressTitle || 'غير مسجل'}</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-ink-muted">نصف قطر التوصيل:</span>
                <span className="font-bold text-ink font-mono">{merchant.deliveryRadiusKm || 10} كم</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-ink-muted">الحد الأدنى للطلب:</span>
                <span className="font-bold text-ink font-mono">{merchant.minOrderValue || 0} ج.م</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-ink-muted">الموقع على الخريطة:</span>
                {mapUrl ? (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>فتح في Google Maps</span>
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="text-ink-faint">غير محدد</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Commission Settings Highlight */}
        <div className="p-4 rounded-xl bg-accent-light/50 border border-accent/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center shrink-0">
              <Percent size={16} />
            </div>
            <div>
              <span className="font-bold text-ink text-xs block">نسبة عمولة المنصة المطبقة</span>
              <span className="text-[11px] text-ink-muted block">
                تُستقطع تلقائياً من قيمة كل طلب يتم تنفيذه عبر تطبيق "طلبلي"
              </span>
            </div>
          </div>

          <div className="text-left font-mono">
            <span className="text-xl font-bold text-accent">{merchant.commissionRate || 15}%</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

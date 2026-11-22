import { useState } from 'react';
import { useAdminFinance } from './useAdminFinance';
import { FinanceKpiGrid } from './FinanceKpiGrid';
import { CommissionEditModal } from './CommissionEditModal';
import { RecordPayoutModal } from './RecordPayoutModal';
import { Button, Input, PageLoader } from '../../../components/ui';
import { formatMoney } from '../../../utils/formatters';
import {
  Receipt,
  Download,
  Search,
  ArrowDownLeft,
  Edit3,
  Store,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export function AdminFinancePage() {
  const {
    overview,
    merchants,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    updateCommission,
    recordPayout,
  } = useAdminFinance();

  const [balanceFilter, setBalanceFilter] = useState('pending'); // 'pending' | 'settled' | 'all'
  const [editingMerchant, setEditingMerchant] = useState(null);
  const [payoutMerchant, setPayoutMerchant] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const showFeedback = (text, type = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleCommissionSave = async (merchantId, newRate) => {
    const res = await updateCommission(merchantId, newRate);
    if (res.success) {
      showFeedback(`تم تحديث عمولة المنصة إلى ${newRate}%.`);
    }
    return res;
  };

  const handlePayoutConfirm = async (payload) => {
    const res = await recordPayout(payload);
    if (res.success) {
      showFeedback(`تم تسجيل سداد مبلغ ${formatMoney(payload.amount)} ج.م للتاجر.`);
    }
    return res;
  };

  // تصدير جدول المستحقات المالية كملف CSV
  const handleExportCsv = () => {
    if (!merchants || merchants.length === 0) return;

    const headers = [
      'اسم المطعم',
      'المالك',
      'نسبة العمولة %',
      'إجمالي المبيعات (ج.م)',
      'عمولة المنصة (ج.م)',
      'الرصيد المتاح للصرف (ج.م)',
    ];
    const rows = merchants.map((m) => [
      `"${m.storeName || ''}"`,
      `"${m.ownerName || ''}"`,
      m.commissionRate || 0,
      m.totalSales || 0,
      m.totalCommissionPaid || 0,
      m.balance || 0,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `talabli_finance_ledger_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback('تم تصدير كشف الحسابات بصيغة CSV بنجاح.');
  };

  // إحصائيات الفلترة
  const pendingCount = (merchants || []).filter((m) => Number(m.balance || 0) > 0).length;
  const settledCount = (merchants || []).filter((m) => Number(m.balance || 0) <= 0).length;

  // فلترة المطاعم حسب حالة الرصيد
  const filteredMerchants = (merchants || []).filter((m) => {
    const balance = Number(m.balance || 0);
    if (balanceFilter === 'pending') return balance > 0;
    if (balanceFilter === 'settled') return balance <= 0;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in font-readex">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-rule">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink tracking-tight">المالية والعمولات وسداد الأرباح</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-accent-light text-accent text-xs font-bold border border-accent/20">
              سجل التسويات
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">
            متابعة إيرادات المنصة من العمولات، إدارة نسب الشراكة مع المطاعم، وتسجيل تسويات المستحقات
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleExportCsv}
            disabled={!merchants || merchants.length === 0}
          >
            تصدير كشف حساب (CSV)
          </Button>

          {feedbackMsg && (
            <div
              className={`px-3.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 animate-fade-in ${
                feedbackMsg.type === 'danger'
                  ? 'bg-danger-light text-danger border-danger/30'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {feedbackMsg.type === 'danger' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
              <span>{feedbackMsg.text}</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-danger-light border border-danger/30 text-danger text-xs font-medium flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Top KPI Grid ── */}
      <FinanceKpiGrid overview={overview} />

      {/* ── Financial Ledger ── */}
      <div className="bg-surface rounded-2xl border border-rule overflow-hidden shadow-xs">
        {/* Table Header & Controls */}
        <div className="p-4 sm:p-5 border-b border-rule flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-ink">مستحقات المطاعم الشريكة</h2>
              <p className="text-[11px] text-ink-muted mt-0.5">
                سجل المبيعات، عمولة المنصة، والأرصدة القابلة للتحويل الفوري
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث باسم المطعم أو المالك..."
                className="text-xs pl-8"
              />
              <Search size={14} className="absolute left-3 top-3 text-ink-faint pointer-events-none" />
            </div>
          </div>

          {/* Balance Filter Tabs (المشكلة الثانية: فلترة سريعة بحالة الرصيد) */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rule/50">
            <button
              type="button"
              onClick={() => setBalanceFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                balanceFilter === 'pending'
                  ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs'
                  : 'bg-paper text-ink-muted hover:bg-paper-2 hover:text-ink border border-rule/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse shrink-0" />
              <span>بانتظار السداد فقط</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  balanceFilter === 'pending'
                    ? 'bg-amber-200 text-amber-950'
                    : 'bg-paper-2 text-ink-muted'
                }`}
              >
                {pendingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setBalanceFilter('settled')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
                balanceFilter === 'settled'
                  ? 'bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-2xs font-bold'
                  : 'bg-paper text-ink-muted hover:bg-paper-2 hover:text-ink border border-rule/60'
              }`}
            >
              <span>تمت التسوية بالكامل</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  balanceFilter === 'settled'
                    ? 'bg-emerald-200 text-emerald-950'
                    : 'bg-paper-2 text-ink-muted'
                }`}
              >
                {settledCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setBalanceFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
                balanceFilter === 'all'
                  ? 'bg-ink text-surface border border-ink shadow-2xs font-bold'
                  : 'bg-paper text-ink-muted hover:bg-paper-2 hover:text-ink border border-rule/60'
              }`}
            >
              <span>كل المطاعم</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  balanceFilter === 'all'
                    ? 'bg-ink/20 text-surface'
                    : 'bg-paper-2 text-ink-muted'
                }`}
              >
                {merchants.length}
              </span>
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <PageLoader />
            <span className="text-xs text-ink-muted mt-2 font-medium">جارٍ تحميل السجلات المالية...</span>
          </div>
        ) : filteredMerchants.length === 0 ? (
          <div className="py-16 text-center p-6 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-paper-2 text-ink-muted flex items-center justify-center mb-3">
              <Receipt size={22} />
            </div>
            <h3 className="text-sm font-bold text-ink">
              {balanceFilter === 'pending'
                ? 'لا توجد مستحقات معلقة حالياً'
                : 'لا توجد مطاعم مطابقة للبحث أو الفلتر'}
            </h3>
            <p className="text-xs text-ink-muted mt-1 max-w-sm">
              {balanceFilter === 'pending'
                ? 'تم سداد وتسوية حسابات كافة المطاعم الشريكة بنجاح!'
                : 'جرب تغيير نص البحث أو اختيار تبويب آخر لعرض البيانات.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-paper border-b border-rule text-ink-muted font-medium text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">المطعم</th>
                  <th className="py-3.5 px-4 font-semibold">المالك المسؤول</th>
                  <th className="py-3.5 px-4 font-semibold text-center">نسبة العمولة</th>
                  <th className="py-3.5 px-4 font-semibold">إجمالي المبيعات</th>
                  <th className="py-3.5 px-4 font-semibold">عمولة المنصة</th>
                  <th className="py-3.5 px-4 font-semibold">الرصيد المتاح للصرف</th>
                  <th className="py-3.5 px-4 font-semibold text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60">
                {filteredMerchants.map((m) => {
                  const hasBalance = Number(m.balance || 0) > 0;
                  return (
                    <tr
                      key={m.merchantId || m.id}
                      className={`transition-colors ${
                        hasBalance ? 'bg-amber-50/20 hover:bg-amber-50/40' : 'hover:bg-paper-2/40'
                      }`}
                    >
                      {/* Restaurant Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-paper border border-rule overflow-hidden shrink-0 flex items-center justify-center">
                            {m.logoUrl ? (
                              <img
                                src={m.logoUrl}
                                alt={m.storeName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <Store size={16} className="text-accent" />
                            )}
                          </div>
                          <span
                            className="font-bold text-ink text-xs truncate max-w-[170px]"
                            title={m.storeName}
                          >
                            {m.storeName}
                          </span>
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="py-3.5 px-4 text-ink-secondary text-xs truncate max-w-[140px]">
                        {m.ownerName || '—'}
                      </td>

                      {/* Commission Rate */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setEditingMerchant(m)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rule hover:border-accent bg-surface hover:bg-accent-light text-ink font-mono font-bold text-xs transition-colors cursor-pointer group"
                          title="تعديل نسبة العمولة"
                        >
                          <span className="text-accent">{m.commissionRate}%</span>
                          <Edit3
                            size={11}
                            className="text-ink-muted group-hover:text-accent transition-colors"
                          />
                        </button>
                      </td>

                      {/* Total Sales */}
                      <td className="py-3.5 px-4 text-xs">
                        <span className="inline-flex items-center gap-1 font-semibold text-ink" dir="ltr">
                          <span className="font-mono">{formatMoney(m.totalSales)}</span>
                          <span className="text-ink-muted text-[11px] font-normal">ج.م</span>
                        </span>
                      </td>

                      {/* Platform Commission */}
                      <td className="py-3.5 px-4 text-xs">
                        <span className="inline-flex items-center gap-1 font-semibold text-accent" dir="ltr">
                          <span className="font-mono">{formatMoney(m.totalCommissionPaid)}</span>
                          <span className="text-accent/70 text-[11px] font-normal">ج.م</span>
                        </span>
                      </td>

                      {/* Available Balance */}
                      <td className="py-3.5 px-4 text-xs">
                        {hasBalance ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-bold shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse shrink-0" />
                            <span className="text-[11px]">مستحق:</span>
                            <span dir="ltr" className="font-mono">{formatMoney(m.balance)}</span>
                            <span className="text-[10px] font-normal">ج.م</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
                            <span>✓ تم السداد بالكامل</span>
                          </div>
                        )}
                      </td>

                      {/* Action Button (المشكلة الثانية ج: تمييز زر سداد الأرباح) */}
                      <td className="py-3.5 px-4 text-center">
                        {hasBalance ? (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<ArrowDownLeft size={13} />}
                            onClick={() => setPayoutMerchant(m)}
                            className="font-bold shadow-xs hover:shadow-sm"
                          >
                            سداد الأرباح
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="opacity-50 text-ink-faint border border-rule cursor-not-allowed text-[11px]"
                          >
                            تمت التسوية
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Commission Modal ── */}
      <CommissionEditModal
        isOpen={!!editingMerchant}
        merchant={editingMerchant}
        onClose={() => setEditingMerchant(null)}
        onSave={handleCommissionSave}
      />

      {/* ── Record Payout Modal ── */}
      <RecordPayoutModal
        isOpen={!!payoutMerchant}
        merchant={payoutMerchant}
        onClose={() => setPayoutMerchant(null)}
        onConfirm={handlePayoutConfirm}
      />
    </div>
  );
}

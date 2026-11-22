import { useState } from "react";
import { useAdminMerchants } from "./useAdminMerchants";
import { MerchantKycModal } from "./MerchantKycModal";
import { RejectReasonModal } from "./RejectReasonModal";
import {
  Button,
  Badge,
  Tabs,
  Pagination,
  Input,
  PageLoader,
} from "../../../components/ui";
import {
  Store,
  Search,
  ShieldCheck,
  ShieldAlert,
  PauseCircle,
  PlayCircle,
  Eye,
  AlertCircle,
  CheckCircle2,
  Phone,
} from "lucide-react";

export function AdminMerchantsPage() {
  const {
    merchants,
    totalCount,
    totalPages,
    pageNumber,
    setPageNumber,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    stats,
    approveMerchant,
    rejectMerchant,
    toggleStatus,
  } = useAdminMerchants();

  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [rejectingMerchant, setRejectingMerchant] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const showFeedback = (text, type = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleApprove = async (id) => {
    const res = await approveMerchant(id);
    if (res.success) {
      showFeedback("تم اعتماد وتفعيل المطعم بنجاح.");
      if (selectedMerchant?.id === id) {
        setSelectedMerchant(null);
      }
    } else {
      showFeedback(res.error, "danger");
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectingMerchant) return;
    const res = await rejectMerchant(rejectingMerchant.id, reason);
    if (res.success) {
      showFeedback("تم رفض اعتماد المطعم وإخطاره بالأسباب.");
      setRejectingMerchant(null);
      if (selectedMerchant?.id === rejectingMerchant.id) {
        setSelectedMerchant(null);
      }
    } else {
      showFeedback(res.error, "danger");
    }
  };

  const handleToggle = async (id, currentActive) => {
    const res = await toggleStatus(id);
    if (res.success) {
      showFeedback(
        currentActive
          ? "تم تجميد المطعم مؤقتاً."
          : "تمت إعادة تنشيط المطعم بنجاح.",
      );
    } else {
      showFeedback(res.error, "danger");
    }
  };

  const tabs = [
    { id: "pending", label: "بانتظار الاعتماد", count: stats.pending },
    { id: "approved", label: "المعتمدة والنشطة", count: stats.approved },
    { id: "suspended", label: "الموقوفة" },
    { id: "all", label: "جميع المطاعم", count: stats.total },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-readex">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-rule">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink tracking-tight">
              اعتماد ومراجعة المطاعم (KYC)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-accent-light text-accent text-xs font-bold border border-accent/20">
              {totalCount} مطعم
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">
            مراجعة طلبات الانضمام الجديدة، التحقق من بيانات المالك والمقر
            الجغرافي، وإصدار قرارات الاعتماد
          </p>
        </div>

        {feedbackMsg && (
          <div
            className={`px-3.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 animate-fade-in ${
              feedbackMsg.type === "danger"
                ? "bg-danger-light text-danger border-danger/30"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            {feedbackMsg.type === "danger" ? (
              <AlertCircle size={15} />
            ) : (
              <CheckCircle2 size={15} />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-danger-light border border-danger/30 text-danger text-xs font-medium flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Tabs & Search Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-rule shadow-xs">
        <Tabs
          tabs={tabs}
          activeTab={statusFilter}
          onChange={(tabId) => {
            setStatusFilter(tabId);
            setPageNumber(1);
          }}
          variant="pills"
        />

        <div className="relative w-full md:w-72">
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPageNumber(1);
            }}
            placeholder="بحث باسم المطعم، المالك، الهاتف..."
            className="text-xs pl-8"
          />
          <Search
            size={14}
            className="absolute left-3 top-3 text-ink-faint pointer-events-none"
          />
        </div>
      </div>

      {/* ── Merchants Table ── */}
      <div className="bg-surface rounded-2xl border border-rule overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <PageLoader />
            <span className="text-xs text-ink-muted mt-2 font-medium">
              جارٍ تحميل بيانات المطاعم...
            </span>
          </div>
        ) : merchants.length === 0 ? (
          <div className="py-16 text-center p-6 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-paper-2 text-ink-muted flex items-center justify-center mb-3">
              <Store size={22} />
            </div>
            <h3 className="text-sm font-bold text-ink">لا توجد مطاعم مطابقة</h3>
            <p className="text-xs text-ink-muted mt-1 max-w-sm">
              لم يتم العثور على أي مطاعم تتطابق مع معايير الفلترة أو البحث
              المحددة.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-paper border-b border-rule text-ink-muted font-medium text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">المطعم والتصنيف</th>
                  <th className="py-3.5 px-4 font-semibold">المالك والاتصال</th>
                  <th className="py-3.5 px-4 font-semibold">المقر الجغرافي</th>
                  <th className="py-3.5 px-4 font-semibold text-center">
                    العمولة
                  </th>
                  <th className="py-3.5 px-4 font-semibold text-center">
                    الحالة
                  </th>
                  <th className="py-3.5 px-4 font-semibold text-center">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60">
                {merchants.map((m) => {
                  const isPending = !m.isApproved;
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-paper-2/40 transition-colors"
                    >
                      {/* Restaurant info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-paper border border-rule overflow-hidden shrink-0 flex items-center justify-center">
                            {m.logoUrl ? (
                              <img
                                src={m.logoUrl}
                                alt={m.storeName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <Store size={18} className="text-accent" />
                            )}
                          </div>
                          <div>
                            <span
                              className="font-bold text-ink text-xs truncate max-w-[170px] block"
                              title={m.storeName}
                            >
                              {m.storeName}
                            </span>
                            <span className="text-[11px] text-ink-muted block mt-0.5">
                              {m.category || "أطعمة ومشروبات"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Owner & contact */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-ink text-xs">
                          {m.ownerName || "—"}
                        </p>
                        <div
                          className="flex items-center gap-1 text-[11px] text-ink-faint font-mono mt-0.5"
                          dir="rtr"
                        >
                          <span>{m.phoneNumber}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td
                        className="py-3.5 px-4 text-ink-secondary text-xs truncate max-w-[180px]"
                        title={m.addressTitle}
                      >
                        {m.addressTitle || "غير مسجل"}
                      </td>

                      {/* Commission */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-xs text-accent tabular-nums">
                        {m.commissionRate}%
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={
                            isPending
                              ? "warning"
                              : m.isActive
                                ? "success"
                                : "danger"
                          }
                        >
                          {isPending
                            ? "بانتظار الاعتماد"
                            : m.isActive
                              ? "معتمد"
                              : "موقوف"}
                        </Badge>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye size={14} />}
                            onClick={() => setSelectedMerchant(m)}
                          >
                            معاينة
                          </Button>

                          {isPending ? (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<ShieldCheck size={14} />}
                              onClick={() => handleApprove(m.id)}
                            >
                              اعتماد
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={
                                m.isActive ? (
                                  <PauseCircle size={14} />
                                ) : (
                                  <PlayCircle size={14} />
                                )
                              }
                              onClick={() => handleToggle(m.id, m.isActive)}
                            >
                              {m.isActive ? "تجميد" : "تنشيط"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-rule flex justify-center">
            <Pagination
              currentPage={pageNumber}
              totalPages={totalPages}
              onPageChange={setPageNumber}
            />
          </div>
        )}
      </div>

      {/* ── KYC Modal ── */}
      <MerchantKycModal
        isOpen={!!selectedMerchant}
        merchant={selectedMerchant}
        onClose={() => setSelectedMerchant(null)}
        onApprove={handleApprove}
        onOpenReject={(m) => setRejectingMerchant(m)}
      />

      {/* ── Reject Reason Modal ── */}
      <RejectReasonModal
        isOpen={!!rejectingMerchant}
        merchantName={rejectingMerchant?.storeName}
        onClose={() => setRejectingMerchant(null)}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
}

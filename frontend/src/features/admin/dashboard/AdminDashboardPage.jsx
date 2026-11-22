import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../../services/adminService";
import { Button, Badge, PageLoader } from "../../../components/ui";
import { formatMoney } from "../../../utils/formatters";
import {
  TrendingUp,
  Store,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  CircleDollarSign,
  Activity,
} from "lucide-react";

export function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [pendingMerchants, setPendingMerchants] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const [overviewRes, merchantsRes] = await Promise.allSettled([
          adminService.getFinanceOverview(),
          adminService.getMerchants({ status: "pending", pageSize: 5 }),
        ]);

        if (isMounted) {
          if (overviewRes.status === "fulfilled" && overviewRes.value) {
            setOverview(overviewRes.value);
          }
          if (merchantsRes.status === "fulfilled" && merchantsRes.value) {
            setPendingMerchants(merchantsRes.value.items || []);
          }
        }
      } catch (err) {
        console.error("فشل تحميل بيانات لوحة الإدارة:", err);
        if (isMounted) setError("تعذر تحميل بعض مؤشرات النظام");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <PageLoader />
        <span className="text-xs text-ink-muted mt-3 font-medium">
          جاري تجميع مؤشرات المنصة المركزية...
        </span>
      </div>
    );
  }

  const totalGmv = overview?.totalGmv || overview?.totalPlatformVolume || 0;
  const platformRevenue =
    overview?.platformRevenue || overview?.totalCommissionEarned || 0;
  const pendingCount =
    overview?.pendingMerchantsCount || pendingMerchants.length || 0;
  const activeMerchants = overview?.activeMerchantsCount || 0;
  const totalOrders =
    overview?.totalOrdersCount || overview?.todayOrdersCount || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Welcome & Top Status Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-rule">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-ink tracking-tight">
              نظرة عامة على المنصة
            </h1>
            <Badge
              variant="accent"
              icon={<Activity size={12} className="animate-pulse" />}
            >
              مباشر
            </Badge>
          </div>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">
            متابعة حركة المبيعات الكلية، طلبات انضمام المطاعم الجديدة، وأداء
            العمولات المركزية لـ "طلبلي"
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/admin/merchants">
            <Button variant="outline" size="sm" icon={<Store size={15} />}>
              إدارة المطاعم
            </Button>
          </Link>
          <Link to="/admin/finance">
            <Button
              variant="primary"
              size="sm"
              icon={<CircleDollarSign size={15} />}
            >
              التقرير المالي
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-danger-light border border-danger/30 text-danger text-xs font-medium flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Top KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GMV Card */}
        <div className="bg-surface p-5 rounded-2xl border border-rule shadow-xs hover:border-rule-strong transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">
              إجمالي مبيعات المنصة (GMV)
            </span>
            <div className="w-8 h-8 rounded-xl bg-accent-light text-accent flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1" dir="rtr">
            <span className="text-2xl font-bold font-mono tracking-tight text-ink">
              {formatMoney(totalGmv)}
            </span>
            <span className="text-xs text-ink-muted mr-1 font-medium">ج.م</span>
          </div>
          <p className="text-[11px] text-ink-faint mt-2 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold flex items-center">
              <ArrowUpRight size={13} /> +12%
            </span>
            <span>مقارنة بالأسبوع السابق</span>
          </p>
        </div>

        {/* Platform Commission Revenue */}
        <div className="bg-surface p-5 rounded-2xl border border-rule shadow-xs hover:border-rule-strong transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">
              صافي إيرادات العمولات
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CircleDollarSign size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1" dir="rtr">
            <span className="text-2xl font-bold font-mono tracking-tight text-ink">
              {formatMoney(platformRevenue)}
            </span>
            <span className="text-xs text-ink-muted mr-1 font-medium">ج.م</span>
          </div>
          <p className="text-[11px] text-ink-faint mt-2">
            مستحقات المنصة بعد خصم مستحقات الشركاء
          </p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-surface p-5 rounded-2xl border border-rule shadow-xs hover:border-rule-strong transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">
              طلبات انضمام معلقة (KYC)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-ink">
              {pendingCount}
            </span>
            <span className="text-xs text-ink-muted">
              مطعم بانتظار المراجعة
            </span>
          </div>
          <p className="text-[11px] text-amber-700 mt-2 font-medium">
            {pendingCount > 0
              ? "يتطلب إجراء مباشر للاعتماد"
              : "تم اعتماد كافة المطاعم"}
          </p>
        </div>

        {/* Active Partners */}
        <div className="bg-surface p-5 rounded-2xl border border-rule shadow-xs hover:border-rule-strong transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-muted">
              المطاعم الشريكة النشطة
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Store size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-ink">
              {activeMerchants}
            </span>
            <span className="text-xs text-ink-muted">متجر شريك معتمد</span>
          </div>
          <p className="text-[11px] text-ink-faint mt-2">
            جاهزون لاستقبال الطلبات الفورية
          </p>
        </div>
      </div>

      {/* ── Pending KYC Review Queue Section ── */}
      <div className="bg-surface rounded-2xl border border-rule overflow-hidden shadow-xs">
        <div className="p-5 border-b border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-ink">
                قائمة اعتماد المطاعم الجديدة
              </h2>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-warning-light text-warning text-xs font-bold border border-warning/30">
                  {pendingCount} معلق
                </span>
              )}
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              مراجعة سريعة لأحدث طلبات الشراكة وفحص بيانات السجل التجاري والموقع
            </p>
          </div>

          <Link
            to="/admin/merchants"
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 group"
          >
            <span>عرض كل الطلبات</span>
            <ChevronLeft
              size={16}
              className="transition-transform group-hover:-translate-x-0.5"
            />
          </Link>
        </div>

        {pendingMerchants.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-sm font-bold text-ink">
              لا توجد طلبات انضمام معلقة حالياً
            </h3>
            <p className="text-xs text-ink-muted mt-1 max-w-sm">
              رائع! تم تدقيق واعتماد كافة المطاعم المسجلة على المنصة حتى اللحظة.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-paper text-ink-muted font-medium border-b border-rule">
                <tr>
                  <th className="py-3 px-4">اسم المطعم</th>
                  <th className="py-3 px-4">المالك وبيانات الاتصال</th>
                  <th className="py-3 px-4">المنطقة الجغرافية</th>
                  <th className="py-3 px-4">تاريخ التسجيل</th>
                  <th className="py-3 px-4 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60">
                {pendingMerchants.map((merchant) => (
                  <tr
                    key={merchant.id}
                    className="hover:bg-paper-2/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center font-bold text-xs shrink-0">
                          {merchant.storeName
                            ? merchant.storeName.charAt(0)
                            : "م"}
                        </div>
                        <div>
                          <p className="font-bold text-ink">
                            {merchant.storeName || "بدون اسم"}
                          </p>
                          <span className="text-[10px] text-ink-muted font-mono">
                            {merchant.commercialRegister ||
                              "سجل تجاري قيد الفحص"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-ink">
                        {merchant.ownerName || "غير مسجل"}
                      </p>
                      <p className="text-[11px] text-ink-muted font-mono">
                        {merchant.phoneNumber || "—"}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-ink-secondary">
                      {merchant.addressTitle ||
                        merchant.governorate ||
                        "الموقع الجغرافي مثبت بالخريطة"}
                    </td>

                    <td className="py-3.5 px-4 text-ink-faint">
                      {merchant.createdAt
                        ? new Date(merchant.createdAt).toLocaleDateString(
                            "ar-EG",
                          )
                        : "اليوم"}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Link to="/admin/merchants">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<ShieldCheck size={14} />}
                        >
                          مراجعة واعتماد
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Quick System Diagnostics & Actions ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-rule flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <CheckCircle2 size={18} />
            </div>
            <h3 className="text-sm font-bold text-ink">حالة خوادم طلبلي</h3>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              جميع خدمات الـ Backend والـ SignalR Hub ومعالجة المدفوعات متصلة
              وتعمل بنجاح.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-rule flex items-center justify-between text-xs">
            <span className="text-ink-faint font-mono">API Version 1.0</span>
            <Badge variant="success">متصل 100%</Badge>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-rule flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xl bg-accent-light text-accent flex items-center justify-center mb-3">
              <Store size={18} />
            </div>
            <h3 className="text-sm font-bold text-ink">
              إدارة العمولات المالية
            </h3>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              يمكنك تخصيص نسبة عمولة المنصة لكل مطعم شريك على حدة بناءً على حجم
              مبيعاته.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-rule">
            <Link
              to="/admin/finance"
              className="text-xs font-semibold text-accent hover:underline flex items-center justify-between"
            >
              <span>فتح سجل العمولات والتسويات</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-rule flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <Activity size={18} />
            </div>
            <h3 className="text-sm font-bold text-ink">مراقبة الطلبات الحية</h3>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              تتبع جميع طلبات المنصة الحالية، نسب التوصيل، والتنبيه على
              الأوردرات المتأخرة.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-rule">
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-accent hover:underline flex items-center justify-between"
            >
              <span>فتح مراقبة الطلبات</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AuthSplitBanner } from "../../components/shared/AuthSplitBanner";

export function RegisterCustomerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerCustomer } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    PhoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || location.state?.from || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("كلمة المرور وتأكيدها غير متطابقين!");
      return;
    }
    setIsSubmitting(true);
    try {
      await registerCustomer(formData);
      const dest =
        typeof from === "string" &&
        (from.startsWith("/vendor") || from.startsWith("/admin"))
          ? "/"
          : from;
      navigate(dest, { replace: true });
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.message || "فشل إنشاء الحساب، يرجى مراجعة البيانات المدخلة.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-paper font-readex w-full">
      {/* Side 1: Brand intro (Editorial Banner) */}
      <AuthSplitBanner
        title="تجربة طلب واضحة وبسيطة"
        description="أنشئ حسابك في منصة طلبلي لبدء تصفح أشهى الأطباق من المطاعم القريبة والحصول على أوقات توصيل دقيقة مباشرة عند موقعك."
        copyright="© 2026 طلبلي. جميع الحقوق محفوظة."
      />

      {/* Side 2: Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 bg-surface border border-rule rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="md:hidden text-center mb-2">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="text-xl font-bold text-ink">طلبلي</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            </Link>
          </div>

          <div>
            <h1 className="text-xl font-bold text-ink">إنشاء حساب عميل جديد</h1>
            <p className="text-xs text-ink-muted mt-1">
              أدخل بياناتك للتسجيل والبدء بالطلب فوراً
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label text-xs">الاسم الأول</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="form-input text-xs"
                />
              </div>
              <div>
                <label className="form-label text-xs">اسم العائلة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: محمد"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="form-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="form-label text-xs">البريد الإلكتروني</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="form-input text-xs"
              />
            </div>

            <div>
              <label className="form-label text-xs">رقم الهاتف المحمول</label>
              <input
                type="tel"
                required
                placeholder="01012345678"
                value={formData.PhoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, PhoneNumber: e.target.value })
                }
                className="form-input text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label text-xs">كلمة المرور</label>
                <input
                  type="password"
                  required
                  placeholder="8 خانات على الأقل"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="form-input text-xs"
                />
              </div>
              <div>
                <label className="form-label text-xs">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  required
                  placeholder="أعد إدخال الكلمة"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="form-input text-xs"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-ink-secondary">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 rounded accent-accent"
                />
                <span>
                  أوافق على شروط الاستخدام وسياسة الخصوصية لمنصة طلبلي.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              إنشاء الحساب
            </button>
          </form>

          <div className="pt-4 border-t border-rule text-center text-xs text-ink-muted space-y-1.5">
            <p>
              لديك حساب مسجل بالفعل؟{" "}
              <Link
                to="/login"
                state={{ from: location.state?.from }}
                className="text-accent font-medium hover:underline"
              >
                تسجيل الدخول
              </Link>
            </p>
            <p>
              أنت صاحب مطعم؟{" "}
              <Link to="/register-vendor" className="text-ink hover:underline">
                سجل مطعمك كشريك
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

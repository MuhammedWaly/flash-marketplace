import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthSplitBanner } from '../../components/shared/AuthSplitBanner';

export function RegisterVendorPage() {
  const navigate = useNavigate();
  const { registerVendor } = useAuth();

  const [formData, setFormData] = useState({
    ownerName: '',
    phone: '',
    email: '',
    password: '',
    storeName: '',
    cuisine: 'shawarma',
    description: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await registerVendor(formData);
      navigate('/vendor', { replace: true });
    } catch (err) {
      console.error('Vendor registration error:', err);
      setError(err.message || 'فشل تسجيل المطعم، يرجى مراجعة البيانات.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-paper font-readex w-full">
      {/* Side 1: Brand intro (Editorial Banner) */}
      <AuthSplitBanner
        title="شراكة تجارية عادلة ومباشرة"
        description="انضم لشبكة المطاعم الشريكة في منصة طلبلي، واستقبل طلبات زبائن منطقتك مع تحكم كامل بنطاق التوصيل الجغرافي وقوائم الوجبات."
        copyright="© 2026 طلبلي للشركاء. جميع الحقوق محفوظة."
      />

      {/* Side 2: Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg space-y-6 bg-surface border border-rule rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="md:hidden text-center mb-2">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="text-xl font-bold text-ink">طلبلي</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            </Link>
          </div>

          <div>
            <h1 className="text-xl font-bold text-ink">تسجيل شريك جديد (صاحب مطعم)</h1>
            <p className="text-xs text-ink-muted mt-1">أدخل بيانات المسؤول وبيانات الفرع للبدء بتفعيل الحساب</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Section 1: Owner Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-ink pb-1.5 border-b border-rule">
                بيانات المالك أو المسؤول
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد عبد الله"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">رقم الهاتف</label>
                  <input
                    type="tel"
                    required
                    placeholder="01012345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xs">البريد الإلكتروني للعمل</label>
                <input
                  type="email"
                  required
                  placeholder="owner@restaurant.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs">كلمة المرور</label>
                <input
                  type="password"
                  required
                  placeholder="8 خانات على الأقل"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="form-input text-xs"
                />
              </div>
            </div>

            {/* Section 2: Restaurant Details */}
            <div className="space-y-3 pt-3 border-t border-rule">
              <h3 className="text-xs font-bold text-ink pb-1.5 border-b border-rule">
                بيانات المطعم والفرع
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs">اسم المطعم التجاري</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: شاورما الريم"
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">التصنيف الرئيسي</label>
                  <select
                    value={formData.cuisine}
                    onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                    className="form-select text-xs"
                  >
                    <option value="shawarma">شاورما وساندوتشات</option>
                    <option value="grills">مشويات ولحوم</option>
                    <option value="pizza">بيتزا ومعجنات</option>
                    <option value="burger">برجر</option>
                    <option value="egyptian">أكلات مصرية</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label text-xs">نبذة عن الأطباق المقدمة</label>
                <textarea
                  rows="2"
                  placeholder="اكتب نبذة مختصرة عن مطبخكم وأطباقكم الرئيسية…"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input text-xs resize-none"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-ink-secondary">
                <input type="checkbox" required className="mt-0.5 rounded accent-accent" />
                <span>أوافق على شروط وأحكام شراكة المطاعم في منصة طلبلي.</span>
              </label>
            </div>

            <button type="submit" className="w-full py-2.5 px-4 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer">
              تسجيل المطعم وبدء الشراكة
            </button>
          </form>

          <div className="pt-3 border-t border-rule text-center text-xs text-ink-muted">
            <p>لديك حساب شريك بالفعل؟ <Link to="/login" className="text-accent font-medium hover:underline">تسجيل الدخول</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

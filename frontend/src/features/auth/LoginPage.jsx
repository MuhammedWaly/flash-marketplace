import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthSplitBanner } from '../../components/shared/AuthSplitBanner';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isVendor, isAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // لو المستخدم مسجل بالفعل، يتم تحويله لمكانه المخصص
  React.useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else if (isVendor) {
        navigate('/vendor', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, isVendor, isAdmin, navigate]);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const user = await login({ email, password });
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'vendor') {
        navigate('/vendor', { replace: true });
      } else {
        const dest = from.startsWith('/vendor') || from.startsWith('/admin') ? '/' : from;
        navigate(dest, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'بيانات الدخول غير صحيحة أو الخادم غير متاح.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-paper font-readex w-full">
      {/* Side 1: Brand intro (Editorial Banner) */}
      <AuthSplitBanner
        title="طعامك المفضل بدقة التوصيل المباشر"
        description="سجل دخولك لمتابعة طلباتك السابقة وإدارة عناوينك واستقبال العروض المخصصة لمنطقتك بدقة عالية."
        copyright="© 2026 طلبلي. منصة طلب الطعام."
      />

      {/* Side 2: Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-sm space-y-6 bg-surface border border-rule rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="md:hidden text-center mb-2">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="text-xl font-bold text-ink">طلبلي</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            </Link>
          </div>

          <div>
            <h1 className="text-xl font-bold text-ink">تسجيل الدخول</h1>
            <p className="text-xs text-ink-muted mt-1">أدخل البريد الإلكتروني وكلمة المرور للمتابعة</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label text-xs">البريد الإلكتروني</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input text-xs"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="form-label text-xs mb-0">كلمة المرور</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('خاصية استعادة كلمة المرور ستصلك على بريدك الإلكتروني.'); }} className="text-[11px] text-accent hover:underline">
                  نسيت الكلمة؟
                </a>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input text-xs"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-ink-secondary">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded accent-accent"
                />
                <span>تذكر بياناتي</span>
              </label>
            </div>

            <button type="submit" className="w-full py-2.5 px-4 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer">
              تسجيل الدخول
            </button>
          </form>

          <div className="pt-4 border-t border-rule text-center text-xs text-ink-muted space-y-1.5">
            <p>ليس لديك حساب بعد؟ <Link to="/register-customer" state={{ from: location.state?.from }} className="text-accent font-medium hover:underline">إنشاء حساب عميل</Link></p>
            <p>أنت صاحب مطعم؟ <Link to="/register-vendor" className="text-ink hover:underline">تسجيل مطعم جديد</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

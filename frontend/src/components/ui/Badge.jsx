/**
 * Badge Component (UI Atom)
 * يعرض حالات الأوردر والتوصيل والمسافات والـ KYC
 * 
 * @param {'neutral' | 'accent' | 'warning' | 'success' | 'danger' | 'info'} variant - نمط ولون البادج
 * @param {React.ReactNode} icon - أيقونة اختيارية تظهر قبل النص
 */
export function Badge({
  children,
  variant = 'neutral',
  icon = null,
  className = '',
  ...props
}) {
  const variantClass = {
    neutral: 'badge-status--neutral',
    accent: 'badge-status--accent',
    warning: 'badge-status--warning',
    success: 'badge-status--success',
    danger: 'badge-status--danger',
    info: 'badge-status--info',
  }[variant] || 'badge-status--neutral';

  return (
    <span className={`badge-status ${variantClass} ${className}`.trim()} {...props}>
      {icon && <span className="inline-flex items-center text-[11px] shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

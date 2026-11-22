import React from 'react';

/**
 * Button Component (UI Atom)
 * 
 * @param {'primary' | 'outline' | 'ghost'} variant - شكل الزرار
 * @param {'sm' | 'md' | 'lg'} size - مقاس الزرار
 * @param {boolean} block - هل يأخذ العرض بالكامل (width: 100%)
 * @param {boolean} loading - هل في حالة تحميل مع تعطيل الضغط
 * @param {React.ReactNode} icon - أيقونة تظهر بجانب النص
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  disabled = false,
  icon = null,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const variantClass = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  }[variant] || 'btn-primary';

  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }[size] || '';

  const blockClass = block ? 'btn-block' : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn ${variantClass} ${sizeClass} ${blockClass} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="inline-flex items-center">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
}

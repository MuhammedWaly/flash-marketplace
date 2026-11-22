import React, { useId } from 'react';

/**
 * Input Component (UI Atom)
 * حقل إدخال نصوص أو أرقام مع دعم الـ Label ورسائل الخطأ
 */
export function Input({
  label,
  error,
  id,
  type = 'text',
  className = '',
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={`form-input ${error ? '!border-red-500' : ''} ${className}`.trim()}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
}

/**
 * Select Component (UI Atom)
 */
export function Select({
  label,
  error,
  id,
  children,
  className = '',
  ...props
}) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`form-select ${error ? '!border-red-500' : ''} ${className}`.trim()}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
}

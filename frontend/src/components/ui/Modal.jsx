import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modal Component (UI Molecule)
 * نافذة منبثقة مع Accessible Backdrop، إغلاق بالـ ESC وبالضغط خارج المودال
 * 
 * @param {boolean} isOpen - حالة فتح/إغلاق المودال
 * @param {function} onClose - دالة الإغلاق
 * @param {string} title - عنوان المودال
 * @param {'default' | 'lg'} size - حجم المودال
 * @param {React.ReactNode} footer - أزرار أو عناصر الفوتر
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
  size = 'default',
}) {
  // إغلاق المودال عند الضغط على زر Escape في الكيبورد
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // منع السكرول في الـ Body أثناء فتح المودال
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`modal-overlay is-open`}
      onClick={(e) => {
        // لو ضغط في الخلفية خارج كارت المودال نفسه، اقفل
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className={`modal ${size === 'lg' ? 'modal--lg' : ''}`}>
        {/* Header */}
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal__body">{children}</div>

        {/* Optional Footer */}
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

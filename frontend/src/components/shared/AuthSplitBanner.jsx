import React from 'react';
import { Link } from 'react-router-dom';

/**
 * AuthSplitBanner Component
 * The editorial left-side banner displayed on authentication pages (Login, Register).
 */
export function AuthSplitBanner({
  title,
  description,
  copyright = '© 2026 طلبلي. جميع الحقوق محفوظة.',
}) {
  return (
    <div className="hidden md:flex md:w-5/12 bg-paper-subtle p-8 lg:p-12 flex-col justify-between border-l border-rule flex-shrink-0">
      <div>
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-bold tracking-tight text-ink group-hover:text-accent transition-colors">
            طلبلي
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
        </Link>
      </div>

      <div className="space-y-4 max-w-sm">
        <h2 className="text-2xl font-bold text-ink leading-tight">{title}</h2>
        <p className="text-sm text-ink-muted leading-relaxed">{description}</p>
      </div>

      <p className="text-xs text-ink-faint">{copyright}</p>
    </div>
  );
}

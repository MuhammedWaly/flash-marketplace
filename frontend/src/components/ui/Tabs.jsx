/**
 * Tabs Component (UI Atom)
 * يدعم التبويبات بنمطين: خط تحتي كلاسيكي (underline) أو كبسولات (pills)
 * 
 * @param {Array<{ id: string, label: string, count?: number, icon?: React.ReactNode }>} tabs
 * @param {string} activeTab
 * @param {(id: string) => void} onChange
 * @param {'underline' | 'pills'} variant
 */
export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'underline',
  className = '',
}) {
  if (!tabs || tabs.length === 0) return null;

  if (variant === 'pills') {
    return (
      <div className={`flex items-center gap-1.5 p-1 bg-paper-2 rounded-xl border border-rule/60 overflow-x-auto ${className}`.trim()}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange?.(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-surface text-ink font-semibold shadow-sm border border-rule/80'
                  : 'text-ink-muted hover:text-ink hover:bg-surface/50'
              }`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-accent-light text-accent'
                      : 'bg-paper text-ink-muted'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Classic Underline Tabs
  return (
    <div className={`tabs ${className}`.trim()}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange?.(tab.id)}
            className={`tabs__tab ${isActive ? 'tabs__tab--active' : ''} flex items-center gap-2`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive
                    ? 'bg-accent-light text-accent'
                    : 'bg-paper-2 text-ink-muted'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

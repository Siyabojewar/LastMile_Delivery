import React from 'react';

const ALERT_STYLES = {
  error:   { wrap: 'bg-red-50 border-red-200 text-red-800',     icon: '⚠', iconCls: 'text-red-600' },
  success: { wrap: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: '✓', iconCls: 'text-emerald-600' },
  info:    { wrap: 'bg-blue-50 border-blue-200 text-blue-800',  icon: 'ℹ', iconCls: 'text-blue-600' },
  warning: { wrap: 'bg-amber-50 border-amber-200 text-amber-800', icon: '⚠', iconCls: 'text-amber-600' },
};

export default function Alert({ type = 'error', message, className = '', title, dismissible = false, onDismiss }) {
  if (!message) return null;
  const style = ALERT_STYLES[type] || ALERT_STYLES.error;

  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${style.wrap} ${className}`}>
      <span className={`shrink-0 font-bold text-lg leading-none mt-px ${style.iconCls}`}>{style.icon}</span>
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold mb-1">{title}</div>}
        <div className="leading-relaxed">{message}</div>
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={`shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors focus:outline-none ${style.iconCls}`}
          aria-label="Dismiss alert"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

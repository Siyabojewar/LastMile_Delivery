import React from 'react';

const STYLES = {
  error:   { wrap: 'bg-red-50 border-red-200 text-red-700',           icon: '⚠', iconCls: 'text-red-500' },
  success: { wrap: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: '✓', iconCls: 'text-emerald-500' },
  info:    { wrap: 'bg-blue-50 border-blue-200 text-blue-700',         icon: 'ℹ', iconCls: 'text-blue-500' },
  warning: { wrap: 'bg-amber-50 border-amber-200 text-amber-800',      icon: '⚠', iconCls: 'text-amber-500' },
};

export default function Alert({ type = 'error', message, className = '' }) {
  if (!message) return null;
  const s = STYLES[type] || STYLES.error;
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm
                     shadow-card animate-scale-in ${s.wrap} ${className}`}>
      <span className={`shrink-0 font-extrabold mt-px text-base leading-none ${s.iconCls}`}>
        {s.icon}
      </span>
      <p className="leading-relaxed">{message}</p>
    </div>
  );
}

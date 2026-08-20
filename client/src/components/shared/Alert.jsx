import React from 'react';

const STYLES = {
  error:   { wrap: 'bg-red-50 border-red-200 text-red-700',     icon: '⚠' },
  success: { wrap: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: '✓' },
  info:    { wrap: 'bg-blue-50 border-blue-200 text-blue-700',   icon: 'ℹ' },
  warning: { wrap: 'bg-amber-50 border-amber-200 text-amber-700', icon: '⚠' },
};

export default function Alert({ type = 'error', message, className = '' }) {
  if (!message) return null;
  const s = STYLES[type] || STYLES.error;
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${s.wrap} ${className}`}>
      <span className="shrink-0 font-bold mt-px">{s.icon}</span>
      <p>{message}</p>
    </div>
  );
}

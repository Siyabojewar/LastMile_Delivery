import React from 'react';

/**
 * Visual grouping container for related form fields.
 *
 * Props:
 *   title   – section heading (required)
 *   icon    – emoji shown beside title
 *   step    – optional step number (shown as a numbered circle)
 *   children
 */
export default function FormSection({ title, icon, step, children }) {
  return (
    <div className="form-section">
      <div className="form-section-title">
        {step != null && (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold shrink-0">
            {step}
          </span>
        )}
        {icon && <span className="text-base leading-none">{icon}</span>}
        <span>{title}</span>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

import React from 'react';

/**
 * Visual grouping container for related form fields.
 * Renders as a white card with a branded left accent stripe on the active step.
 *
 * Props:
 *   title    – section heading (required)
 *   icon     – emoji shown beside title
 *   step     – optional step number (shown as branded circle)
 *   children
 */
export default function FormSection({ title, icon, step, children }) {
  return (
    <div className="form-section relative overflow-hidden">
      {/* Subtle left-accent stripe */}
      <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-brand-400 to-brand-200 rounded-full" />

      <div className="form-section-title pl-3">
        {step != null && (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full
                           bg-brand-600 text-white text-xs font-extrabold shrink-0
                           shadow-card ring-2 ring-brand-200">
            {step}
          </span>
        )}
        {icon && <span className="text-base leading-none">{icon}</span>}
        <span className="font-bold text-gray-700">{title}</span>
      </div>

      <div className="space-y-4 pl-3">
        {children}
      </div>
    </div>
  );
}

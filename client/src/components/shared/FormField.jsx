import React from 'react';

/**
 * Form field wrapper providing label, validation states, hint and error text.
 * Does NOT clone children — just renders them. Apply .input / .input-error
 * classes directly on the input element inside.
 */
export default function FormField({
  label,
  id,
  error,
  success,
  hint,
  required = false,
  optional = false,
  children,
  className = '',
}) {
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success) && !hasError;

  return (
    <div className={className}>
      {/* Label */}
      <label htmlFor={id} className="label">
        {label}
        {required && (
          <span className="ml-1 text-red-500" aria-label="required">*</span>
        )}
        {optional && !required && (
          <span className="label-optional">(optional)</span>
        )}
      </label>

      {/* Children rendered directly — no cloneElement */}
      <div className="relative">
        {children}
      </div>

      {/* Messages */}
      <div className="mt-1.5 space-y-1">
        {hasError && (
          <p id={`${id}-error`} className="field-error flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </p>
        )}
        {hasSuccess && (
          <p id={`${id}-success`} className="text-xs text-emerald-600 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </p>
        )}
        {hint && (
          <p id={`${id}-hint`} className="field-hint">{hint}</p>
        )}
      </div>
    </div>
  );
}

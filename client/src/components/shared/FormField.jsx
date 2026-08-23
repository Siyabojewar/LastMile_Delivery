import React from 'react';

/**
 * Professional form field component with validation, help text, and consistent styling.
 * Wraps inputs with proper labels, validation states, and accessibility features.
 *
 * Props:
 *   label        – field label (required)
 *   id           – input id (required for accessibility)
 *   error        – error message string
 *   success      – success message string
 *   hint         – help text shown below input
 *   required     – shows required indicator
 *   optional     – shows optional text
 *   children     – input element
 *   className    – additional wrapper classes
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
    <div className={`form-field ${className}`}>
      {/* Label */}
      <label htmlFor={id} className="label">
        {label}
        {required && (
          <span className="ml-1 text-error-500 dark:text-error-400" aria-label="required">
            *
          </span>
        )}
        {optional && !required && (
          <span className="label-optional">
            (optional)
          </span>
        )}
      </label>

      {/* Input with validation state */}
      <div className="relative">
        {React.cloneElement(children, {
          id,
          className: `${children.props.className || 'input'} ${
            hasError 
              ? 'input-error' 
              : hasSuccess 
                ? 'input-success' 
                : ''
          }`,
          'aria-invalid': hasError ? 'true' : 'false',
          'aria-describedby': [
            error && `${id}-error`,
            success && `${id}-success`, 
            hint && `${id}-hint`
          ].filter(Boolean).join(' ') || undefined,
        })}

        {/* Success icon */}
        {hasSuccess && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success-500 dark:text-success-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {/* Error icon */}
        {hasError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-error-500 dark:text-error-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        )}
      </div>

      {/* Validation messages and hints */}
      <div className="mt-2 space-y-1">
        {/* Error message */}
        {error && (
          <div id={`${id}-error`} className="field-error flex items-start gap-1.5">
            <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Success message */}
        {success && !error && (
          <div id={`${id}-success`} className="text-xs text-success-600 dark:text-success-400 leading-relaxed flex items-start gap-1.5">
            <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Hint text */}
        {hint && (
          <div id={`${id}-hint`} className="field-hint flex items-start gap-1.5">
            <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{hint}</span>
          </div>
        )}
      </div>
    </div>
  );
}
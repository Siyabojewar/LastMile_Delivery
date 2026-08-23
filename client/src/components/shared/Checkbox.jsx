import React from 'react';

/**
 * Professional checkbox component with consistent styling and accessibility.
 * 
 * Props:
 *   id          – checkbox id (required for accessibility)
 *   label       – checkbox label text
 *   checked     – controlled checked state
 *   onChange    – change handler
 *   disabled    – disabled state
 *   error       – error state styling
 *   size        – 'sm' | 'md' | 'lg'
 *   className   – additional wrapper classes
 *   ...props    – passed to input element
 */
export default function Checkbox({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  error = false,
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const labelSizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`
            ${sizeClasses[size]} rounded border-2 transition-all duration-200
            text-brand-600 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
            focus:ring-offset-surface-primary dark:focus:ring-offset-surface-dark-primary
            ${error
              ? 'border-error-400 dark:border-error-500 focus:ring-error-500'
              : 'border-border-light dark:border-border-dark hover:border-border-light-strong dark:hover:border-border-dark-strong'
            }
            ${disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'cursor-pointer'
            }
            bg-surface-primary dark:bg-surface-dark-secondary
          `}
          {...props}
        />
        
        {/* Custom checkmark for better visual consistency */}
        {checked && (
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none text-white`}>
            <svg 
              className={`${size === 'sm' ? 'w-2.5 h-2.5' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {(label || children) && (
        <div className="flex-1">
          <label 
            htmlFor={id} 
            className={`
              font-medium cursor-pointer select-none
              ${labelSizeClasses[size]}
              ${error 
                ? 'text-error-700 dark:text-error-300'
                : 'text-text-primary dark:text-text-dark-primary'
              }
              ${disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:text-text-primary dark:hover:text-text-dark-primary'
              }
            `}
          >
            {label}
          </label>
          {children && <div className="mt-1">{children}</div>}
        </div>
      )}
    </div>
  );
}
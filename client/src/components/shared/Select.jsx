import React from 'react';

/**
 * Professional select component with consistent styling and accessibility.
 * Matches the visual style of the input system.
 *
 * Props:
 *   options      – array of { value, label } objects or string array
 *   placeholder  – placeholder text for empty state
 *   error        – shows error state
 *   success      – shows success state
 *   disabled     – disabled state
 *   className    – additional classes
 *   ...props     – passed to select element
 */
export default function Select({
  options = [],
  placeholder,
  error = false,
  success = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const baseClasses = error 
    ? "input input-error" 
    : success 
      ? "input input-success" 
      : "input";

  // Normalize options to { value, label } format
  const normalizedOptions = options.map(option => 
    typeof option === 'string' 
      ? { value: option, label: option }
      : option
  );

  return (
    <div className="relative">
      <select
        className={`${baseClasses} pr-10 appearance-none cursor-pointer ${className}`}
        disabled={disabled}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        
        {/* Custom options */}
        {children}
        
        {/* Generated options from prop */}
        {normalizedOptions.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {/* Custom dropdown arrow */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none
                     text-gray-500">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
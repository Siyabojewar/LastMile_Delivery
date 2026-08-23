import React, { useState } from 'react';

export default function PasswordInput({
  id,
  placeholder = "••••••••",
  value,
  onChange,
  autoComplete,
  className = "",
  required = false,
  minLength,
  error = false,
  success = false,
  disabled = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const baseClasses = error 
    ? "input input-error" 
    : success 
      ? "input input-success" 
      : "input";

  return (
    <div className="relative">
      <input
        id={id}
        className={`${baseClasses} pr-12 ${className}`}
        type={showPassword ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
                   text-text-tertiary dark:text-text-dark-tertiary 
                   hover:text-text-secondary dark:hover:text-text-dark-secondary 
                   hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary
                   focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1
                   transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => setShowPassword(!showPassword)}
        disabled={disabled}
        tabIndex={-1}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          // Eye-off icon (password hidden)
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" 
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          </svg>
        ) : (
          // Eye icon (password visible)
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" 
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}
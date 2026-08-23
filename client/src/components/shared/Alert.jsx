import React from 'react';

const ALERT_STYLES = {
  error: { 
    wrap: 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-700 text-error-700 dark:text-error-300',
    icon: '⚠', 
    iconCls: 'text-error-600 dark:text-error-400' 
  },
  success: { 
    wrap: 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-700 text-success-700 dark:text-success-300',
    icon: '✓', 
    iconCls: 'text-success-600 dark:text-success-400' 
  },
  info: { 
    wrap: 'bg-info-50 dark:bg-info-900/20 border-info-200 dark:border-info-700 text-info-700 dark:text-info-300',
    icon: 'ℹ', 
    iconCls: 'text-info-600 dark:text-info-400' 
  },
  warning: { 
    wrap: 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-700 text-warning-700 dark:text-warning-300',
    icon: '⚠', 
    iconCls: 'text-warning-600 dark:text-warning-400' 
  },
};

export default function Alert({ 
  type = 'error', 
  message, 
  className = '',
  title,
  dismissible = false,
  onDismiss,
  size = 'md'
}) {
  if (!message) return null;
  
  const style = ALERT_STYLES[type] || ALERT_STYLES.error;
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-4 text-base',
  };

  return (
    <div className={`
      flex items-start gap-3 rounded-xl border shadow-card-sm transition-all duration-200
      ${style.wrap} ${sizeClasses[size]} ${className}
    `}>
      <span className={`
        shrink-0 font-bold text-lg leading-none
        ${style.iconCls}
        ${size === 'sm' ? 'text-base mt-0' : size === 'lg' ? 'text-xl mt-0.5' : 'text-lg mt-px'}
      `}>
        {style.icon}
      </span>
      
      <div className="flex-1 min-w-0">
        {title && (
          <div className={`font-semibold mb-1 ${
            size === 'lg' ? 'text-lg' : 'text-sm'
          }`}>
            {title}
          </div>
        )}
        <div className={`leading-relaxed ${
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
        }`}>
          {message}
        </div>
      </div>
      
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={`
            shrink-0 p-1 rounded-lg transition-colors duration-200
            hover:bg-black/5 dark:hover:bg-white/5
            focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-1
            ${style.iconCls}
          `}
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

import React from 'react';

/**
 * Professional form section component for grouping related form fields.
 * Features step indicators, icons, and consistent visual hierarchy.
 *
 * Props:
 *   title    – section heading (required)
 *   icon     – emoji shown beside title
 *   step     – optional step number (shown as branded circle)
 *   description – optional subtitle text
 *   children – form fields
 */
export default function FormSection({ title, icon, step, description, children }) {
  return (
    <div className="relative p-6 bg-surface-primary dark:bg-surface-dark-primary rounded-2xl 
                   border border-border-light dark:border-border-dark shadow-card-sm
                   transition-all duration-200 hover:shadow-card-md">
      
      {/* Left accent stripe for visual hierarchy */}
      <div className="absolute left-0 top-6 bottom-6 w-1 bg-gradient-to-b from-brand-500 to-brand-300 
                     rounded-r-full opacity-60" />

      {/* Section Header */}
      <div className="flex items-start gap-3 mb-6 pl-4">
        {/* Step indicator */}
        {step != null && (
          <div className="shrink-0 w-8 h-8 rounded-xl bg-brand-600 dark:bg-brand-500 text-white 
                         flex items-center justify-center text-sm font-bold shadow-card-sm
                         ring-2 ring-brand-200 dark:ring-brand-800">
            {step}
          </div>
        )}

        {/* Icon */}
        {icon && !step && (
          <div className="shrink-0 w-8 h-8 rounded-xl bg-surface-secondary dark:bg-surface-dark-secondary 
                         flex items-center justify-center text-lg shadow-inner ring-1 
                         ring-border-light dark:ring-border-dark">
            {icon}
          </div>
        )}

        {/* Title and description */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {icon && step && (
              <span className="text-lg" aria-hidden="true">{icon}</span>
            )}
            <h3 className="text-lg font-bold text-text-primary dark:text-text-dark-primary">
              {title}
            </h3>
          </div>
          {description && (
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Form fields container */}
      <div className="space-y-5 pl-4">
        {children}
      </div>
    </div>
  );
}

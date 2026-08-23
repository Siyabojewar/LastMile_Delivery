import React from 'react';

/**
 * Professional key-value grid for displaying order information.
 * Features semantic color system, proper spacing, and dark mode support.
 *
 * Props:
 *   items – [{ label, value, bold?, span?, highlight?, icon? }]
 *   cols  – number of columns (default 2)
 */
export default function InfoGrid({ items, cols = 2 }) {
  const colClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[cols] || 'grid-cols-1 sm:grid-cols-2';

  return (
    <dl className={`grid ${colClass} gap-3`}>
      {items.filter(Boolean).map(({ label, value, bold, span, highlight, icon }) => (
        <div
          key={label}
          className={`
            rounded-xl px-4 py-3.5 border transition-all duration-200 hover:shadow-card-sm
            ${span === 2 ? 'sm:col-span-2' : ''}
            ${span === 3 ? 'lg:col-span-3' : ''}
            ${span === 4 ? 'lg:col-span-4' : ''}
            ${highlight
              ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-700 ring-1 ring-brand-100 dark:ring-brand-800'
              : 'bg-surface-secondary dark:bg-surface-dark-secondary border-border-light dark:border-border-dark'
            }
          `}
        >
          <div className="flex items-center gap-2 mb-1.5">
            {icon && (
              <span className="text-base" aria-hidden="true">
                {icon}
              </span>
            )}
            <dt className="text-xs font-bold text-text-tertiary dark:text-text-dark-tertiary uppercase tracking-wider">
              {label}
            </dt>
          </div>
          <dd className={`leading-tight ${
            bold
              ? 'text-lg font-bold text-text-primary dark:text-text-dark-primary'
              : 'text-sm font-semibold text-text-secondary dark:text-text-dark-secondary'
          }`}>
            {value ?? <span className="text-text-tertiary dark:text-text-dark-tertiary font-normal italic">—</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

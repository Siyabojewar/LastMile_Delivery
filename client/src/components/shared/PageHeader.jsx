import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Consistent page header used at the top of every page.
 *
 * Props:
 *   title       – main heading (required)
 *   description – one-line subtitle explaining the page's purpose
 *   action      – { label, href } | { label, onClick, variant? }
 *   back        – boolean: show a ← Back button that calls navigate(-1)
 *   backLabel   – override default "Back" label
 *   icon        – emoji shown in a pill left of the title
 *   children    – extra elements rendered next to the action button
 */
export default function PageHeader({ title, description, action, back, backLabel = 'Back', icon, children }) {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium mb-4 group"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {backLabel}
        </button>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center text-lg shrink-0 select-none">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h1>
            {description && (
              <p className="mt-0.5 text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>

        {(action || children) && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {children}
            {action && (
              action.href
                ? <Link to={action.href} className={variantClass(action.variant)}>{action.label}</Link>
                : <button onClick={action.onClick} className={variantClass(action.variant)}>{action.label}</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function variantClass(variant) {
  if (variant === 'danger')    return 'btn-danger';
  if (variant === 'secondary') return 'btn-secondary';
  return 'btn-primary';
}

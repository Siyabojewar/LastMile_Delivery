import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

/**
 * Consistent page header with optional breadcrumb trail.
 *
 * Props:
 *   title        – main heading (required)
 *   description  – one-line subtitle
 *   action       – { label, href } | { label, onClick, variant? }
 *   back         – boolean: show ← back button
 *   backLabel    – label for the back button (default "Back")
 *   backHref     – if set, navigates to this path instead of navigate(-1)
 *   breadcrumbs  – [{ label, href }] — renders a breadcrumb trail above the title
 *   icon         – emoji shown in a round pill
 *   children     – extra elements rendered beside the action button
 */
export default function PageHeader({
  title, description, action, back, backLabel = 'Back', backHref,
  breadcrumbs, icon, children,
}) {
  const navigate = useNavigate();

  function handleBack() {
    if (backHref) navigate(backHref);
    else navigate(-1);
  }

  return (
    <div className="mb-8">
      {/* ── Breadcrumb trail ─────────────────────────────────────────────── */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.label}>
              {i > 0 && (
                <svg className="w-3 h-3 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
              {crumb.href && i < breadcrumbs.length - 1 ? (
                <Link
                  to={crumb.href}
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className={i === breadcrumbs.length - 1 
                  ? 'font-semibold text-gray-900 truncate max-w-[200px]' 
                  : 'text-gray-600'
                }>
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* ── Back button (when no breadcrumbs) ────────────────────────────── */}
      {back && !breadcrumbs && (
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600
                     hover:text-blue-700 hover:bg-blue-50
                     px-3 py-2 rounded-xl mb-4 group transition-all duration-200 ring-1 ring-transparent
                     hover:ring-blue-200"
        >
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {backLabel}
        </button>
      )}

      {/* ── Title row ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 
                            flex items-center justify-center text-2xl shrink-0 select-none shadow-sm
                            ring-1 ring-blue-200">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="page-title truncate">{title}</h1>
            {description && (
              <p className="page-subtitle">{description}</p>
            )}
          </div>
        </div>

        {(action || children) && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {children}
            {action && (
              action.href
                ? <Link to={action.href} className={cls(action.variant)}>{action.label}</Link>
                : <button onClick={action.onClick} className={cls(action.variant)}>{action.label}</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function cls(variant) {
  if (variant === 'danger')    return 'btn-danger';
  if (variant === 'secondary') return 'btn-secondary';
  return 'btn-primary';
}

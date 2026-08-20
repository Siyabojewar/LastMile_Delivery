import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Empty state — always shows a prominent CTA when action is provided.
 *
 * Props:
 *   icon        – large emoji
 *   title       – short heading
 *   description – helpful guidance
 *   action      – { label, href } | { label, onClick }
 *   compact     – smaller padding for use inside cards
 */
export default function EmptyState({ icon = '📭', title, description, action, compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center
      ${compact ? 'py-10 px-4' : 'py-16 px-6'}`}>
      {/* Icon in a tinted circle */}
      <div className="w-20 h-20 rounded-3xl bg-surface-100 flex items-center justify-center
                      text-4xl mb-5 shadow-card ring-1 ring-surface-200 select-none">
        {icon}
      </div>

      {title && (
        <h3 className="text-base font-bold text-gray-800 mb-1.5">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">{description}</p>
      )}

      {action && (
        <div className="animate-scale-in">
          {action.href ? (
            <Link
              to={action.href}
              className="btn-primary btn-lg shadow-card-md hover:shadow-card-lg"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="btn-primary btn-lg shadow-card-md hover:shadow-card-lg"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

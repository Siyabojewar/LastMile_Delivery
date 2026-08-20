import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Empty state for lists/tables with no data.
 *
 * Props:
 *   icon        – large emoji/icon
 *   title       – short heading
 *   description – helpful guidance on what to do next
 *   action      – { label, href } | { label, onClick }
 */
export default function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-5xl mb-4 select-none">{icon}</div>
      {title && <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>}
      {description && <p className="text-sm text-gray-500 max-w-xs">{description}</p>}
      {action && (
        <div className="mt-5">
          {action.href
            ? <Link to={action.href} className="btn-primary">{action.label}</Link>
            : <button onClick={action.onClick} className="btn-primary">{action.label}</button>
          }
        </div>
      )}
    </div>
  );
}

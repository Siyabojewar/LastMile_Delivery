import React from 'react';

/**
 * Compact key-value grid used in order detail panels.
 *
 * Props:
 *   items – [{ label, value, bold?, span? }]
 *   cols  – number of columns (default 2)
 */
export default function InfoGrid({ items, cols = 2 }) {
  const colClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }[cols] || 'grid-cols-2';

  return (
    <dl className={`grid ${colClass} gap-x-6 gap-y-4`}>
      {items.filter(Boolean).map(({ label, value, bold, span }) => (
        <div key={label} className={span === 2 ? 'col-span-2' : ''}>
          <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</dt>
          <dd className={`text-sm ${bold ? 'font-bold text-gray-900 text-base' : 'font-medium text-gray-700'}`}>
            {value ?? <span className="text-gray-300">—</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

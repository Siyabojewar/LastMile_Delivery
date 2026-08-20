import React from 'react';

/**
 * Compact key-value grid used in order detail panels.
 * Each cell has a subtle tinted background for visual rhythm.
 *
 * Props:
 *   items – [{ label, value, bold?, span?, highlight? }]
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
    <dl className={`grid ${colClass} gap-3`}>
      {items.filter(Boolean).map(({ label, value, bold, span, highlight }) => (
        <div
          key={label}
          className={`rounded-xl px-3.5 py-3 border
            ${span === 2 ? 'col-span-2' : ''}
            ${highlight
              ? 'bg-brand-50 border-brand-100'
              : 'bg-surface-50 border-surface-200'
            }`}
        >
          <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            {label}
          </dt>
          <dd className={`leading-snug ${
            bold
              ? 'text-lg font-extrabold text-gray-900'
              : 'text-sm font-semibold text-gray-700'
          }`}>
            {value ?? <span className="text-gray-300 font-normal">—</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

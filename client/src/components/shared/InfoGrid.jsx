import React from 'react';

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
          className={`rounded-xl px-4 py-3.5 border transition-all duration-200
            ${span === 2 ? 'sm:col-span-2' : ''}
            ${span === 3 ? 'lg:col-span-3' : ''}
            ${span === 4 ? 'lg:col-span-4' : ''}
            ${highlight
              ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100'
              : 'bg-gray-50 border-gray-200'
            }
          `}
        >
          <div className="flex items-center gap-2 mb-1.5">
            {icon && <span className="text-base">{icon}</span>}
            <dt className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</dt>
          </div>
          <dd className={`leading-tight ${bold ? 'text-lg font-bold text-gray-900' : 'text-sm font-semibold text-gray-700'}`}>
            {value ?? <span className="text-gray-400 font-normal italic">—</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

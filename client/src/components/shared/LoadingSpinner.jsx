import React from 'react';

export default function LoadingSpinner({ message = 'Loading…', fullPage = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 py-16 animate-fade-in">
      <div className="relative w-14 h-14">
        {/* Track ring */}
        <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-blue-100" />
        {/* Spinning ring */}
        <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-blue-600
                        border-t-transparent animate-spin" />
        {/* Inner dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-400 tracking-wide">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center
                      justify-center z-50">
        {content}
      </div>
    );
  }
  return content;
}

export function InlineSpinner({ className = 'w-4 h-4' }) {
  return (
    <span
      className={`inline-block rounded-full border-2 border-current border-t-transparent animate-spin ${className}`}
      aria-hidden="true"
    />
  );
}

export function Skeleton({ className = 'h-4 w-full' }) {
  return (
    <div className={`rounded-xl bg-gray-200 animate-pulse ${className}`} />
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="table-container animate-pulse">
      <table className="table">
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className={`border-b border-gray-100 last:border-0 ${r % 2 === 1 ? 'bg-surface-50/60' : ''}`}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="table-td">
                  <div className={`h-3.5 rounded-lg bg-gray-200 ${c === 0 ? 'w-20' : c === cols - 1 ? 'w-16' : 'w-full'}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

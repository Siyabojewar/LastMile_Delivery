import React from 'react';

export default function LoadingSpinner({ message = 'Loading…', fullPage = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-brand-100" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-gray-400 font-medium">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

/** Inline spinner for use inside buttons or small spaces */
export function InlineSpinner({ className = 'w-4 h-4' }) {
  return (
    <span
      className={`inline-block rounded-full border-2 border-current border-t-transparent animate-spin ${className}`}
      aria-hidden="true"
    />
  );
}

/** Skeleton shimmer block */
export function Skeleton({ className = 'h-4 w-full' }) {
  return (
    <div className={`rounded-lg bg-gray-200 animate-pulse ${className}`} />
  );
}

/** Table skeleton — n rows of placeholder cells */
export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="table-container">
      <table className="table">
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b border-gray-100 last:border-0">
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="table-td">
                  <Skeleton className={`h-4 ${c === 0 ? 'w-20' : 'w-full'}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

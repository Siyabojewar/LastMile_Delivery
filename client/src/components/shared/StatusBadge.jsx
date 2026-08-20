import React from 'react';
import { STATUS_COLORS, STATUS_LABELS, STATUS_DOT_COLORS } from '../../utils/statusColors';

export default function StatusBadge({ status, size = 'md' }) {
  const color = STATUS_COLORS[status] || 'bg-gray-100 text-gray-600';
  const dot   = STATUS_DOT_COLORS[status] || 'bg-gray-400';
  const label = STATUS_LABELS[status] || status;

  return (
    <span className={`badge ${color} ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : ''}`}>
      <span className={`badge-dot ${dot}`} />
      {label}
    </span>
  );
}

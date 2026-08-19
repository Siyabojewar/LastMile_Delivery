import React from 'react';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/statusColors';

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

import React from 'react';
import { STATUS_COLORS, STATUS_LABELS, STATUS_DOT_COLORS, STATUS_ICONS } from '../../utils/statusColors';

export default function StatusBadge({ status, size = 'md', showIcon = true, showDot = true }) {
  const colors = STATUS_COLORS[status] || 'bg-neutral-100 text-neutral-600 ring-neutral-200';
  const dotColor = STATUS_DOT_COLORS[status] || 'bg-neutral-400';
  const label = STATUS_LABELS[status] || status;
  const icon = STATUS_ICONS[status];

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5',
  };

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const iconSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full ring-1 ring-inset transition-all duration-200
      ${colors} ${sizeClasses[size]}
    `}>
      {showDot && (
        <span 
          className={`${dotColor} ${dotSizeClasses[size]} rounded-full ring-1 ring-white shadow-sm`}
          aria-hidden="true"
        />
      )}
      {showIcon && icon && (
        <span className={iconSizeClasses[size]} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="font-semibold">
        {label}
      </span>
    </span>
  );
}

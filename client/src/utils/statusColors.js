// Professional semantic status colors with dark mode support
export const STATUS_COLORS = {
  Created:        'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 ring-neutral-200 dark:ring-neutral-600',
  PickedUp:       'bg-info-50 dark:bg-info-900/20 text-info-700 dark:text-info-300 ring-info-200 dark:ring-info-700',
  InTransit:      'bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 ring-warning-200 dark:ring-warning-700',
  OutForDelivery: 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 ring-brand-200 dark:ring-brand-700',
  Delivered:      'bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300 ring-success-200 dark:ring-success-700',
  Failed:         'bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300 ring-error-200 dark:ring-error-700',
  Rescheduled:    'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 ring-purple-200 dark:ring-purple-700',
};

export const STATUS_DOT_COLORS = {
  Created:        'bg-neutral-400 dark:bg-neutral-500',
  PickedUp:       'bg-info-500 dark:bg-info-400',
  InTransit:      'bg-warning-500 dark:bg-warning-400',
  OutForDelivery: 'bg-brand-500 dark:bg-brand-400',
  Delivered:      'bg-success-500 dark:bg-success-400',
  Failed:         'bg-error-500 dark:bg-error-400',
  Rescheduled:    'bg-purple-500 dark:bg-purple-400',
};

export const STATUS_LABELS = {
  Created:        'Created',
  PickedUp:       'Picked Up',
  InTransit:      'In Transit',
  OutForDelivery: 'Out for Delivery',
  Delivered:      'Delivered',
  Failed:         'Failed',
  Rescheduled:    'Rescheduled',
};

export const STATUS_ICONS = {
  Created:        '📋',
  PickedUp:       '📦',
  InTransit:      '🚛',
  OutForDelivery: '🚴',
  Delivered:      '✅',
  Failed:         '❌',
  Rescheduled:    '🔄',
};

export const STATUS_DESCRIPTIONS = {
  Created:        'Order has been placed and is awaiting pickup',
  PickedUp:       'Package has been collected from the sender',
  InTransit:      'Package is on the way to destination',
  OutForDelivery: 'Package is out for delivery today',
  Delivered:      'Package successfully delivered to recipient',
  Failed:         'Delivery attempt was unsuccessful',
  Rescheduled:    'Delivery has been rescheduled for a new date',
};

/** Ordered lifecycle for the progress stepper */
export const STATUS_ORDER = [
  'Created',
  'PickedUp',
  'InTransit',
  'OutForDelivery',
  'Delivered',
];

/** Status categories for better organization */
export const STATUS_CATEGORIES = {
  active: ['Created', 'PickedUp', 'InTransit', 'OutForDelivery', 'Rescheduled'],
  terminal: ['Delivered', 'Failed'],
  positive: ['Created', 'PickedUp', 'InTransit', 'OutForDelivery', 'Delivered'],
  negative: ['Failed'],
  neutral: ['Rescheduled'],
};

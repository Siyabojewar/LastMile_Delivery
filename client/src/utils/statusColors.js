export const STATUS_COLORS = {
  Created:        'bg-gray-100 text-gray-700',
  PickedUp:       'bg-blue-100 text-blue-700',
  InTransit:      'bg-yellow-100 text-yellow-800',
  OutForDelivery: 'bg-orange-100 text-orange-700',
  Delivered:      'bg-emerald-100 text-emerald-700',
  Failed:         'bg-red-100 text-red-700',
  Rescheduled:    'bg-purple-100 text-purple-700',
};

export const STATUS_DOT_COLORS = {
  Created:        'bg-gray-400',
  PickedUp:       'bg-blue-500',
  InTransit:      'bg-yellow-500',
  OutForDelivery: 'bg-orange-500',
  Delivered:      'bg-emerald-500',
  Failed:         'bg-red-500',
  Rescheduled:    'bg-purple-500',
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

/** Ordered lifecycle for the progress stepper */
export const STATUS_ORDER = [
  'Created',
  'PickedUp',
  'InTransit',
  'OutForDelivery',
  'Delivered',
];

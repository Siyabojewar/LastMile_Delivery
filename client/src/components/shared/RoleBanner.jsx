import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ROLE_CONFIG = {
  admin: {
    label: 'Admin Dashboard',
    description: 'You are signed in as an Administrator',
    bg: 'bg-purple-600',
    icon: '🛡️',
  },
  agent: {
    label: 'Agent Dashboard',
    description: 'You are signed in as a Delivery Agent',
    bg: 'bg-amber-500',
    icon: '🚴‍♂️',
  },
  customer: {
    label: 'Customer Dashboard',
    description: 'You are signed in as a Customer',
    bg: 'bg-emerald-600',
    icon: '📦',
  },
};

/**
 * Shows a clearly visible banner at the top of each role dashboard
 * so it's always obvious which role is currently active.
 */
export default function RoleBanner() {
  const { user } = useAuth();
  if (!user) return null;

  const config = ROLE_CONFIG[user.role];
  if (!config) return null;

  return (
    <div className={`${config.bg} text-white px-4 py-2.5 flex items-center gap-3 mb-6 rounded-xl shadow-sm`}>
      <span className="text-xl">{config.icon}</span>
      <div>
        <span className="font-bold text-sm">{config.label}</span>
        <span className="text-white/80 text-xs ml-2">— signed in as <strong>{user.name}</strong></span>
      </div>
    </div>
  );
}

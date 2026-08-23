import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { STATUS_CATEGORIES, STATUS_ICONS } from '../../utils/statusColors';

/**
 * Professional order card component with role-based customization
 * Used across admin, agent, and customer order listings
 */
export default function OrderCard({ 
  order, 
  role = 'customer', 
  muted = false,
  showActions = false,
  onAction,
  actionLoading
}) {
  const isTerminal = STATUS_CATEGORIES.terminal.includes(order.status);
  const isCOD = order.paymentType === 'COD';
  const statusIcon = STATUS_ICONS[order.status] || '📦';
  
  // Role-specific link destinations
  const linkPath = {
    customer: `/customer/orders/${order.id}`,
    agent: `/agent/orders/${order.id}`,
    admin: `/admin/orders/${order.id}`
  }[role];

  // Status-based styling
  const statusColorClasses = isTerminal && muted
    ? 'opacity-75'
    : '';

  return (
    <Link
      to={linkPath}
      className={`
        group block p-4 rounded-2xl border transition-all duration-200
        hover:shadow-card-md hover:-translate-y-0.5 hover:border-border-light-strong dark:hover:border-border-dark-strong
        bg-surface-primary dark:bg-surface-dark-primary
        border-border-light dark:border-border-dark
        shadow-card-sm
        ${statusColorClasses}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Status Icon */}
        <div className={`
          shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-card-sm
          ring-1 ring-border-light dark:ring-border-dark transition-all duration-200
          ${isTerminal 
            ? order.status === 'Delivered' 
              ? 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400'
              : 'bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400'
            : 'bg-surface-secondary dark:bg-surface-dark-secondary text-text-secondary dark:text-text-dark-secondary'
          }
          group-hover:scale-105
        `}>
          {statusIcon}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-mono text-xs font-bold text-text-tertiary dark:text-text-dark-tertiary uppercase tracking-wider">
                  #{order.id.slice(-8)}
                </p>
                {role === 'admin' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
                    Admin
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-text-primary dark:text-text-dark-primary text-base leading-tight">
                {role === 'customer' 
                  ? `${order.pickupAddress?.split(',')[0]} → ${order.dropAddress?.split(',')[0]}`
                  : order.customer?.name || 'Unknown Customer'
                }
              </h3>
            </div>
            <StatusBadge status={order.status} size="sm" />
          </div>

          {/* Route Information */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-4 h-4 rounded-lg bg-info-100 dark:bg-info-900/30 flex items-center justify-center text-xs">
                📍
              </span>
              <span className="text-text-secondary dark:text-text-dark-secondary truncate">
                {order.pickupAddress}
              </span>
              <span className="font-mono text-xs text-text-tertiary dark:text-text-dark-tertiary">
                {order.pickupPincode}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-4 h-4 rounded-lg bg-success-100 dark:bg-success-900/30 flex items-center justify-center text-xs">
                🏁
              </span>
              <span className="text-text-primary dark:text-text-dark-primary font-medium truncate">
                {order.dropAddress}
              </span>
              <span className="font-mono text-xs text-text-tertiary dark:text-text-dark-tertiary">
                {order.dropPincode}
              </span>
            </div>
          </div>

          {/* Tags Row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* Order Type */}
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full 
                           bg-surface-secondary dark:bg-surface-dark-secondary 
                           text-text-secondary dark:text-text-dark-secondary 
                           ring-1 ring-border-light dark:ring-border-dark">
              {order.orderType}
            </span>

            {/* Payment Type */}
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${
              isCOD
                ? 'bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 ring-warning-200 dark:ring-warning-700'
                : 'bg-info-50 dark:bg-info-900/20 text-info-700 dark:text-info-300 ring-info-200 dark:ring-info-700'
            }`}>
              {isCOD ? '💵' : '💳'} {order.paymentType}
            </span>

            {/* Total Charge */}
            <span className="text-sm font-bold text-text-primary dark:text-text-dark-primary">
              ₹{Number(order.totalCharge).toFixed(2)}
            </span>

            {/* Weight */}
            <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary">
              {order.chargeableWeightKg} kg
            </span>
          </div>

          {/* COD Collection Alert for Agents */}
          {isCOD && role === 'agent' && !isTerminal && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-warning-50 dark:bg-warning-900/20 
                           border border-warning-200 dark:border-warning-700 rounded-xl">
              <span className="text-warning-600 dark:text-warning-400 text-sm font-bold">💵</span>
              <span className="text-sm font-medium text-warning-700 dark:text-warning-300">
                Collect ₹{Number(order.totalCharge).toFixed(2)} cash
              </span>
            </div>
          )}

          {/* Agent Assignment for Admin */}
          {role === 'admin' && (
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary">Agent:</span>
                {order.assignedAgent ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-warning-100 dark:bg-warning-900/30 
                                   text-warning-700 dark:text-warning-300 flex items-center justify-center 
                                   text-xs font-bold">
                      {order.assignedAgent.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">
                      {order.assignedAgent.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary italic">
                    Unassigned
                  </span>
                )}
              </div>
              {showActions && !order.assignedAgentId && onAction && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAction(order.id);
                  }}
                  disabled={actionLoading === order.id}
                  className="text-xs font-semibold text-success-600 dark:text-success-400 
                           hover:text-success-700 dark:hover:text-success-300 
                           hover:underline disabled:opacity-50 transition-colors"
                >
                  {actionLoading === order.id ? 'Assigning...' : '⚡ Auto-assign'}
                </button>
              )}
            </div>
          )}

          {/* Date */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary">
              {isTerminal ? 'Completed' : 'Created'} {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
            
            {/* Arrow indicator */}
            <svg 
              className="w-4 h-4 text-text-tertiary dark:text-text-dark-tertiary 
                        group-hover:text-brand-600 dark:group-hover:text-brand-400 
                        transition-all duration-200 group-hover:translate-x-0.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
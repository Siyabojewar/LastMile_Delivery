import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import Alert from '../../components/shared/Alert';
import { TableSkeleton } from '../../components/shared/LoadingSpinner';

const TERMINAL = new Set(['Delivered', 'Failed']);

function groupOrders(orders) {
  return {
    active:   orders.filter(o => !TERMINAL.has(o.status)),
    terminal: orders.filter(o =>  TERMINAL.has(o.status)),
  };
}

export default function AgentOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/orders/assigned')
      .then(setOrders)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const { active, terminal } = groupOrders(orders);

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        icon="🚴"
        title="Assigned Orders"
        description="Your active deliveries. Tap any order to update its status."
      />

      <Alert message={error} className="mb-5" />

      {loading ? (
        <TableSkeleton rows={3} cols={1} />
      ) : orders.length === 0 && !error ? (
        <EmptyState
          icon="📭"
          title="No orders assigned yet"
          description="Your assigned deliveries will appear here once an admin assigns an order to you."
        />
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <section>
              <p className="section-title">
                <span>⚡</span> Active
                <span className="ml-2 normal-case font-normal text-gray-300">({active.length})</span>
              </p>
              <div className="space-y-3">
                {active.map(o => <AgentOrderCard key={o.id} order={o} />)}
              </div>
            </section>
          )}

          {terminal.length > 0 && (
            <section>
              <p className="section-title">
                <span>🏁</span> Completed / Failed
                <span className="ml-2 normal-case font-normal text-gray-300">({terminal.length})</span>
              </p>
              <div className="space-y-3 opacity-75">
                {terminal.map(o => <AgentOrderCard key={o.id} order={o} muted />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function AgentOrderCard({ order, muted }) {
  const isCOD       = order.paymentType === 'COD';
  const isDelivered = order.status === 'Delivered';
  const isFailed    = order.status === 'Failed';

  const iconMeta = isDelivered
    ? { bg: 'bg-emerald-100 ring-emerald-200', emoji: '✅' }
    : isFailed
      ? { bg: 'bg-red-100 ring-red-200', emoji: '❌' }
      : { bg: 'bg-amber-100 ring-amber-200', emoji: '🚚' };

  return (
    <Link
      to={`/agent/orders/${order.id}`}
      className={`card-hover flex flex-col sm:flex-row sm:items-center gap-4 group ${muted ? 'opacity-80' : ''}`}
    >
      {/* Icon */}
      <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center
                       text-xl select-none ring-1 shadow-card ${iconMeta.bg}`}>
        {iconMeta.emoji}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">
              #{order.id.slice(-8)}
            </p>
            <p className="font-bold text-gray-900 truncate mt-0.5 text-[15px]">
              {order.customer?.name}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Addresses */}
        <div className="mt-2.5 space-y-1 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center text-xs shrink-0">📍</div>
            <span className="truncate">{order.pickupAddress}
              <span className="text-gray-400 ml-1 font-mono text-xs">({order.pickupPincode})</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <div className="w-5 h-5 rounded-lg bg-emerald-50 flex items-center justify-center text-xs shrink-0">🏁</div>
            <span className="truncate">{order.dropAddress}
              <span className="text-gray-400 font-normal ml-1 font-mono text-xs">({order.dropPincode})</span>
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          <span className="text-xs bg-surface-100 text-gray-600 rounded-full px-2.5 py-0.5
                           font-semibold ring-1 ring-surface-200">
            {order.orderType}
          </span>
          {isCOD ? (
            <span className="text-xs bg-orange-100 text-orange-700 rounded-full px-2.5 py-0.5
                             font-bold ring-1 ring-orange-200">
              💵 COD — collect ₹{Number(order.totalCharge).toFixed(2)}
            </span>
          ) : (
            <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2.5 py-0.5
                             font-semibold ring-1 ring-blue-200">
              Prepaid
            </span>
          )}
          <span className="text-xs text-gray-500 font-medium">{order.chargeableWeightKg} kg</span>
          {order.scheduledDate && (
            <span className="text-xs bg-purple-100 text-purple-700 rounded-full px-2.5 py-0.5
                             font-semibold ring-1 ring-purple-200">
              📅 {new Date(order.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <svg className="w-5 h-5 text-gray-300 group-hover:text-brand-500 transition-colors shrink-0 hidden sm:block"
           fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

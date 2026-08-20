import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import Alert from '../../components/shared/Alert';
import { TableSkeleton } from '../../components/shared/LoadingSpinner';

/* Terminal statuses — these orders are done */
const TERMINAL = new Set(['Delivered', 'Failed']);

/* Group orders: active first, then terminal */
function groupOrders(orders) {
  const active   = orders.filter(o => !TERMINAL.has(o.status));
  const terminal = orders.filter(o =>  TERMINAL.has(o.status));
  return { active, terminal };
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
        description="Orders currently assigned to you. Tap an order to update its status."
      />

      <Alert message={error} />

      {loading ? (
        <TableSkeleton rows={4} cols={1} />
      ) : orders.length === 0 && !error ? (
        <EmptyState
          icon="📭"
          title="No orders assigned yet"
          description="Your assigned deliveries will appear here once an admin assigns an order to you."
        />
      ) : (
        <div className="space-y-6">
          {/* Active orders */}
          {active.length > 0 && (
            <section>
              <p className="section-title mb-3">
                Active ({active.length})
              </p>
              <div className="space-y-3">
                {active.map(o => <AgentOrderCard key={o.id} order={o} />)}
              </div>
            </section>
          )}

          {/* Completed / Failed */}
          {terminal.length > 0 && (
            <section>
              <p className="section-title mb-3">
                Completed / Failed ({terminal.length})
              </p>
              <div className="space-y-3">
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
  const isCOD      = order.paymentType === 'COD';
  const isFailed   = order.status === 'Failed';
  const isDelivered = order.status === 'Delivered';

  return (
    <Link
      to={`/agent/orders/${order.id}`}
      className={`card-hover flex flex-col sm:flex-row sm:items-center gap-4 group
        ${muted ? 'opacity-70' : ''}`}
    >
      {/* Icon */}
      <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl select-none
        ${isDelivered ? 'bg-emerald-100' : isFailed ? 'bg-red-100' : 'bg-amber-100'}`}>
        {isDelivered ? '✅' : isFailed ? '❌' : '🚚'}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <p className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">
              #{order.id.slice(-8)}
            </p>
            <p className="font-semibold text-gray-900 truncate mt-0.5">
              {order.customer?.name}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Addresses */}
        <div className="mt-2 space-y-1 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <span className="text-xs">📍</span>
            <span className="truncate">
              {order.pickupAddress}
              <span className="text-gray-400 ml-1">({order.pickupPincode})</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <span className="text-xs">🏁</span>
            <span className="truncate">
              {order.dropAddress}
              <span className="text-gray-400 font-normal ml-1">({order.dropPincode})</span>
            </span>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 font-medium">
            {order.orderType}
          </span>
          {isCOD && (
            <span className="text-xs bg-orange-100 text-orange-700 rounded-full px-2 py-0.5 font-semibold">
              COD — collect ₹{Number(order.totalCharge).toFixed(2)}
            </span>
          )}
          {!isCOD && (
            <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-medium">
              Prepaid
            </span>
          )}
          <span className="text-xs text-gray-500">
            {order.chargeableWeightKg} kg
          </span>
          {order.scheduledDate && (
            <span className="text-xs bg-purple-100 text-purple-700 rounded-full px-2 py-0.5 font-medium">
              📅 {new Date(order.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <svg
        className="w-5 h-5 text-gray-300 group-hover:text-brand-400 transition-colors shrink-0 hidden sm:block"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

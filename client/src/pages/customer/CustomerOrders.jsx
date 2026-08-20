import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import Alert from '../../components/shared/Alert';
import { TableSkeleton } from '../../components/shared/LoadingSpinner';

const STATUS_ICON = {
  Created:        { bg: 'bg-gray-100',    emoji: '📋' },
  PickedUp:       { bg: 'bg-blue-100',    emoji: '📦' },
  InTransit:      { bg: 'bg-yellow-100',  emoji: '🚛' },
  OutForDelivery: { bg: 'bg-orange-100',  emoji: '🚴' },
  Delivered:      { bg: 'bg-emerald-100', emoji: '✅' },
  Failed:         { bg: 'bg-red-100',     emoji: '❌' },
  Rescheduled:    { bg: 'bg-purple-100',  emoji: '🔄' },
};

export default function CustomerOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/orders/mine')
      .then(setOrders)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Split into active vs completed for visual grouping
  const active    = orders.filter(o => !['Delivered', 'Failed'].includes(o.status));
  const completed = orders.filter(o =>  ['Delivered', 'Failed'].includes(o.status));

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        icon="📋"
        title="My Orders"
        description="All shipments you've placed. Tap any order to see live tracking."
        action={{ label: '+ New Order', href: '/customer/new-order' }}
      />

      <Alert message={error} className="mb-5" />

      {loading ? (
        <TableSkeleton rows={3} cols={1} />
      ) : orders.length === 0 && !error ? (
        <EmptyState
          icon="📭"
          title="No orders yet"
          description="You haven't placed any orders. Get an instant quote and ship your first package in minutes."
          action={{ label: '📦 Place your first order', href: '/customer/new-order' }}
        />
      ) : (
        <div className="space-y-8">
          {/* Active orders */}
          {active.length > 0 && (
            <section>
              <p className="section-title">
                <span>🚚</span> In Progress
                <span className="ml-2 normal-case font-normal text-gray-300">({active.length})</span>
              </p>
              <div className="space-y-3">
                {active.map(order => <OrderCard key={order.id} order={order} />)}
              </div>
            </section>
          )}

          {/* Completed / failed */}
          {completed.length > 0 && (
            <section>
              <p className="section-title">
                <span>🏁</span> Completed
                <span className="ml-2 normal-case font-normal text-gray-300">({completed.length})</span>
              </p>
              <div className="space-y-3 opacity-85">
                {completed.map(order => <OrderCard key={order.id} order={order} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }) {
  const meta = STATUS_ICON[order.status] || { bg: 'bg-gray-100', emoji: '📦' };

  return (
    <Link
      to={`/customer/orders/${order.id}`}
      className="card-hover flex flex-col sm:flex-row sm:items-center gap-4 group"
    >
      {/* Status icon */}
      <div className={`shrink-0 w-12 h-12 rounded-2xl ${meta.bg} flex items-center justify-center
                       text-xl select-none ring-1 ring-black/5 shadow-card`}>
        {meta.emoji}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">
          #{order.id.slice(-8)}
        </p>
        <p className="font-bold text-gray-900 truncate text-[15px]">{order.pickupAddress}</p>
        <p className="text-sm text-gray-500 truncate flex items-center gap-1 mt-0.5">
          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {order.dropAddress}
        </p>

        {/* Tag row */}
        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          <span className="text-xs bg-surface-100 text-gray-600 rounded-full px-2.5 py-0.5
                           font-semibold ring-1 ring-surface-200">
            {order.orderType}
          </span>
          <span className={`text-xs rounded-full px-2.5 py-0.5 font-semibold ring-1 ${
            order.paymentType === 'COD'
              ? 'bg-orange-100 text-orange-700 ring-orange-200'
              : 'bg-blue-100 text-blue-700 ring-blue-200'
          }`}>
            {order.paymentType}
          </span>
          <span className="text-xs font-bold text-gray-800">
            ₹{Number(order.totalCharge).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Right: status + date + chevron */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start
                      gap-2 shrink-0">
        <StatusBadge status={order.status} />
        <p className="text-xs text-gray-400">
          {new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </p>
        <svg
          className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors hidden sm:block"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import Alert from '../../components/shared/Alert';
import { TableSkeleton } from '../../components/shared/LoadingSpinner';

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/orders/mine')
      .then(setOrders)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        icon="📋"
        title="My Orders"
        description="All shipments you have placed. Click any order to see live tracking."
        action={{ label: '+ New Order', href: '/customer/new-order' }}
      />

      <Alert message={error} />

      {loading ? (
        <TableSkeleton rows={4} cols={1} />
      ) : orders.length === 0 && !error ? (
        <EmptyState
          icon="📭"
          title="No orders yet"
          description="You haven't placed any orders. Start by getting a free instant quote."
          action={{ label: 'Place your first order', href: '/customer/new-order' }}
        />
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }) {
  const isTerminal  = order.status === 'Delivered';
  const isFailed    = order.status === 'Failed';

  return (
    <Link
      to={`/customer/orders/${order.id}`}
      className="card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
    >
      {/* Left: route + meta */}
      <div className="flex items-start gap-3 min-w-0">
        {/* Status dot column */}
        <div className="shrink-0 mt-1">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base select-none
            ${isTerminal ? 'bg-emerald-100' : isFailed ? 'bg-red-100' : 'bg-brand-50'}`}>
            {isTerminal ? '✅' : isFailed ? '❌' : '🚚'}
          </div>
        </div>

        <div className="min-w-0">
          {/* Order ID */}
          <p className="font-mono text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
            #{order.id.slice(-8)}
          </p>
          {/* Route */}
          <p className="font-semibold text-gray-900 truncate">
            {order.pickupAddress}
          </p>
          <p className="text-sm text-gray-500 truncate">
            → {order.dropAddress}
          </p>
          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 font-medium">
              {order.orderType}
            </span>
            <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${
              order.paymentType === 'COD'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {order.paymentType}
            </span>
            <span className="text-xs font-semibold text-gray-700">
              ₹{Number(order.totalCharge).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Right: status + date + arrow */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
        <StatusBadge status={order.status} />
        <p className="text-xs text-gray-400">
          {new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </p>
        <svg
          className="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition-colors hidden sm:block"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

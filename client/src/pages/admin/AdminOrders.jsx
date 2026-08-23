import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import Alert from '../../components/shared/Alert';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSpinner';
import { STATUS_LABELS } from '../../utils/statusColors';

const STATUSES = [
  { value: '', label: 'All Statuses', icon: '📋' },
  { value: 'Created', label: 'Created', icon: '📋' },
  { value: 'PickedUp', label: 'Picked Up', icon: '📦' },
  { value: 'InTransit', label: 'In Transit', icon: '🚛' },
  { value: 'OutForDelivery', label: 'Out for Delivery', icon: '🚴' },
  { value: 'Delivered', label: 'Delivered', icon: '✅' },
  { value: 'Failed', label: 'Failed', icon: '❌' },
  { value: 'Rescheduled', label: 'Rescheduled', icon: '🔄' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState({ status: '', page: 1 });
  const [assigning, setAssigning] = useState(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.status) params.set('status', filter.status);
    params.set('page', filter.page);
    params.set('limit', 20);
    
    api.get(`/orders?${params.toString()}`)
      .then(data => { 
        setOrders(data.orders); 
        setTotal(data.total); 
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { 
    fetchOrders(); 
  }, [fetchOrders]);

  async function handleAutoAssign(orderId) {
    setAssigning(orderId);
    setActionMsg({ type: '', text: '' });
    try {
      await api.post(`/orders/${orderId}/auto-assign`, {});
      setActionMsg({ type: 'success', text: 'Agent auto-assigned successfully.' });
      fetchOrders();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setAssigning(null);
    }
  }

  function clearFilter() {
    setFilter({ status: '', page: 1 });
  }

  const totalPages = Math.ceil(total / 20) || 1;
  const activeStatus = STATUSES.find(s => s.value === filter.status);

  return (
    <div>
      <PageHeader
        icon="📋"
        title="Order Management"
        description="View, filter, assign agents, and manage every shipment in the system"
      />

      {/* Filter & Search Bar */}
      <div className="mb-6 p-4 bg-surface-primary dark:bg-surface-dark-primary rounded-2xl 
                      border border-border-light dark:border-border-dark shadow-card-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-3 flex-1 min-w-[250px]">
            <span className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary shrink-0">
              Filter:
            </span>
            <select
              className="input text-sm flex-1 min-w-0"
              value={filter.status}
              onChange={e => setFilter({ status: e.target.value, page: 1 })}
            >
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>
                  {s.icon} {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active filter badge */}
          {filter.status && (
            <button
              onClick={clearFilter}
              className="flex items-center gap-2 text-sm font-medium bg-brand-50 dark:bg-brand-900/20 
                         text-brand-700 dark:text-brand-300 rounded-xl px-3 py-2 
                         hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors 
                         ring-1 ring-brand-200 dark:ring-brand-700"
            >
              <span>{activeStatus?.icon}</span>
              <span>{activeStatus?.label}</span>
              <span className="ml-1 font-bold">✕</span>
            </button>
          )}

          {/* Results count */}
          <div className="ml-auto text-sm text-text-secondary dark:text-text-dark-secondary">
            {!loading && (
              <span className="font-medium">
                {total.toLocaleString()} {total === 1 ? 'order' : 'orders'}
                {filter.status && ` • ${activeStatus?.label}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {actionMsg.text && <Alert type={actionMsg.type} message={actionMsg.text} className="mb-4" />}
      {error && <Alert message={error} className="mb-4" />}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-surface-secondary dark:bg-surface-dark-secondary rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No orders found"
          description={
            filter.status
              ? `No orders with status "${activeStatus?.label}". Clear the filter to see all orders.`
              : 'No orders have been placed yet. They will appear here once customers start ordering.'
          }
          action={filter.status
            ? { label: '🗑 Clear filter', onClick: clearFilter }
            : undefined}
        />
      ) : (
        <>
          {/* Modern Table */}
          <div className="bg-surface-primary dark:bg-surface-dark-primary rounded-2xl border border-border-light dark:border-border-dark shadow-card-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-secondary dark:bg-surface-dark-secondary border-b border-border-light dark:border-border-dark">
                    {['Order', 'Customer', 'Route', 'Type & Payment', 'Amount', 'Status', 'Agent', 'Actions'].map(header => (
                      <th key={header} className="px-4 py-3 text-left text-xs font-bold text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {orders.map((order, idx) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary transition-colors duration-150"
                    >
                      {/* Order ID & Date */}
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-mono text-sm font-bold text-text-primary dark:text-text-dark-primary">
                            #{order.id.slice(-8).toUpperCase()}
                          </div>
                          <div className="text-xs text-text-tertiary dark:text-text-dark-tertiary mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-semibold text-text-primary dark:text-text-dark-primary text-sm">
                            {order.customer?.name || '—'}
                          </div>
                          <div className="text-xs text-text-tertiary dark:text-text-dark-tertiary truncate max-w-[150px]">
                            {order.customer?.email || '—'}
                          </div>
                        </div>
                      </td>

                      {/* Route */}
                      <td className="px-4 py-4">
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary">From</span>
                            <span className="font-mono text-text-secondary dark:text-text-dark-secondary">
                              {order.pickupPincode}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary">To</span>
                            <span className="font-mono font-medium text-text-primary dark:text-text-dark-primary">
                              {order.dropPincode}
                            </span>
                          </div>
                          {order.dropZone && (
                            <div className="inline-flex items-center gap-1 text-xs bg-info-50 dark:bg-info-900/20 
                                           text-info-700 dark:text-info-300 rounded-md px-2 py-0.5 font-medium">
                              🗺 {order.dropZone.name}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Type & Payment */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md 
                                         bg-surface-secondary dark:bg-surface-dark-secondary 
                                         text-text-secondary dark:text-text-dark-secondary 
                                         ring-1 ring-border-light dark:ring-border-dark w-fit">
                            {order.orderType}
                          </span>
                          <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md ring-1 w-fit ${
                            order.paymentType === 'COD'
                              ? 'bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 ring-warning-200 dark:ring-warning-700'
                              : 'bg-info-50 dark:bg-info-900/20 text-info-700 dark:text-info-300 ring-info-200 dark:ring-info-700'
                          }`}>
                            {order.paymentType === 'COD' ? '💵' : '💳'} {order.paymentType}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-4">
                        <div className="font-bold text-text-primary dark:text-text-dark-primary">
                          ₹{Number(order.totalCharge).toFixed(2)}
                        </div>
                        <div className="text-xs text-text-tertiary dark:text-text-dark-tertiary mt-0.5">
                          {order.chargeableWeightKg} kg
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <StatusBadge status={order.status} size="sm" />
                      </td>

                      {/* Agent */}
                      <td className="px-4 py-4">
                        {order.assignedAgent ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-warning-100 dark:bg-warning-900/30 
                                           text-warning-700 dark:text-warning-300 flex items-center justify-center 
                                           text-xs font-bold ring-1 ring-warning-200 dark:ring-warning-700">
                              {order.assignedAgent.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                                {order.assignedAgent.name}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Link 
                            to={`/admin/orders/${order.id}`}
                            className="text-sm font-medium text-brand-600 dark:text-brand-400 
                                     hover:text-brand-700 dark:hover:text-brand-300 
                                     hover:underline transition-colors"
                          >
                            View
                          </Link>
                          {!order.assignedAgentId && (
                            <button
                              onClick={() => handleAutoAssign(order.id)}
                              disabled={assigning === order.id}
                              className="text-sm font-medium text-success-600 dark:text-success-400 
                                       hover:text-success-700 dark:hover:text-success-300 
                                       hover:underline disabled:opacity-50 transition-colors"
                            >
                              {assigning === order.id ? 'Assigning...' : 'Auto-assign'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 gap-4">
            <button 
              className="btn-secondary" 
              disabled={filter.page <= 1}
              onClick={() => setFilter(f => ({ ...f, page: f.page - 1 }))}
            >
              ← Previous
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-secondary dark:text-text-dark-secondary">
                Page <strong className="text-text-primary dark:text-text-dark-primary">{filter.page}</strong> of{' '}
                <strong className="text-text-primary dark:text-text-dark-primary">{totalPages}</strong>
              </span>
            </div>
            <button 
              className="btn-secondary" 
              disabled={filter.page >= totalPages}
              onClick={() => setFilter(f => ({ ...f, page: f.page + 1 }))}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

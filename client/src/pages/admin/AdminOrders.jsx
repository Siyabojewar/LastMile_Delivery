import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import Alert from '../../components/shared/Alert';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSpinner';
import { STATUS_LABELS } from '../../utils/statusColors';
import RoleBanner from '../../components/shared/RoleBanner';

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
      <RoleBanner />
      <PageHeader
        icon="📋"
        title="Order Management"
        description="View, filter, assign agents, and manage every shipment in the system"
      />

      {/* Filter & Search Bar */}
      <div className="mb-6 p-4 bg-white rounded-2xl 
                      border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-3 flex-1 min-w-[250px]">
            <span className="text-sm font-medium text-gray-600 shrink-0">
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
              className="flex items-center gap-2 text-sm font-medium bg-blue-50 
                         text-blue-700 rounded-xl px-3 py-2 
                         hover:bg-blue-100 transition-colors 
                         ring-1 ring-blue-200"
            >
              <span>{activeStatus?.icon}</span>
              <span>{activeStatus?.label}</span>
              <span className="ml-1 font-bold">✕</span>
            </button>
          )}

          {/* Results count */}
          <div className="ml-auto text-sm text-gray-600">
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
            <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse"></div>
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
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['Order', 'Customer', 'Route', 'Type & Payment', 'Amount', 'Status', 'Agent', 'Actions'].map(header => (
                      <th key={header} className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order, idx) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      {/* Order ID & Date */}
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-mono text-sm font-bold text-gray-900">
                            #{order.id.slice(-8).toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
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
                          <div className="font-semibold text-gray-900 text-sm">
                            {order.customer?.name || '—'}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[150px]">
                            {order.customer?.email || '—'}
                          </div>
                        </div>
                      </td>

                      {/* Route */}
                      <td className="px-4 py-4">
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">From</span>
                            <span className="font-mono text-gray-600">
                              {order.pickupPincode}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">To</span>
                            <span className="font-mono font-medium text-gray-900">
                              {order.dropPincode}
                            </span>
                          </div>
                          {order.dropZone && (
                            <div className="inline-flex items-center gap-1 text-xs bg-blue-50 
                                           text-blue-700 rounded-md px-2 py-0.5 font-medium">
                              🗺 {order.dropZone.name}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Type & Payment */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md 
                                         bg-gray-50 
                                         text-gray-600 
                                         ring-1 ring-gray-200 w-fit">
                            {order.orderType}
                          </span>
                          <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md ring-1 w-fit ${
                            order.paymentType === 'COD'
                              ? 'bg-amber-50 text-amber-700 ring-amber-200'
                              : 'bg-blue-50 text-blue-700 ring-blue-200'
                          }`}>
                            {order.paymentType === 'COD' ? '💵' : '💳'} {order.paymentType}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-4">
                        <div className="font-bold text-gray-900">
                          ₹{Number(order.totalCharge).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
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
                            <div className="w-8 h-8 rounded-full bg-amber-100 
                                           text-amber-700 flex items-center justify-center 
                                           text-xs font-bold ring-1 ring-amber-200">
                              {order.assignedAgent.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.assignedAgent.name}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Link 
                            to={`/admin/orders/${order.id}`}
                            className="text-sm font-medium text-blue-600 
                                     hover:text-blue-700 
                                     hover:underline transition-colors"
                          >
                            View
                          </Link>
                          {!order.assignedAgentId && (
                            <button
                              onClick={() => handleAutoAssign(order.id)}
                              disabled={assigning === order.id}
                              className="text-sm font-medium text-emerald-600 
                                       hover:text-emerald-700 
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
              <span className="text-gray-600">
                Page <strong className="text-gray-900">{filter.page}</strong> of{' '}
                <strong className="text-gray-900">{totalPages}</strong>
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

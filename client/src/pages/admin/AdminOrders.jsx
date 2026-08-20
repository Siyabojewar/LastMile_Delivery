import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import Alert from '../../components/shared/Alert';
import EmptyState from '../../components/shared/EmptyState';
import { TableSkeleton } from '../../components/shared/LoadingSpinner';

const STATUSES = [
  { value: '',               label: 'All Statuses' },
  { value: 'Created',        label: 'Created' },
  { value: 'PickedUp',       label: 'Picked Up' },
  { value: 'InTransit',      label: 'In Transit' },
  { value: 'OutForDelivery', label: 'Out for Delivery' },
  { value: 'Delivered',      label: 'Delivered' },
  { value: 'Failed',         label: 'Failed' },
  { value: 'Rescheduled',    label: 'Rescheduled' },
];

export default function AdminOrders() {
  const [orders, setOrders]   = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });
  const [filter, setFilter]   = useState({ status: '', page: 1 });
  const [assigning, setAssigning] = useState(null); // orderId being auto-assigned

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.status) params.set('status', filter.status);
    params.set('page', filter.page);
    params.set('limit', 20);
    api.get(`/orders?${params.toString()}`)
      .then(data => { setOrders(data.orders); setTotal(data.total); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

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

  const totalPages = Math.ceil(total / 20) || 1;

  return (
    <div>
      <PageHeader
        icon="📋"
        title="All Orders"
        description="View, filter, assign agents, and manage every order in the system."
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Filter by status:</label>
          <select
            className="input w-auto text-sm"
            value={filter.status}
            onChange={e => setFilter({ status: e.target.value, page: 1 })}
          >
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto text-sm text-gray-400">
          {!loading && (
            <span>
              {total} order{total !== 1 ? 's' : ''}
              {filter.status ? ` · ${STATUSES.find(s => s.value === filter.status)?.label}` : ''}
            </span>
          )}
        </div>
      </div>

      {actionMsg.text && (
        <Alert type={actionMsg.type} message={actionMsg.text} className="mb-4" />
      )}
      {error && <Alert message={error} className="mb-4" />}

      {loading ? (
        <TableSkeleton rows={6} cols={8} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No orders found"
          description={
            filter.status
              ? `There are no orders with status "${STATUSES.find(s => s.value === filter.status)?.label}". Try a different filter.`
              : 'No orders have been placed yet. They will appear here once customers start ordering.'
          }
          action={filter.status ? { label: 'Clear filter', onClick: () => setFilter({ status: '', page: 1 }) } : undefined}
        />
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Order</th>
                  <th className="table-th">Customer</th>
                  <th className="table-th">Route</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Charge</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Agent</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o, idx) => (
                  <tr
                    key={o.id}
                    className={`table-row ${idx % 2 === 1 ? 'table-row-even' : ''}`}
                  >
                    {/* Order ID + date */}
                    <td className="table-td">
                      <p className="font-mono text-xs font-semibold text-gray-600">
                        #{o.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="table-td">
                      <p className="font-medium text-gray-800 text-sm whitespace-nowrap">
                        {o.customer?.name || '—'}
                      </p>
                      <p className="text-xs text-gray-400 truncate max-w-[140px]">
                        {o.customer?.email}
                      </p>
                    </td>

                    {/* Route */}
                    <td className="table-td">
                      <div className="text-xs space-y-0.5">
                        <p className="text-gray-600">
                          <span className="text-gray-400">From</span> {o.pickupPincode}
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-400">To</span> {o.dropPincode}
                        </p>
                        {o.dropZone && (
                          <p className="text-gray-400">{o.dropZone.name}</p>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="table-td">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 font-medium w-fit">
                          {o.orderType}
                        </span>
                        <span className={`text-xs rounded-full px-2 py-0.5 font-medium w-fit ${
                          o.paymentType === 'COD'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {o.paymentType}
                        </span>
                      </div>
                    </td>

                    {/* Charge */}
                    <td className="table-td">
                      <p className="font-semibold text-gray-800 text-sm whitespace-nowrap">
                        ₹{Number(o.totalCharge).toFixed(2)}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="table-td">
                      <StatusBadge status={o.status} />
                    </td>

                    {/* Agent */}
                    <td className="table-td">
                      {o.assignedAgent ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {o.assignedAgent.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700 whitespace-nowrap">
                            {o.assignedAgent.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="table-td">
                      <div className="flex items-center gap-3 whitespace-nowrap">
                        <Link
                          to={`/admin/orders/${o.id}`}
                          className="text-xs font-medium text-brand-600 hover:text-brand-800 hover:underline"
                        >
                          View →
                        </Link>
                        {!o.assignedAgentId && (
                          <button
                            onClick={() => handleAutoAssign(o.id)}
                            disabled={assigning === o.id}
                            className="text-xs font-medium text-emerald-600 hover:text-emerald-800 hover:underline disabled:opacity-50"
                          >
                            {assigning === o.id ? 'Assigning…' : 'Auto-assign'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-5 gap-3 flex-wrap">
            <button
              className="btn-secondary btn-sm"
              disabled={filter.page <= 1}
              onClick={() => setFilter(f => ({ ...f, page: f.page - 1 }))}
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-500">
              Page <strong>{filter.page}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              className="btn-secondary btn-sm"
              disabled={orders.length < 20}
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

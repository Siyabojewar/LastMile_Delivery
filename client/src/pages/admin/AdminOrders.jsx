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
  { value: 'Created',        label: '📋 Created' },
  { value: 'PickedUp',       label: '📦 Picked Up' },
  { value: 'InTransit',      label: '🚛 In Transit' },
  { value: 'OutForDelivery', label: '🚴 Out for Delivery' },
  { value: 'Delivered',      label: '✅ Delivered' },
  { value: 'Failed',         label: '❌ Failed' },
  { value: 'Rescheduled',    label: '🔄 Rescheduled' },
];

export default function AdminOrders() {
  const [orders, setOrders]   = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });
  const [filter, setFilter]   = useState({ status: '', page: 1 });
  const [assigning, setAssigning] = useState(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filter.status) p.set('status', filter.status);
    p.set('page', filter.page);
    p.set('limit', 20);
    api.get(`/orders?${p.toString()}`)
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
  const activeStatus = STATUSES.find(s => s.value === filter.status);

  return (
    <div>
      <PageHeader
        icon="📋"
        title="All Orders"
        description="View, filter, assign agents, and manage every shipment in the system."
      />

      {/* ── Filter bar ────────────────────────────────────────────── */}
      <div className="card mb-5 py-4 px-5 flex flex-wrap items-center gap-3 shadow-card-md">
        <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
          <span className="text-sm font-bold text-gray-500 whitespace-nowrap">🔽 Status:</span>
          <select
            className="input w-auto text-sm flex-1"
            value={filter.status}
            onChange={e => setFilter({ status: e.target.value, page: 1 })}
          >
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        {/* Active filter badge */}
        {filter.status && (
          <button
            onClick={() => setFilter({ status: '', page: 1 })}
            className="flex items-center gap-1.5 text-xs font-semibold bg-brand-100 text-brand-700
                       rounded-full px-3 py-1.5 hover:bg-brand-200 transition-colors ring-1 ring-brand-200"
          >
            {activeStatus?.label} <span className="font-bold ml-0.5">✕</span>
          </button>
        )}
        <span className="ml-auto text-sm font-semibold text-gray-400 whitespace-nowrap">
          {!loading && `${total} order${total !== 1 ? 's' : ''}`}
        </span>
      </div>

      {actionMsg.text && <Alert type={actionMsg.type} message={actionMsg.text} className="mb-4" />}
      {error && <Alert message={error} className="mb-4" />}

      {loading ? (
        <TableSkeleton rows={6} cols={8} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No orders found"
          description={
            filter.status
              ? `No orders with status "${activeStatus?.label?.replace(/.*\s/, '')}". Clear the filter to see all orders.`
              : 'No orders have been placed yet. They will appear here once customers start ordering.'
          }
          action={filter.status
            ? { label: 'Clear filter', onClick: () => setFilter({ status: '', page: 1 }) }
            : undefined}
        />
      ) : (
        <>
          <div className="table-container shadow-card-md">
            <table className="table">
              <thead className="table-head">
                <tr>
                  {['Order', 'Customer', 'Route', 'Type', 'Charge', 'Status', 'Agent', 'Actions'].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((o, idx) => (
                  <tr key={o.id} className={`table-row ${idx % 2 === 1 ? 'table-row-even' : ''}`}>
                    {/* Order */}
                    <td className="table-td">
                      <p className="font-mono text-xs font-bold text-gray-600">
                        #{o.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </td>
                    {/* Customer */}
                    <td className="table-td">
                      <p className="font-semibold text-gray-800 text-sm whitespace-nowrap">{o.customer?.name || '—'}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[140px]">{o.customer?.email}</p>
                    </td>
                    {/* Route */}
                    <td className="table-td">
                      <div className="text-xs space-y-0.5">
                        <p className="text-gray-600 font-mono">
                          <span className="text-gray-400 font-sans">From </span>{o.pickupPincode}
                        </p>
                        <p className="text-gray-600 font-mono">
                          <span className="text-gray-400 font-sans">To </span>{o.dropPincode}
                        </p>
                        {o.dropZone && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-brand-50
                                           text-brand-600 rounded-full px-2 py-0.5 font-semibold ring-1 ring-brand-100">
                            🗺 {o.dropZone.name}
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Type */}
                    <td className="table-td">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs bg-surface-100 text-gray-700 rounded-full px-2.5 py-0.5
                                         font-semibold ring-1 ring-surface-200 w-fit">
                          {o.orderType}
                        </span>
                        <span className={`text-xs rounded-full px-2.5 py-0.5 font-semibold ring-1 w-fit ${
                          o.paymentType === 'COD'
                            ? 'bg-orange-100 text-orange-700 ring-orange-200'
                            : 'bg-blue-100 text-blue-700 ring-blue-200'
                        }`}>
                          {o.paymentType}
                        </span>
                      </div>
                    </td>
                    {/* Charge */}
                    <td className="table-td">
                      <p className="font-bold text-gray-800 text-sm whitespace-nowrap">
                        ₹{Number(o.totalCharge).toFixed(2)}
                      </p>
                    </td>
                    {/* Status */}
                    <td className="table-td"><StatusBadge status={o.status} /></td>
                    {/* Agent */}
                    <td className="table-td">
                      {o.assignedAgent ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-800
                                          flex items-center justify-center text-xs font-extrabold shrink-0
                                          ring-1 ring-amber-300">
                            {o.assignedAgent.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700 whitespace-nowrap font-medium">
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
                        <Link to={`/admin/orders/${o.id}`}
                          className="text-xs font-bold text-brand-600 hover:text-brand-800
                                     hover:underline transition-colors">
                          View →
                        </Link>
                        {!o.assignedAgentId && (
                          <button
                            onClick={() => handleAutoAssign(o.id)}
                            disabled={assigning === o.id}
                            className="text-xs font-bold text-success-600 hover:text-success-700
                                       hover:underline disabled:opacity-50 transition-colors"
                          >
                            {assigning === o.id ? 'Assigning…' : '⚡ Auto-assign'}
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
            <button className="btn-secondary btn-sm" disabled={filter.page <= 1}
              onClick={() => setFilter(f => ({ ...f, page: f.page - 1 }))}>
              ← Previous
            </button>
            <span className="text-sm font-semibold text-gray-500">
              Page <strong>{filter.page}</strong> of <strong>{totalPages}</strong>
            </span>
            <button className="btn-secondary btn-sm" disabled={orders.length < 20}
              onClick={() => setFilter(f => ({ ...f, page: f.page + 1 }))}>
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

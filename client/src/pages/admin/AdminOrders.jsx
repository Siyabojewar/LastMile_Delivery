import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import StatusBadge from '../../components/shared/StatusBadge';

const STATUSES = ['', 'Created','PickedUp','InTransit','OutForDelivery','Delivered','Failed','Rescheduled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ status: '', page: 1 });

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

  async function autoAssign(orderId, e) {
    e.preventDefault();
    try {
      await api.post(`/orders/${orderId}/auto-assign`, {});
      fetchOrders();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Orders</h1>
        <div className="flex gap-2">
          <select className="input w-auto" value={filter.status}
            onChange={e => setFilter({ status: e.target.value, page: 1 })}>
            {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
        </div>
      </div>

      <Alert message={error} />
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="text-sm text-gray-500 mb-3">{total} order{total !== 1 ? 's' : ''} found</div>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Order ID','Customer','Route','Type','Charge','Status','Agent','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">#{o.id.slice(-8)}</td>
                    <td className="px-4 py-3">{o.customer?.name}</td>
                    <td className="px-4 py-3 text-xs">
                      <div>{o.pickupPincode} → {o.dropPincode}</div>
                      <div className="text-gray-400">{o.dropZone?.name || '—'}</div>
                    </td>
                    <td className="px-4 py-3">{o.orderType} / {o.paymentType}</td>
                    <td className="px-4 py-3 font-medium">₹{Number(o.totalCharge).toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-xs">{o.assignedAgent?.name || <span className="text-gray-400">Unassigned</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/admin/orders/${o.id}`} className="text-brand-600 hover:underline text-xs">View</Link>
                        {!o.assignedAgentId && (
                          <button onClick={e => autoAssign(o.id, e)} className="text-green-600 hover:underline text-xs">Auto-Assign</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <button className="btn-secondary" disabled={filter.page <= 1}
              onClick={() => setFilter(f => ({ ...f, page: f.page - 1 }))}>Previous</button>
            <span className="text-gray-500">Page {filter.page}</span>
            <button className="btn-secondary" disabled={orders.length < 20}
              onClick={() => setFilter(f => ({ ...f, page: f.page + 1 }))}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

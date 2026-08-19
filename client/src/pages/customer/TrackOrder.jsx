import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import StatusBadge from '../../components/shared/StatusBadge';
import { STATUS_COLORS } from '../../utils/statusColors';

export default function TrackOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleSuccess, setRescheduleSuccess] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(setOrder)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleReschedule(e) {
    e.preventDefault();
    setRescheduleError('');
    setRescheduleSuccess('');
    setRescheduling(true);
    try {
      const updated = await api.post(`/orders/${id}/reschedule`, { newDate: rescheduleDate });
      setOrder(updated);
      setRescheduleSuccess('Your order has been rescheduled successfully.');
    } catch (err) {
      setRescheduleError(err.message);
    } finally {
      setRescheduling(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert message={error} />;
  if (!order) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm text-brand-600 hover:underline mb-4 inline-flex items-center gap-1">
        ← Back
      </button>

      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-mono text-xs text-gray-400">Order #{order.id.slice(-8)}</p>
            <h1 className="text-xl font-bold mt-1">{order.pickupAddress}</h1>
            <p className="text-gray-500 text-sm">→ {order.dropAddress}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
          <Info label="Order Type"    value={order.orderType} />
          <Info label="Payment"       value={order.paymentType} />
          <Info label="Base Charge"   value={`₹${Number(order.baseCharge).toFixed(2)}`} />
          <Info label="COD Surcharge" value={`₹${Number(order.codSurchargeAmount).toFixed(2)}`} />
          <Info label="Total Charge"  value={`₹${Number(order.totalCharge).toFixed(2)}`} bold />
          <Info label="Chargeable Wt" value={`${order.chargeableWeightKg} kg`} />
          {order.assignedAgent && (
            <Info label="Delivery Agent" value={`${order.assignedAgent.name} (${order.assignedAgent.phone || 'N/A'})`} />
          )}
          {order.scheduledDate && (
            <Info label="Scheduled Date" value={new Date(order.scheduledDate).toLocaleDateString()} />
          )}
        </div>
      </div>

      {/* Tracking timeline */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Tracking Timeline</h2>
        <ol className="relative border-l-2 border-gray-200 space-y-6 pl-6">
          {order.statusHistory?.map((h, i) => (
            <li key={h.id} className="relative">
              <span className={`absolute -left-[1.35rem] top-1 w-4 h-4 rounded-full border-2 border-white ${STATUS_COLORS[h.status]?.split(' ')[0] || 'bg-gray-300'}`} />
              <div className="flex items-start justify-between">
                <div>
                  <StatusBadge status={h.status} />
                  {h.note && <p className="text-sm text-gray-600 mt-1">{h.note}</p>}
                  <p className="text-xs text-gray-400 mt-1">by {h.actor?.name} ({h.actor?.role})</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                  {new Date(h.createdAt).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Reschedule section (only for Failed orders) */}
      {order.status === 'Failed' && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Reschedule Delivery</h2>
          <Alert message={rescheduleError} />
          <Alert type="success" message={rescheduleSuccess} />
          <form onSubmit={handleReschedule} className="flex gap-3 mt-3">
            <input
              className="input flex-1"
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={rescheduleDate}
              onChange={e => setRescheduleDate(e.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={rescheduling}>
              {rescheduling ? 'Rescheduling...' : 'Reschedule'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Info({ label, value, bold }) {
  return (
    <div>
      <span className="block text-xs text-gray-400">{label}</span>
      <span className={`${bold ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{value}</span>
    </div>
  );
}

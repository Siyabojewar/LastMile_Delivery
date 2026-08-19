import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import StatusBadge from '../../components/shared/StatusBadge';

const AGENT_TRANSITIONS = {
  Created:        ['PickedUp'],
  PickedUp:       ['InTransit'],
  InTransit:      ['OutForDelivery'],
  OutForDelivery: ['Delivered', 'Failed'],
  Rescheduled:    ['PickedUp'],
};

export default function AgentOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(setOrder)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(status) {
    setUpdateError('');
    setUpdating(true);
    try {
      const updated = await api.post(`/orders/${id}/status`, { status, note });
      setOrder(updated);
      setNote('');
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert message={error} />;
  if (!order) return null;

  const transitions = AGENT_TRANSITIONS[order.status] || [];

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm text-brand-600 hover:underline mb-4 inline-flex items-center gap-1">
        ← Back to Orders
      </button>

      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-mono text-xs text-gray-400">Order #{order.id.slice(-8)}</p>
            <h1 className="text-xl font-bold mt-1">{order.dropAddress}</h1>
            <p className="text-sm text-gray-500">Customer: {order.customer?.name} ({order.customer?.phone || 'no phone'})</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm border-t pt-4">
          <Info label="Pickup" value={`${order.pickupAddress} (${order.pickupPincode})`} />
          <Info label="Drop"   value={`${order.dropAddress} (${order.dropPincode})`} />
          <Info label="Package" value={`${order.chargeableWeightKg} kg · ${order.orderType}`} />
          <Info label="Payment" value={order.paymentType} />
          <Info label="Total"   value={`₹${Number(order.totalCharge).toFixed(2)}`} bold />
        </div>
      </div>

      {/* Update status */}
      {transitions.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">Update Status</h2>
          <div>
            <label className="label">Note (optional)</label>
            <input className="input mb-3" value={note} onChange={e => setNote(e.target.value)}
              placeholder="Add a delivery note..." />
          </div>
          <Alert message={updateError} />
          <div className="flex gap-3 flex-wrap mt-2">
            {transitions.map(s => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                disabled={updating}
                className={s === 'Failed' ? 'btn-danger' : 'btn-primary'}
              >
                {updating ? 'Updating...' : `Mark as ${s}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Status History</h2>
        <ol className="space-y-3">
          {order.statusHistory?.map((h) => (
            <li key={h.id} className="flex items-start gap-3 text-sm">
              <StatusBadge status={h.status} />
              <div>
                {h.note && <p className="text-gray-600">{h.note}</p>}
                <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Info({ label, value, bold }) {
  return (
    <div>
      <span className="block text-xs text-gray-400">{label}</span>
      <span className={bold ? 'font-bold' : 'font-medium text-gray-700'}>{value}</span>
    </div>
  );
}

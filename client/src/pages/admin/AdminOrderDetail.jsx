import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import StatusBadge from '../../components/shared/StatusBadge';

const ALL_STATUSES = ['Created','PickedUp','InTransit','OutForDelivery','Delivered','Failed','Rescheduled'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignAgentId, setAssignAgentId] = useState('');
  const [overrideStatus, setOverrideStatus] = useState('');
  const [overrideNote, setOverrideNote] = useState('');
  const [working, setWorking] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/orders/${id}`),
      api.get('/admin/agents'),
    ]).then(([ord, agts]) => {
      setOrder(ord);
      setAgents(agts);
    }).catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleManualAssign(e) {
    e.preventDefault();
    if (!assignAgentId) return;
    setWorking(true); setActionMsg('');
    try {
      const updated = await api.post(`/orders/${id}/assign`, { agentId: assignAgentId });
      setOrder(updated);
      setActionMsg('Agent assigned successfully.');
    } catch (err) { setActionMsg(err.message); }
    finally { setWorking(false); }
  }

  async function handleAutoAssign() {
    setWorking(true); setActionMsg('');
    try {
      const { order: updated } = await api.post(`/orders/${id}/auto-assign`, {});
      setOrder(updated);
      setActionMsg('Agent auto-assigned.');
    } catch (err) { setActionMsg(err.message); }
    finally { setWorking(false); }
  }

  async function handleOverrideStatus(e) {
    e.preventDefault();
    if (!overrideStatus) return;
    setWorking(true); setActionMsg('');
    try {
      const updated = await api.post(`/orders/${id}/status`, { status: overrideStatus, note: overrideNote });
      setOrder(updated);
      setActionMsg(`Status overridden to ${overrideStatus}.`);
    } catch (err) { setActionMsg(err.message); }
    finally { setWorking(false); }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert message={error} />;
  if (!order) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm text-brand-600 hover:underline mb-4 inline-flex items-center gap-1">
        ← Back
      </button>

      {/* Order Summary */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-mono text-xs text-gray-400">Order #{order.id.slice(-8)}</p>
            <h1 className="text-xl font-bold mt-1">{order.pickupAddress} → {order.dropAddress}</h1>
            <p className="text-sm text-gray-500">Customer: {order.customer?.name} ({order.customer?.email})</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm border-t pt-4">
          <Info label="Order Type"  value={order.orderType} />
          <Info label="Payment"     value={order.paymentType} />
          <Info label="Pickup Zone" value={order.pickupZone?.name || '—'} />
          <Info label="Drop Zone"   value={order.dropZone?.name || '—'} />
          <Info label="Chargeable Wt" value={`${order.chargeableWeightKg} kg`} />
          <Info label="Total Charge"  value={`₹${Number(order.totalCharge).toFixed(2)}`} bold />
          <Info label="Agent" value={order.assignedAgent?.name || 'Unassigned'} />
          {order.scheduledDate && <Info label="Scheduled" value={new Date(order.scheduledDate).toLocaleDateString()} />}
        </div>
      </div>

      {actionMsg && <Alert type={actionMsg.includes('successfully') || actionMsg.includes('assigned') ? 'success' : 'error'} message={actionMsg} />}

      {/* Manual Assignment */}
      <div className="card mb-6">
        <h2 className="font-semibold mb-3">Assign Agent</h2>
        <form onSubmit={handleManualAssign} className="flex gap-3">
          <select className="input flex-1" value={assignAgentId} onChange={e => setAssignAgentId(e.target.value)}>
            <option value="">Select agent...</option>
            {agents.map(a => (
              <option key={a.userId} value={a.userId}>
                {a.user?.name} ({a.currentZone?.name || 'no zone'}) {a.isAvailable ? '✓ Available' : '✗ Busy'}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary" disabled={working || !assignAgentId}>Assign</button>
        </form>
        <button onClick={handleAutoAssign} className="btn-secondary mt-2 text-sm" disabled={working}>
          Auto-Assign (nearest available)
        </button>
      </div>

      {/* Override Status */}
      <div className="card mb-6">
        <h2 className="font-semibold mb-3">Override Status</h2>
        <form onSubmit={handleOverrideStatus} className="space-y-3">
          <select className="input" value={overrideStatus} onChange={e => setOverrideStatus(e.target.value)}>
            <option value="">Select status...</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input className="input" placeholder="Note (optional)" value={overrideNote}
            onChange={e => setOverrideNote(e.target.value)} />
          <button type="submit" className="btn-primary" disabled={working || !overrideStatus}>
            Override Status
          </button>
        </form>
      </div>

      {/* Status History */}
      <div className="card">
        <h2 className="font-semibold mb-4">Full Timeline</h2>
        <ol className="space-y-3">
          {order.statusHistory?.map((h) => (
            <li key={h.id} className="flex items-start gap-3 text-sm">
              <StatusBadge status={h.status} />
              <div className="flex-1">
                {h.note && <p className="text-gray-600">{h.note}</p>}
                <p className="text-xs text-gray-400">
                  by {h.actor?.name} ({h.actor?.role}) — {new Date(h.createdAt).toLocaleString()}
                </p>
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
      <span className={bold ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}>{value}</span>
    </div>
  );
}

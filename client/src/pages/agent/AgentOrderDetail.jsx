import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import Alert from '../../components/shared/Alert';
import InfoGrid from '../../components/shared/InfoGrid';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { STATUS_DOT_COLORS } from '../../utils/statusColors';

/* Valid next statuses an agent can set from each current status */
const AGENT_TRANSITIONS = {
  Created:        ['PickedUp'],
  PickedUp:       ['InTransit'],
  InTransit:      ['OutForDelivery'],
  OutForDelivery: ['Delivered', 'Failed'],
  Rescheduled:    ['PickedUp'],
};

/* Human-readable action labels */
const TRANSITION_LABELS = {
  PickedUp:       { label: 'Mark Picked Up',        icon: '📦', variant: 'primary' },
  InTransit:      { label: 'Mark In Transit',        icon: '🚛', variant: 'primary' },
  OutForDelivery: { label: 'Mark Out for Delivery',  icon: '🚴', variant: 'primary' },
  Delivered:      { label: 'Confirm Delivered',      icon: '✅', variant: 'primary' },
  Failed:         { label: 'Mark Delivery Failed',   icon: '❌', variant: 'danger'  },
};

/* ─── Timeline entry ────────────────────────────────────────────────────── */
function TimelineEntry({ entry, isLast }) {
  const dotColor = STATUS_DOT_COLORS[entry.status] || 'bg-gray-300';
  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${dotColor}`} />
        {!isLast && <div className="w-px flex-1 bg-gray-200 mt-1" />}
      </div>
      <div className="pb-4 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={entry.status} size="sm" />
          <span className="text-xs text-gray-400">
            {new Date(entry.createdAt).toLocaleString('en-IN', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
            })}
          </span>
        </div>
        {entry.note && (
          <p className="mt-1 text-sm text-gray-600 italic">"{entry.note}"</p>
        )}
      </div>
    </li>
  );
}

export default function AgentOrderDetail() {
  const { id }    = useParams();
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [note, setNote]       = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(setOrder)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(status) {
    setUpdateError(''); setUpdateSuccess('');
    setUpdating(true);
    try {
      const updated = await api.post(`/orders/${id}/status`, { status, note });
      setOrder(updated);
      setNote('');
      setUpdateSuccess(`Status updated to "${status}" successfully.`);
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading order…" />;
  if (error)   return (
    <div className="max-w-2xl mx-auto">
      <PageHeader back backLabel="Assigned Orders" title="Order not found" />
      <Alert message={error} />
    </div>
  );
  if (!order) return null;

  const transitions = AGENT_TRANSITIONS[order.status] || [];
  const isCOD = order.paymentType === 'COD';

  const infoItems = [
    { label: 'Customer',      value: `${order.customer?.name}${order.customer?.phone ? ` · ${order.customer.phone}` : ''}` },
    { label: 'Order Type',    value: order.orderType },
    { label: 'Payment',       value: order.paymentType },
    { label: 'Weight',        value: `${order.chargeableWeightKg} kg (chargeable)` },
    { label: 'Total Charge',  value: `₹${Number(order.totalCharge).toFixed(2)}`, bold: true },
    ...(order.scheduledDate
      ? [{ label: 'Scheduled Date', value: new Date(order.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) }]
      : []),
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        icon="📦"
        back
        backLabel="Assigned Orders"
        title={`Order #${order.id.slice(-8).toUpperCase()}`}
        description={`Delivery for ${order.customer?.name}`}
      >
        <StatusBadge status={order.status} />
      </PageHeader>

      {/* COD collection alert */}
      {isCOD && !['Delivered', 'Failed'].includes(order.status) && (
        <div className="mb-4 flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
          <span className="text-xl shrink-0">💵</span>
          <div>
            <p className="text-sm font-semibold text-orange-800">COD — Collect on delivery</p>
            <p className="text-sm text-orange-700">
              Collect <strong>₹{Number(order.totalCharge).toFixed(2)}</strong> from the recipient before handing over the package.
            </p>
          </div>
        </div>
      )}

      {/* Route card */}
      <div className="card mb-4">
        <p className="section-title mb-3">Route</p>
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
            <span className="text-base">📍</span>
            <div className="w-px h-6 bg-gray-300" />
            <span className="text-base">🏁</span>
          </div>
          <div className="space-y-2.5 min-w-0">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Pick up from</p>
              <p className="text-sm font-semibold text-gray-800 break-words">{order.pickupAddress}</p>
              <p className="text-xs text-gray-400 mt-0.5">Pincode {order.pickupPincode}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Deliver to</p>
              <p className="text-sm font-semibold text-gray-800 break-words">{order.dropAddress}</p>
              <p className="text-xs text-gray-400 mt-0.5">Pincode {order.dropPincode}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order info */}
      <div className="card mb-4">
        <p className="section-title mb-3">Order Info</p>
        <InfoGrid items={infoItems} cols={2} />
      </div>

      {/* Update status panel */}
      {transitions.length > 0 && (
        <div className="card mb-4 border-brand-200 bg-brand-50/30">
          <p className="section-title mb-3">Update Delivery Status</p>

          <Alert message={updateError} className="mb-3" />
          <Alert type="success" message={updateSuccess} className="mb-3" />

          <div className="mb-4">
            <label htmlFor="status-note" className="label">
              Delivery note
              <span className="ml-1 text-xs font-normal text-gray-400">(optional — visible to customer)</span>
            </label>
            <input
              id="status-note"
              className="input"
              placeholder="e.g. Left at front door, recipient not available…"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {transitions.map(s => {
              const t = TRANSITION_LABELS[s] || { label: `Mark ${s}`, icon: '', variant: 'primary' };
              return (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={updating}
                  className={`${t.variant === 'danger' ? 'btn-danger' : 'btn-primary'} gap-2`}
                >
                  {updating ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{t.icon}</span>
                  )}
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Guidance for current status */}
          <StatusGuidance status={order.status} />
        </div>
      )}

      {/* Completed / failed state message */}
      {transitions.length === 0 && (
        <div className={`card mb-4 flex items-center gap-3
          ${order.status === 'Delivered' ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
          <span className="text-2xl">{order.status === 'Delivered' ? '🎉' : '🔒'}</span>
          <div>
            <p className="font-semibold text-gray-800">
              {order.status === 'Delivered' ? 'Delivery completed!' : 'No further actions available'}
            </p>
            <p className="text-sm text-gray-500">
              {order.status === 'Delivered'
                ? 'This order has been successfully delivered.'
                : `This order is currently in "${order.status}" state.`}
            </p>
          </div>
        </div>
      )}

      {/* History timeline */}
      <div className="card">
        <p className="section-title mb-4">Status History</p>
        {order.statusHistory?.length > 0 ? (
          <ol>
            {[...order.statusHistory].reverse().map((h, i) => (
              <TimelineEntry
                key={h.id}
                entry={h}
                isLast={i === order.statusHistory.length - 1}
              />
            ))}
          </ol>
        ) : (
          <p className="text-sm text-gray-400">No history yet.</p>
        )}
      </div>
    </div>
  );
}

/* Contextual guidance text below the action buttons */
function StatusGuidance({ status }) {
  const tips = {
    Created:        'Pick up the package from the sender before marking it as Picked Up.',
    PickedUp:       'Package is with you. Mark In Transit once you start moving towards the destination.',
    InTransit:      'You are on the way. Mark Out for Delivery when you arrive at the drop area.',
    OutForDelivery: 'Attempt delivery now. If the recipient is unavailable, mark as Failed.',
    Rescheduled:    'This is a rescheduled attempt. Pick up and restart the delivery cycle.',
  };
  const tip = tips[status];
  if (!tip) return null;
  return (
    <p className="mt-3 text-xs text-gray-500 flex items-start gap-1.5">
      <span className="text-brand-500 shrink-0 mt-px">ℹ</span>
      {tip}
    </p>
  );
}

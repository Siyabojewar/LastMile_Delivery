import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import Alert from '../../components/shared/Alert';
import InfoGrid from '../../components/shared/InfoGrid';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { STATUS_DOT_COLORS } from '../../utils/statusColors';

const AGENT_TRANSITIONS = {
  Created:        ['PickedUp'],
  PickedUp:       ['InTransit'],
  InTransit:      ['OutForDelivery'],
  OutForDelivery: ['Delivered', 'Failed'],
  Rescheduled:    ['PickedUp'],
};

const TRANSITION_META = {
  PickedUp:       { label: 'Mark Picked Up',        icon: '📦', cls: 'btn-primary' },
  InTransit:      { label: 'Mark In Transit',        icon: '🚛', cls: 'btn-primary' },
  OutForDelivery: { label: 'Mark Out for Delivery',  icon: '🚴', cls: 'btn-primary' },
  Delivered:      { label: 'Confirm Delivered',      icon: '✅', cls: 'btn-success' },
  Failed:         { label: 'Mark Delivery Failed',   icon: '❌', cls: 'btn-danger'  },
};

const STATUS_TIPS = {
  Created:        'Pick up the package from the sender before marking it as Picked Up.',
  PickedUp:       'Package is with you. Mark In Transit once you start moving towards the destination.',
  InTransit:      'You are on the way. Mark Out for Delivery when you reach the drop area.',
  OutForDelivery: 'Attempt delivery now. If the recipient is unavailable, mark as Failed.',
  Rescheduled:    'This is a rescheduled attempt. Pick up the package and restart the delivery cycle.',
};

function TimelineEntry({ entry, isLast }) {
  const dotColor = STATUS_DOT_COLORS[entry.status] || 'bg-gray-300';
  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 shadow-sm ${dotColor}`} />
        {!isLast && <div className="w-px flex-1 bg-gray-200 mt-1.5" />}
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
          <p className="mt-1.5 text-sm text-gray-600 italic bg-surface-50 rounded-lg
                         px-3 py-1.5 border border-surface-200">
            "{entry.note}"
          </p>
        )}
      </div>
    </li>
  );
}

export default function AgentOrderDetail() {
  const { id }  = useParams();
  const [order, setOrder]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [note, setNote]           = useState('');
  const [updating, setUpdating]   = useState(false);
  const [updateError, setUpdateError]   = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(setOrder)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(status) {
    setUpdateError(''); setUpdateSuccess(''); setUpdating(true);
    try {
      const updated = await api.post(`/orders/${id}/status`, { status, note });
      setOrder(updated);
      setNote('');
      setUpdateSuccess(`Status updated to "${status}".`);
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading order…" />;
  if (error)   return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        breadcrumbs={[{ label: 'Assigned Orders', href: '/agent/orders' }, { label: 'Order not found' }]}
        title="Order not found"
      />
      <Alert message={error} />
    </div>
  );
  if (!order) return null;

  const transitions = AGENT_TRANSITIONS[order.status] || [];
  const isCOD = order.paymentType === 'COD';
  const tip   = STATUS_TIPS[order.status];

  const infoItems = [
    { label: 'Customer',      value: order.customer?.name },
    { label: 'Phone',         value: order.customer?.phone || '—' },
    { label: 'Order Type',    value: order.orderType },
    { label: 'Payment',       value: order.paymentType },
    { label: 'Weight',        value: `${order.chargeableWeightKg} kg (chargeable)` },
    { label: 'Total Charge',  value: `₹${Number(order.totalCharge).toFixed(2)}`, bold: true, highlight: isCOD },
    ...(order.scheduledDate
      ? [{ label: 'Scheduled Date', value: new Date(order.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) }]
      : []),
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        icon="📦"
        title={`Order #${order.id.slice(-8).toUpperCase()}`}
        description={`Delivery for ${order.customer?.name}`}
        breadcrumbs={[
          { label: 'Assigned Orders', href: '/agent/orders' },
          { label: `#${order.id.slice(-8).toUpperCase()}` },
        ]}
      >
        <StatusBadge status={order.status} />
      </PageHeader>

      {/* COD alert */}
      {isCOD && !['Delivered', 'Failed'].includes(order.status) && (
        <div className="mb-4 flex items-center gap-3 bg-orange-50 border border-orange-200
                        rounded-2xl px-4 py-3.5 shadow-sm animate-fade-in">
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-xl shrink-0">
            💵
          </div>
          <div>
            <p className="text-sm font-bold text-orange-800">COD — Collect cash on delivery</p>
            <p className="text-sm text-orange-700">
              Collect <strong>₹{Number(order.totalCharge).toFixed(2)}</strong> from the recipient before handing over the package.
            </p>
          </div>
        </div>
      )}

      {/* Route */}
      <div className="card mb-4 shadow-md">
        <p className="section-title mb-3"><span>🗺</span> Route</p>
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
            <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center text-sm">📍</div>
            <div className="w-px h-6 bg-gray-200" />
            <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-sm">🏁</div>
          </div>
          <div className="space-y-2.5 min-w-0 flex-1">
            <div className="bg-surface-50 rounded-xl px-3 py-2.5 border border-surface-200">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pick up from</p>
              <p className="text-sm font-bold text-gray-800 break-words mt-0.5">{order.pickupAddress}</p>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">Pincode {order.pickupPincode}</p>
            </div>
            <div className="bg-surface-50 rounded-xl px-3 py-2.5 border border-surface-200">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deliver to</p>
              <p className="text-sm font-bold text-gray-800 break-words mt-0.5">{order.dropAddress}</p>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">Pincode {order.dropPincode}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order info */}
      <div className="card mb-4">
        <p className="section-title mb-3"><span>📋</span> Order Info</p>
        <InfoGrid items={infoItems} cols={2} />
      </div>

      {/* Status update panel */}
      {transitions.length > 0 && (
        <div className="card mb-4 bg-gradient-to-br from-blue-50/40 to-white
                        border-blue-200 shadow-md">
          <p className="section-title mb-3"><span>⚡</span> Update Delivery Status</p>

          <Alert message={updateError} className="mb-3" />
          <Alert type="success" message={updateSuccess} className="mb-3" />

          <div className="mb-4">
            <label htmlFor="status-note" className="label">
              Delivery note
              <span className="ml-1 text-xs font-normal text-gray-400">(optional — visible to customer)</span>
            </label>
            <input className="input"
              id="status-note"
              placeholder="e.g. Left at front door, recipient not available…"
              value={note} onChange={e => setNote(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {transitions.map(s => {
              const m = TRANSITION_META[s] || { label: `Mark ${s}`, icon: '', cls: 'btn-primary' };
              return (
                <button key={s} onClick={() => updateStatus(s)} disabled={updating}
                  className={`${m.cls} gap-2`}>
                  {updating
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <span>{m.icon}</span>}
                  {m.label}
                </button>
              );
            })}
          </div>

          {tip && (
            <div className="mt-4 flex items-start gap-2.5 bg-white rounded-xl border border-surface-200
                            px-3.5 py-2.5 text-xs text-gray-500 shadow-sm">
              <span className="text-blue-500 shrink-0 mt-px font-bold">ℹ</span>
              {tip}
            </div>
          )}
        </div>
      )}

      {/* Terminal state */}
      {transitions.length === 0 && (
        <div className={`card mb-4 flex items-center gap-4 shadow-md
          ${order.status === 'Delivered'
            ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200'
            : 'bg-surface-50 border-surface-200'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0
            ${order.status === 'Delivered' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
            {order.status === 'Delivered' ? '🎉' : '🔒'}
          </div>
          <div>
            <p className="font-bold text-gray-800">
              {order.status === 'Delivered' ? 'Delivery completed!' : 'No further actions'}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {order.status === 'Delivered'
                ? 'This order has been successfully delivered. Great work!'
                : `This order is in "${order.status}" state — no actions available.`}
            </p>
          </div>
        </div>
      )}

      {/* History */}
      <div className="card">
        <p className="section-title mb-4"><span>🕐</span> Status History</p>
        {order.statusHistory?.length > 0 ? (
          <ol>
            {[...order.statusHistory].reverse().map((h, i) => (
              <TimelineEntry key={h.id} entry={h} isLast={i === order.statusHistory.length - 1} />
            ))}
          </ol>
        ) : (
          <p className="text-sm text-gray-400">No history yet.</p>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import Alert from '../../components/shared/Alert';
import InfoGrid from '../../components/shared/InfoGrid';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { STATUS_ORDER, STATUS_DOT_COLORS, STATUS_LABELS } from '../../utils/statusColors';

/* ── Progress stepper ───────────────────────────────────────────────────── */
function StatusStepper({ currentStatus }) {
  const isFailed      = currentStatus === 'Failed';
  const isRescheduled = currentStatus === 'Rescheduled';
  const stepIndex     = (isFailed || isRescheduled)
    ? 0
    : STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="w-full">
      <div className="flex items-start">
        {STATUS_ORDER.map((step, i) => {
          const past    = !isFailed && !isRescheduled && i < stepIndex;
          const current = !isFailed && !isRescheduled && i === stepIndex;
          const future  = !past && !current;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center flex-shrink-0">
                {/* Circle */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs
                                 font-extrabold border-2 transition-all duration-300
                  ${past
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                    : current
                      ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 shadow-md'
                      : isFailed && i === 0
                        ? 'bg-red-500 border-red-500 text-white shadow-sm'
                        : 'bg-white border-surface-200 text-gray-300'
                  }`}
                >
                  {past ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isFailed && i === 0 ? '✕' : i + 1}
                </div>
                {/* Label */}
                <p className={`text-[10px] mt-2 font-semibold text-center w-16 leading-tight
                  ${past || current ? 'text-gray-700' : 'text-gray-300'}`}>
                  {STATUS_LABELS[step]}
                </p>
              </div>
              {/* Connector */}
              {i < STATUS_ORDER.length - 1 && (
                <div className="flex-1 mt-4 mx-1">
                  <div className={`h-1 rounded-full transition-all duration-300
                    ${past ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {isFailed && (
        <div className="mt-4 flex items-center gap-2.5 bg-red-50 border border-red-200
                        rounded-2xl px-4 py-3 text-sm text-red-700 shadow-sm animate-fade-in">
          <span className="text-lg shrink-0">❌</span>
          <span>Delivery attempt failed. Please reschedule below.</span>
        </div>
      )}
      {isRescheduled && (
        <div className="mt-4 flex items-center gap-2.5 bg-purple-50 border border-purple-200
                        rounded-2xl px-4 py-3 text-sm text-purple-700 shadow-sm animate-fade-in">
          <span className="text-lg shrink-0">🔄</span>
          <span>Order rescheduled — awaiting pickup for the next attempt.</span>
        </div>
      )}
    </div>
  );
}

/* ── Timeline entry ─────────────────────────────────────────────────────── */
function TimelineEntry({ entry, isLast }) {
  const dotColor = STATUS_DOT_COLORS[entry.status] || 'bg-gray-400';
  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full shrink-0 mt-0.5 ring-4 ring-white shadow-sm ${dotColor}`} />
        {!isLast && <div className="w-px flex-1 bg-gray-200 mt-1.5" />}
      </div>
      <div className="pb-6 min-w-0">
        <div className="flex flex-wrap items-start gap-2 justify-between">
          <StatusBadge status={entry.status} />
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {new Date(entry.createdAt).toLocaleString('en-IN', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
            })}
          </span>
        </div>
        {entry.note && (
          <p className="mt-1.5 text-sm text-gray-600 bg-surface-50 rounded-lg px-3 py-1.5
                         border border-surface-200">
            {entry.note}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Updated by{' '}
          <span className="font-semibold text-gray-600">{entry.actor?.name}</span>{' '}
          <span className="capitalize bg-gray-100 rounded-md px-1.5 py-0.5 text-gray-500 font-medium">
            {entry.actor?.role}
          </span>
        </p>
      </div>
    </li>
  );
}

/* ── Reschedule panel ───────────────────────────────────────────────────── */
function ReschedulePanel({ orderId, onRescheduled }) {
  const [date, setDate]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const updated = await api.post(`/orders/${orderId}/reschedule`, { newDate: date });
      setSuccess('Your delivery has been rescheduled successfully.');
      onRescheduled(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card border-red-200 bg-gradient-to-br from-red-50/50 to-white shadow-md">
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-base shrink-0">
          📅
        </div>
        <h2 className="font-bold text-gray-800">Reschedule Delivery</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4 ml-10">
        Choose a new date and we'll automatically find the nearest available agent.
      </p>

      <Alert message={error} className="mb-3" />
      <Alert type="success" message={success} className="mb-3" />

      {!success && (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 ml-10">
          <div className="flex-1">
            <label htmlFor="reschedule-date" className="label">New Delivery Date</label>
            <input
              id="reschedule-date" className="input" type="date" required
              min={new Date().toISOString().split('T')[0]}
              value={date} onChange={e => setDate(e.target.value)}
            />
          </div>
          <div className="sm:pt-7">
            <button type="submit" className="btn-primary w-full sm:w-auto" disabled={loading}>
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Rescheduling…</>
                : '📅 Reschedule'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function TrackOrder() {
  const { id }   = useParams();
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(setOrder)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading order details…" />;
  if (error)   return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        breadcrumbs={[{ label: 'My Orders', href: '/customer/orders' }, { label: 'Order not found' }]}
        title="Order not found"
      />
      <Alert message={error} />
    </div>
  );
  if (!order) return null;

  const infoItems = [
    { label: 'Order Type',    value: order.orderType },
    { label: 'Payment',       value: order.paymentType },
    { label: 'Pickup Zone',   value: order.pickupZone?.name   || '—' },
    { label: 'Drop Zone',     value: order.dropZone?.name     || '—' },
    { label: 'Actual Weight', value: `${order.actualWeightKg} kg` },
    { label: 'Chargeable Wt',  value: `${order.chargeableWeightKg} kg` },
    { label: 'Base Charge',   value: `₹${Number(order.baseCharge).toFixed(2)}` },
    ...(Number(order.codSurchargeAmount) > 0
      ? [{ label: 'COD Surcharge', value: `₹${Number(order.codSurchargeAmount).toFixed(2)}` }]
      : []),
    { label: 'Total Charge',  value: `₹${Number(order.totalCharge).toFixed(2)}`, bold: true, highlight: true },
    ...(order.assignedAgent
      ? [{ label: 'Delivery Agent', value: `${order.assignedAgent.name}${order.assignedAgent.phone ? ` · ${order.assignedAgent.phone}` : ''}` }]
      : [{ label: 'Delivery Agent', value: 'Not yet assigned' }]),
    ...(order.scheduledDate
      ? [{ label: 'Scheduled Date', value: new Date(order.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) }]
      : []),
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        icon="🔍"
        title="Track Your Order"
        description={`#${order.id.slice(-8).toUpperCase()} · placed ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
        breadcrumbs={[
          { label: 'My Orders', href: '/customer/orders' },
          { label: `Order #${order.id.slice(-8).toUpperCase()}` },
        ]}
      >
        <StatusBadge status={order.status} />
      </PageHeader>

      {/* Route summary card */}
      <div className="card mb-4 shadow-md">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
            <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center text-sm">📍</div>
            <div className="w-px h-6 bg-gray-200" />
            <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-sm">🏁</div>
          </div>
          <div className="space-y-2.5 min-w-0 flex-1">
            <div className="bg-surface-50 rounded-xl px-3 py-2.5 border border-surface-200">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pickup</p>
              <p className="text-sm font-semibold text-gray-800 break-words mt-0.5">{order.pickupAddress}</p>
              <p className="text-xs text-gray-400 mt-0.5">Pincode {order.pickupPincode}</p>
            </div>
            <div className="bg-surface-50 rounded-xl px-3 py-2.5 border border-surface-200">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Drop</p>
              <p className="text-sm font-semibold text-gray-800 break-words mt-0.5">{order.dropAddress}</p>
              <p className="text-xs text-gray-400 mt-0.5">Pincode {order.dropPincode}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress stepper */}
      <div className="card mb-4 overflow-x-auto shadow-md">
        <p className="section-title mb-5">
          <span>🚚</span> Delivery Progress
        </p>
        <StatusStepper currentStatus={order.status} />
      </div>

      {/* Order details */}
      <div className="card mb-4">
        <p className="section-title mb-4">
          <span>📦</span> Order Details
        </p>
        <InfoGrid items={infoItems} cols={2} />
      </div>

      {/* Tracking timeline */}
      <div className="card mb-4">
        <p className="section-title mb-5">
          <span>🕐</span> Full Tracking Timeline
        </p>
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
          <p className="text-sm text-gray-400">No status updates yet.</p>
        )}
      </div>

      {/* Reschedule */}
      {order.status === 'Failed' && (
        <ReschedulePanel orderId={order.id} onRescheduled={setOrder} />
      )}
    </div>
  );
}

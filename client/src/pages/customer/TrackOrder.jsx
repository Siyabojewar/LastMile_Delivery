import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import Alert from '../../components/shared/Alert';
import InfoGrid from '../../components/shared/InfoGrid';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { STATUS_ORDER, STATUS_DOT_COLORS, STATUS_LABELS } from '../../utils/statusColors';

/* ─── Progress stepper (Created → PickedUp → InTransit → OutForDelivery → Delivered) ─── */
function StatusStepper({ currentStatus }) {
  const isFailed      = currentStatus === 'Failed';
  const isRescheduled = currentStatus === 'Rescheduled';

  const stepIndex = isFailed || isRescheduled
    ? STATUS_ORDER.indexOf('Created')  // stop at start when failed/rescheduled
    : STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="w-full">
      <div className="flex items-center">
        {STATUS_ORDER.map((step, i) => {
          const done    = !isFailed && !isRescheduled && i <= stepIndex;
          const current = !isFailed && !isRescheduled && i === stepIndex;
          const failed  = isFailed && i === 0;

          return (
            <React.Fragment key={step}>
              {/* Step circle */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                  ${done
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : current
                      ? 'bg-brand-600 border-brand-600 text-white ring-4 ring-brand-100'
                      : isFailed && i === 0
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'bg-white border-gray-200 text-gray-300'
                  }`}
                >
                  {done && !current ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isFailed && i === 0 ? '✕' : i + 1}
                </div>
                <p className={`text-[10px] mt-1.5 font-medium text-center w-14 leading-tight
                  ${done || current ? 'text-gray-700' : 'text-gray-300'}`}
                >
                  {STATUS_LABELS[step]}
                </p>
              </div>

              {/* Connector line */}
              {i < STATUS_ORDER.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-5 rounded-full transition-all
                  ${!isFailed && !isRescheduled && i < stepIndex
                    ? 'bg-emerald-400'
                    : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Special banners */}
      {isFailed && (
        <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700">
          <span className="text-lg">❌</span>
          <span>Delivery attempt failed. Please reschedule below.</span>
        </div>
      )}
      {isRescheduled && (
        <div className="mt-3 flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 text-sm text-purple-700">
          <span className="text-lg">🔄</span>
          <span>Order rescheduled — awaiting pickup for next attempt.</span>
        </div>
      )}
    </div>
  );
}

/* ─── Timeline entry ──────────────────────────────────────────────────────── */
function TimelineEntry({ entry, isLast }) {
  const dotColor = STATUS_DOT_COLORS[entry.status] || 'bg-gray-400';
  return (
    <li className="flex gap-4">
      {/* Dot + line */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full shrink-0 mt-0.5 ring-4 ring-white ${dotColor}`} />
        {!isLast && <div className="w-px flex-1 bg-gray-200 mt-1" />}
      </div>

      {/* Content */}
      <div className={`pb-5 min-w-0 ${isLast ? '' : ''}`}>
        <div className="flex flex-wrap items-start gap-2 justify-between">
          <StatusBadge status={entry.status} />
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {new Date(entry.createdAt).toLocaleString('en-IN', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
            })}
          </span>
        </div>
        {entry.note && (
          <p className="mt-1 text-sm text-gray-600">{entry.note}</p>
        )}
        <p className="mt-0.5 text-xs text-gray-400">
          Updated by {entry.actor?.name}{' '}
          <span className="capitalize bg-gray-100 rounded px-1 py-0.5">{entry.actor?.role}</span>
        </p>
      </div>
    </li>
  );
}

/* ─── Reschedule panel ────────────────────────────────────────────────────── */
function ReschedulePanel({ orderId, onRescheduled }) {
  const [date, setDate]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
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
    <div className="card border-red-200 bg-red-50/30">
      <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
        <span>📅</span> Reschedule Delivery
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Choose a new date and we'll automatically find the nearest available agent for you.
      </p>

      <Alert message={error} className="mb-3" />
      <Alert type="success" message={success} className="mb-3" />

      {!success && (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="reschedule-date" className="label">New Delivery Date</label>
            <input
              id="reschedule-date"
              className="input"
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <div className="sm:pt-7">
            <button type="submit" className="btn-primary w-full sm:w-auto" disabled={loading}>
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Rescheduling…
                </>
              ) : 'Reschedule'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────────────────── */
export default function TrackOrder() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(setOrder)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading order details…" />;
  if (error)   return (
    <div className="max-w-2xl mx-auto">
      <PageHeader back backLabel="My Orders" title="Order not found" />
      <Alert message={error} />
    </div>
  );
  if (!order) return null;

  const infoItems = [
    { label: 'Order Type',      value: order.orderType },
    { label: 'Payment',         value: order.paymentType },
    { label: 'Pickup Zone',     value: order.pickupZone?.name   || '—' },
    { label: 'Drop Zone',       value: order.dropZone?.name     || '—' },
    { label: 'Actual Weight',   value: `${order.actualWeightKg} kg` },
    { label: 'Chargeable Wt',   value: `${order.chargeableWeightKg} kg` },
    { label: 'Base Charge',     value: `₹${Number(order.baseCharge).toFixed(2)}` },
    ...(Number(order.codSurchargeAmount) > 0
      ? [{ label: 'COD Surcharge', value: `₹${Number(order.codSurchargeAmount).toFixed(2)}` }]
      : []),
    { label: 'Total Charge',    value: `₹${Number(order.totalCharge).toFixed(2)}`, bold: true },
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
        back
        backLabel="My Orders"
        title="Track Your Order"
        description={`Order #${order.id.slice(-8).toUpperCase()} · placed ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
        icon="🔍"
      >
        <StatusBadge status={order.status} />
      </PageHeader>

      {/* Route summary */}
      <div className="card mb-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
            <span className="text-base">📍</span>
            <div className="w-px h-5 bg-gray-300" />
            <span className="text-base">🏁</span>
          </div>
          <div className="space-y-2 min-w-0">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Pickup</p>
              <p className="text-sm font-medium text-gray-800 break-words">{order.pickupAddress}</p>
              <p className="text-xs text-gray-400">Pincode {order.pickupPincode}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Drop</p>
              <p className="text-sm font-medium text-gray-800 break-words">{order.dropAddress}</p>
              <p className="text-xs text-gray-400">Pincode {order.dropPincode}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress stepper */}
      <div className="card mb-4 overflow-x-auto">
        <p className="section-title mb-4">Delivery Progress</p>
        <StatusStepper currentStatus={order.status} />
      </div>

      {/* Order details */}
      <div className="card mb-4">
        <p className="section-title">Order Details</p>
        <InfoGrid items={infoItems} cols={2} />
      </div>

      {/* Tracking timeline */}
      <div className="card mb-4">
        <p className="section-title mb-4">Full Tracking Timeline</p>
        {order.statusHistory?.length > 0 ? (
          <ol className="space-y-0">
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

      {/* Reschedule (only for Failed orders) */}
      {order.status === 'Failed' && (
        <ReschedulePanel orderId={order.id} onRescheduled={setOrder} />
      )}
    </div>
  );
}

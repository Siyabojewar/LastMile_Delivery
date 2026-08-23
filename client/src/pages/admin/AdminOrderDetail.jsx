import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import Alert from '../../components/shared/Alert';
import InfoGrid from '../../components/shared/InfoGrid';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { STATUS_DOT_COLORS } from '../../utils/statusColors';

const ALL_STATUSES = ['Created','PickedUp','InTransit','OutForDelivery','Delivered','Failed','Rescheduled'];

function SectionCard({ title, icon, children, className = '' }) {
  return (
    <div className={`card mb-4 shadow-md ${className}`}>
      <p className="section-title mb-4">
        {icon && <span>{icon}</span>}
        {title}
      </p>
      {children}
    </div>
  );
}

function TimelineEntry({ entry, isLast }) {
  const dotColor = STATUS_DOT_COLORS[entry.status] || 'bg-gray-300';
  const isAdmin  = entry.actorRole === 'admin';
  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full shrink-0 mt-0.5 shadow-sm ${dotColor}
          ${isAdmin ? 'ring-2 ring-offset-1 ring-purple-400' : ''}`} />
        {!isLast && <div className="w-px flex-1 bg-gray-200 mt-1.5" />}
      </div>
      <div className="pb-5 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={entry.status} size="sm" />
          {isAdmin && (
            <span className="text-[10px] bg-purple-100 text-purple-700 rounded-lg px-2 py-0.5
                             font-bold uppercase tracking-wide ring-1 ring-purple-200">
              Admin override
            </span>
          )}
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
        <p className="mt-1 text-xs text-gray-400">
          by <span className="font-semibold text-gray-600">{entry.actor?.name}</span>{' '}
          <span className="capitalize bg-gray-100 rounded-md px-1.5 py-0.5 font-medium">{entry.actorRole}</span>
        </p>
      </div>
    </li>
  );
}

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder]   = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [assignAgentId, setAssignAgentId] = useState('');
  const [assigning, setAssigning]         = useState(false);
  const [overrideStatus, setOverrideStatus] = useState('');
  const [overrideNote, setOverrideNote]     = useState('');
  const [overriding, setOverriding]         = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    Promise.all([api.get(`/orders/${id}`), api.get('/admin/agents')])
      .then(([ord, agts]) => { setOrder(ord); setAgents(agts); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function showMsg(type, text) {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  }

  async function handleManualAssign(e) {
    e.preventDefault();
    if (!assignAgentId) return;
    setAssigning(true);
    try {
      const updated = await api.post(`/orders/${id}/assign`, { agentId: assignAgentId });
      setOrder(prev => ({ ...prev, assignedAgentId: updated.assignedAgentId,
        assignedAgent: agents.find(a => a.userId === assignAgentId)?.user }));
      showMsg('success', 'Agent assigned successfully.');
      setAssignAgentId('');
    } catch (err) { showMsg('error', err.message); }
    finally { setAssigning(false); }
  }

  async function handleAutoAssign() {
    setAssigning(true);
    try {
      const { order: updated } = await api.post(`/orders/${id}/auto-assign`, {});
      setOrder(updated);
      showMsg('success', 'Agent auto-assigned based on nearest availability.');
    } catch (err) { showMsg('error', err.message); }
    finally { setAssigning(false); }
  }

  async function handleOverride(e) {
    e.preventDefault();
    if (!overrideStatus) return;
    setOverriding(true);
    try {
      const updated = await api.post(`/orders/${id}/status`, { status: overrideStatus, note: overrideNote });
      setOrder(updated);
      showMsg('success', `Status overridden to "${overrideStatus}".`);
      setOverrideStatus(''); setOverrideNote('');
    } catch (err) { showMsg('error', err.message); }
    finally { setOverriding(false); }
  }

  if (loading) return <LoadingSpinner message="Loading order…" />;
  if (error)   return (
    <div className="max-w-3xl mx-auto">
      <PageHeader breadcrumbs={[{ label: 'All Orders', href: '/admin/orders' }, { label: 'Not found' }]}
        title="Order not found" />
      <Alert message={error} />
    </div>
  );
  if (!order) return null;

  const infoItems = [
    { label: 'Customer',      value: order.customer?.name },
    { label: 'Email',         value: order.customer?.email },
    { label: 'Order Type',    value: order.orderType },
    { label: 'Payment',       value: order.paymentType },
    { label: 'Pickup Zone',   value: order.pickupZone?.name || '—' },
    { label: 'Drop Zone',     value: order.dropZone?.name   || '—' },
    { label: 'Actual Wt',     value: `${order.actualWeightKg} kg` },
    { label: 'Chargeable Wt', value: `${order.chargeableWeightKg} kg` },
    { label: 'Base Charge',   value: `₹${Number(order.baseCharge).toFixed(2)}` },
    ...(Number(order.codSurchargeAmount) > 0
      ? [{ label: 'COD Surcharge', value: `₹${Number(order.codSurchargeAmount).toFixed(2)}` }]
      : []),
    { label: 'Total Charge',  value: `₹${Number(order.totalCharge).toFixed(2)}`, bold: true, highlight: true },
    ...(order.scheduledDate
      ? [{ label: 'Scheduled', value: new Date(order.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) }]
      : []),
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        icon="🔎"
        title={`Order #${order.id.slice(-8).toUpperCase()}`}
        description={`${order.pickupAddress} → ${order.dropAddress}`}
        breadcrumbs={[
          { label: 'All Orders', href: '/admin/orders' },
          { label: `#${order.id.slice(-8).toUpperCase()}` },
        ]}
      >
        <StatusBadge status={order.status} />
      </PageHeader>

      {msg.text && <Alert type={msg.type} message={msg.text} className="mb-4" />}

      {/* Route */}
      <SectionCard title="Route" icon="🗺">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
            <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center text-sm">📍</div>
            <div className="w-px h-6 bg-gray-200" />
            <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-sm">🏁</div>
          </div>
          <div className="space-y-2.5 min-w-0 flex-1">
            <div className="bg-surface-50 rounded-xl px-3 py-2.5 border border-surface-200">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pickup</p>
              <p className="text-sm font-bold text-gray-800 break-words mt-0.5">{order.pickupAddress}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                {order.pickupPincode} · {order.pickupZone?.name || 'zone not mapped'}
              </p>
            </div>
            <div className="bg-surface-50 rounded-xl px-3 py-2.5 border border-surface-200">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Drop</p>
              <p className="text-sm font-bold text-gray-800 break-words mt-0.5">{order.dropAddress}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                {order.dropPincode} · {order.dropZone?.name || 'zone not mapped'}
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Order details */}
      <SectionCard title="Order Details" icon="📦">
        <InfoGrid items={infoItems} cols={3} />
      </SectionCard>

      {/* Current agent */}
      <SectionCard title="Assigned Agent" icon="🚴">
        {order.assignedAgentId ? (
          <div className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200
                          rounded-2xl shadow-sm">
            <div className="w-11 h-11 rounded-full bg-amber-200 text-amber-800 flex items-center
                            justify-center font-extrabold text-sm shrink-0 ring-2 ring-amber-300">
              {order.assignedAgent?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-bold text-gray-800">{order.assignedAgent?.name || 'Unknown'}</p>
              <p className="text-sm text-gray-500">{order.assignedAgent?.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No agent assigned yet.</p>
        )}
      </SectionCard>

      {/* Assignment panel */}
      <div className="card mb-4 bg-gradient-to-br from-blue-50/50 to-white border-blue-200 shadow-md">
        <p className="section-title mb-4"><span>⚡</span> Assign Agent</p>
        <form onSubmit={handleManualAssign} className="flex gap-3 flex-wrap">
          <select className="input flex-1 min-w-[200px] text-sm" value={assignAgentId}
            onChange={e => setAssignAgentId(e.target.value)}>
            <option value="">Select a specific agent…</option>
            {agents.map(a => (
              <option key={a.userId} value={a.userId}>
                {a.user?.name}{a.currentZone ? ` — ${a.currentZone.name}` : ''}
                {a.isAvailable ? ' ✓ Available' : ' ✗ Busy'}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary btn-sm" disabled={assigning || !assignAgentId}>
            {assigning ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
            Assign Manually
          </button>
        </form>
        <div className="divider-label my-3">or</div>
        <button onClick={handleAutoAssign} disabled={assigning} className="btn-secondary w-full justify-center">
          {assigning
            ? <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            : '🤖'}
          Auto-Assign (nearest available agent)
        </button>
      </div>

      {/* Override status */}
      <div className="card mb-4 bg-gradient-to-br from-purple-50/40 to-white border-purple-200 shadow-md">
        <p className="section-title mb-1"><span>🛡</span> Override Status</p>
        <p className="text-xs text-gray-500 mb-4 ml-5">
          Admin overrides are logged in the audit trail with your name and role.
        </p>
        <form onSubmit={handleOverride} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">New Status</label>
              <select className="input text-sm" value={overrideStatus}
                onChange={e => setOverrideStatus(e.target.value)}>
                <option value="">Select status…</option>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">
                Reason / Note
                <span className="ml-1 text-xs font-normal text-gray-400">(recommended)</span>
              </label>
              <input className="input text-sm" placeholder="e.g. Customer requested cancellation"
                value={overrideNote} onChange={e => setOverrideNote(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-primary btn-sm" disabled={overriding || !overrideStatus}>
            {overriding
              ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : '✓'}
            Apply Override
          </button>
        </form>
      </div>

      {/* Audit timeline */}
      <div className="card shadow-md">
        <p className="section-title mb-1"><span>📜</span> Full Audit Timeline</p>
        <p className="text-xs text-gray-400 mb-5 ml-5">
          Append-only — every status change ever recorded, never modified.
        </p>
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

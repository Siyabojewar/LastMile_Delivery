import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import PageHeader from '../../components/shared/PageHeader';
import Alert from '../../components/shared/Alert';
import EmptyState from '../../components/shared/EmptyState';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PasswordInput from '../../components/shared/PasswordInput';
import MapPicker from '../../components/shared/MapPicker';

function useMsg() {
  const [msg, setMsg] = useState({ type: '', text: '' });
  function show(type, text) { setMsg({ type, text }); setTimeout(() => setMsg({ type: '', text: '' }), 4000); }
  return [msg, show];
}

function AvailabilityBadge({ available }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-2.5 py-0.5 ring-1
      ${available ? 'bg-emerald-100 text-emerald-700 ring-emerald-200' : 'bg-red-100 text-red-700 ring-red-200'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${available ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {available ? 'Available' : 'Busy'}
    </span>
  );
}

function AgentAvatar({ name }) {
  const initials = name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';
  return (
    <div className="w-12 h-12 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center
                    font-extrabold shrink-0 select-none ring-2 ring-amber-300 shadow-sm text-base">
      {initials}
    </div>
  );
}

function CreateAgentForm({ zones, onCreated, working, setWorking, showMsg }) {
  const EMPTY = { name: '', email: '', password: '', phone: '', currentZoneId: '', currentLat: '', currentLng: '' };
  const [form, setForm] = useState(EMPTY);
  const [showCoords, setShowCoords] = useState(false);
  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }
  async function handleSubmit(e) {
    e.preventDefault(); setWorking(true);
    try { await api.post('/admin/agents', form); showMsg('success', `Agent "${form.name}" created.`); setForm(EMPTY); onCreated(); }
    catch (err) { showMsg('error', err.message); }
    finally { setWorking(false); }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="ag-name" className="label">Full Name <span className="text-red-400">*</span></label>
          <input id="ag-name" className="input" required placeholder="e.g. Ravi Kumar"
            value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div>
          <label htmlFor="ag-email" className="label">Email <span className="text-red-400">*</span></label>
          <input id="ag-email" className="input" type="email" required placeholder="ravi@company.com"
            value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="ag-pass" className="label">Password <span className="text-red-400">*</span>
            <span className="ml-1 text-xs font-normal text-gray-400">(min. 6)</span>
          </label>
          <PasswordInput id="ag-pass" required minLength={6} placeholder="••••••••" autoComplete="new-password"
            value={form.password} onChange={e => set('password', e.target.value)} />
        </div>
        <div>
          <label htmlFor="ag-phone" className="label">Phone <span className="text-xs font-normal text-gray-400 ml-1">(optional)</span></label>
          <input id="ag-phone" className="input" type="tel" placeholder="9876543210"
            value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
      </div>
      <div>
        <label htmlFor="ag-zone" className="label">Home Zone <span className="text-xs font-normal text-gray-400 ml-1">(optional)</span></label>
        <select id="ag-zone" className="input" value={form.currentZoneId} onChange={e => set('currentZoneId', e.target.value)}>
          <option value="">Select a zone…</option>
          {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
        {zones.length === 0 && <p className="field-hint text-amber-600">⚠ No zones yet — create zones first.</p>}
      </div>
      <button type="button" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
        onClick={() => setShowCoords(v => !v)}>
        {showCoords ? '▲ Hide' : '▶ Set'} GPS location (optional)
      </button>
      {showCoords && (
        <div className="space-y-2">
          <p className="field-hint">Click the map to place a pin, or drag it to adjust. Used for auto-assignment.</p>
          <MapPicker
            lat={form.currentLat}
            lng={form.currentLng}
            onChange={({ lat, lng }) => { set('currentLat', lat ?? ''); set('currentLng', lng ?? ''); }}
            height="240px"
          />
        </div>
      )}
      <button type="submit" className="btn-primary w-full" disabled={working}>
        {working ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating…</> : '+ Create Agent Account'}
      </button>
    </form>
  );
}

function AgentCard({ agent, onToggle, toggling, onResetPassword }) {
  const { user, currentZone, isAvailable, currentLat, currentLng, lastLocationUpdate } = agent;
  const hasCoords = currentLat != null && currentLng != null;
  return (
    <div className="card-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-3">
        <AgentAvatar name={user?.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              {user?.phone && <p className="text-xs text-gray-400 mt-0.5">{user.phone}</p>}
            </div>
            <AvailabilityBadge available={isAvailable} />
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            {currentZone ? (
              <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 font-semibold ring-1 ring-blue-200">
                🗺 {currentZone.name}
              </span>
            ) : (
              <span className="text-xs text-gray-400 italic">No zone assigned</span>
            )}
            {hasCoords && (
              <span className="text-xs text-gray-400 font-mono">
                📍 {parseFloat(currentLat).toFixed(4)}, {parseFloat(currentLng).toFixed(4)}
              </span>
            )}
            {lastLocationUpdate && (
              <span className="text-xs text-gray-300">
                · {new Date(lastLocationUpdate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Actions row */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => onToggle(agent.userId, isAvailable)}
          disabled={toggling === agent.userId}
          className={`btn-sm flex-1 ${isAvailable
            ? 'btn-secondary text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300'
            : 'btn-secondary text-emerald-600 hover:bg-emerald-50 border-emerald-200 hover:border-emerald-300'}`}
        >
          {toggling === agent.userId
            ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : isAvailable ? '✗ Mark Busy' : '✓ Mark Available'}
        </button>
        <button
          onClick={() => onResetPassword({ userId: agent.userId, name: user?.name, email: user?.email })}
          className="btn-sm btn-secondary text-amber-600 hover:bg-amber-50 border-amber-200 hover:border-amber-300"
          title="Reset this agent's password"
        >
          🔑 Reset Password
        </button>
      </div>
    </div>
  );
}

export default function AdminAgents() {
  const [agents, setAgents]       = useState([]);
  const [zones, setZones]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [working, setWorking]     = useState(false);
  const [toggling, setToggling]   = useState(null);
  const [search, setSearch]       = useState('');
  const [filterAvail, setFilterAvail] = useState('all');
  const [msg, showMsg]            = useMsg();
  const [resetTarget, setResetTarget] = useState(null); // { userId, name, email }
  const [resetPw, setResetPw]     = useState('');
  const [resetting, setResetting] = useState(false);

  function fetchAll() {
    return Promise.all([api.get('/admin/agents'), api.get('/admin/zones')])
      .then(([a, z]) => { setAgents(a); setZones(z); });
  }

  useEffect(() => {
    fetchAll().catch(err => showMsg('error', err.message)).finally(() => setLoading(false));
  }, []);

  async function toggleAvailability(userId, current) {
    setToggling(userId);
    try { await api.put(`/admin/agents/${userId}`, { isAvailable: !current }); await fetchAll(); showMsg('success', `Agent marked as ${current ? 'Busy' : 'Available'}.`); }
    catch (err) { showMsg('error', err.message); }
    finally { setToggling(null); }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (!resetTarget || resetPw.length < 6) return;
    setResetting(true);
    try {
      await api.post(`/admin/users/${resetTarget.userId}/reset-password`, { password: resetPw });
      showMsg('success', `Password updated for ${resetTarget.email}`);
      setResetTarget(null);
      setResetPw('');
    } catch (err) {
      showMsg('error', err.message);
    } finally {
      setResetting(false);
    }
  }

  const filtered = agents.filter(a => {
    const ms = !search.trim() || a.user?.name.toLowerCase().includes(search.toLowerCase()) || a.user?.email.toLowerCase().includes(search.toLowerCase()) || a.currentZone?.name.toLowerCase().includes(search.toLowerCase());
    const ma = filterAvail === 'all' ? true : filterAvail === 'available' ? a.isAvailable : !a.isAvailable;
    return ms && ma;
  });

  const availCount = agents.filter(a => a.isAvailable).length;
  const busyCount  = agents.filter(a => !a.isAvailable).length;

  if (loading) return <LoadingSpinner message="Loading agents…" />;

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader icon="🚴" title="Delivery Agents"
        description="Create agent accounts, manage availability, and reset passwords." />
      {msg.text && <Alert type={msg.type} message={msg.text} className="mb-5" />}

      {/* Reset password modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Reset Password</h3>
            <p className="text-sm text-gray-600 mb-4">
              Set a new password for <strong>{resetTarget.name}</strong> ({resetTarget.email})
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="label">New Password <span className="text-red-400">*</span>
                  <span className="ml-1 text-xs font-normal text-gray-400">(min. 6 characters)</span>
                </label>
                <PasswordInput
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={resetPw}
                  onChange={e => setResetPw(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1" disabled={resetting || resetPw.length < 6}>
                  {resetting ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</> : '✓ Set Password'}
                </button>
                <button type="button" className="btn-secondary flex-1"
                  onClick={() => { setResetTarget(null); setResetPw(''); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats */}
      {agents.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Agents',    value: agents.length, bg: 'bg-gray-100',     txt: 'text-gray-700' },
            { label: 'Available',       value: availCount,    bg: 'bg-emerald-50',   txt: 'text-emerald-700' },
            { label: 'Busy / Assigned', value: busyCount,     bg: 'bg-red-50',       txt: 'text-red-700' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
              <p className={`text-2xl font-bold ${s.txt}`}>{s.value}</p>
              <p className={`text-xs font-semibold mt-1 ${s.txt}`}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Create form */}
        <div className="lg:col-span-2">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 sticky top-20">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-blue-200">
              <span className="text-lg">➕</span>
              <h2 className="font-bold text-gray-800">Create Agent Account</h2>
            </div>
            <CreateAgentForm zones={zones} onCreated={fetchAll} working={working} setWorking={setWorking} showMsg={showMsg} />
          </div>
        </div>

        {/* Agent list */}
        <div className="lg:col-span-3">
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input className="input pl-9 text-sm" placeholder="Search agents…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm">
              {[{ key: 'all', label: 'All' }, { key: 'available', label: '✓ Available' }, { key: 'busy', label: '✗ Busy' }].map(f => (
                <button key={f.key} onClick={() => setFilterAvail(f.key)}
                  className={`px-3 py-1.5 font-semibold transition-colors ${filterAvail === f.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400 font-semibold mb-3">
            {filtered.length} agent{filtered.length !== 1 ? 's' : ''}{search || filterAvail !== 'all' ? ' matching filter' : ' total'}
          </p>

          {agents.length === 0 ? (
            <EmptyState icon="🚴" title="No agents yet"
              description="Create your first delivery agent using the form on the left." />
          ) : filtered.length === 0 ? (
            <div className="card-sm text-center py-10">
              <p className="text-sm text-gray-400">No agents match your filter.</p>
              <button onClick={() => { setSearch(''); setFilterAvail('all'); }}
                className="mt-3 text-xs font-bold text-blue-600 hover:underline">Clear filters</button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(agent => (
                <AgentCard key={agent.userId} agent={agent}
                  onToggle={toggleAvailability} toggling={toggling}
                  onResetPassword={setResetTarget} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

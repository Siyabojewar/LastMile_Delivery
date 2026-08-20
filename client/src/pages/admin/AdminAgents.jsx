import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import PageHeader from '../../components/shared/PageHeader';
import Alert from '../../components/shared/Alert';
import EmptyState from '../../components/shared/EmptyState';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

/* ─── Reusable inline feedback ───────────────────────────────────────────── */
function useMsg() {
  const [msg, setMsg] = useState({ type: '', text: '' });
  function show(type, text) {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  }
  return [msg, show];
}

/* ─── Availability badge ─────────────────────────────────────────────────── */
function AvailabilityBadge({ available }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-0.5
      ${available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${available ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {available ? 'Available' : 'Busy'}
    </span>
  );
}

/* ─── Agent avatar circle ────────────────────────────────────────────────── */
function AgentAvatar({ name, size = 'md' }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  const sz = size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm';
  return (
    <div className={`${sz} rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold shrink-0 select-none`}>
      {initials}
    </div>
  );
}

/* ─── Create Agent Form ──────────────────────────────────────────────────── */
function CreateAgentForm({ zones, onCreated, working, setWorking, showMsg }) {
  const EMPTY = { name: '', email: '', password: '', phone: '', currentZoneId: '', currentLat: '', currentLng: '' };
  const [form, setForm] = useState(EMPTY);
  const [showCoords, setShowCoords] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setWorking(true);
    try {
      await api.post('/admin/agents', form);
      showMsg('success', `Agent account for "${form.name}" created successfully.`);
      setForm(EMPTY);
      onCreated();
    } catch (err) {
      showMsg('error', err.message);
    } finally {
      setWorking(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="ag-name" className="label">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            id="ag-name" className="input" required
            placeholder="e.g. Ravi Kumar"
            value={form.name} onChange={e => set('name', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="ag-email" className="label">
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            id="ag-email" className="input" type="email" required
            placeholder="e.g. ravi@company.com"
            value={form.email} onChange={e => set('email', e.target.value)}
          />
        </div>
      </div>

      {/* Password + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="ag-pass" className="label">
            Password <span className="text-red-400">*</span>
            <span className="ml-1 text-xs font-normal text-gray-400">(min. 6 chars)</span>
          </label>
          <input
            id="ag-pass" className="input" type="password" required minLength={6}
            placeholder="••••••••"
            value={form.password} onChange={e => set('password', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="ag-phone" className="label">
            Phone Number
            <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
          </label>
          <input
            id="ag-phone" className="input" type="tel"
            placeholder="e.g. 9876543210"
            value={form.phone} onChange={e => set('phone', e.target.value)}
          />
        </div>
      </div>

      {/* Home zone */}
      <div>
        <label htmlFor="ag-zone" className="label">
          Home Zone
          <span className="ml-1 text-xs font-normal text-gray-400">(optional — used for auto-assignment)</span>
        </label>
        <select
          id="ag-zone" className="input"
          value={form.currentZoneId} onChange={e => set('currentZoneId', e.target.value)}
        >
          <option value="">Select a zone…</option>
          {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
        {zones.length === 0 && (
          <p className="field-hint text-amber-600">No zones configured yet — create zones first.</p>
        )}
      </div>

      {/* Coordinates (collapsed by default) */}
      <div>
        <button
          type="button"
          className="text-xs font-medium text-brand-600 hover:underline flex items-center gap-1"
          onClick={() => setShowCoords(v => !v)}
        >
          {showCoords ? '▲ Hide' : '▶ Set'} initial GPS coordinates (optional)
        </button>
        {showCoords && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label htmlFor="ag-lat" className="label">Latitude</label>
              <input
                id="ag-lat" className="input text-sm" type="number" step="0.0000001"
                placeholder="e.g. 18.5204"
                value={form.currentLat} onChange={e => set('currentLat', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="ag-lng" className="label">Longitude</label>
              <input
                id="ag-lng" className="input text-sm" type="number" step="0.0000001"
                placeholder="e.g. 73.8567"
                value={form.currentLng} onChange={e => set('currentLng', e.target.value)}
              />
            </div>
            <p className="col-span-2 field-hint">
              Used for haversine-based auto-assignment when no in-zone agent is available.
            </p>
          </div>
        )}
      </div>

      <button type="submit" className="btn-primary w-full" disabled={working}>
        {working ? (
          <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating…</>
        ) : '+ Create Agent Account'}
      </button>
    </form>
  );
}

/* ─── Agent Card (list item) ─────────────────────────────────────────────── */
function AgentCard({ agent, onToggle, toggling }) {
  const { user, currentZone, isAvailable, currentLat, currentLng, lastLocationUpdate } = agent;
  const hasCoords = currentLat != null && currentLng != null;

  return (
    <div className="card-sm flex items-start gap-3">
      {/* Avatar */}
      <AgentAvatar name={user?.name} size="lg" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            {user?.phone && (
              <p className="text-xs text-gray-400 mt-0.5">{user.phone}</p>
            )}
          </div>
          <AvailabilityBadge available={isAvailable} />
        </div>

        {/* Zone + location row */}
        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          {currentZone ? (
            <span className="inline-flex items-center gap-1 text-xs bg-brand-50 text-brand-700 rounded-full px-2.5 py-0.5 font-medium">
              <span>🗺</span> {currentZone.name}
            </span>
          ) : (
            <span className="text-xs text-gray-400 italic">No zone assigned</span>
          )}
          {hasCoords && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span>📍</span>
              {parseFloat(currentLat).toFixed(4)}, {parseFloat(currentLng).toFixed(4)}
            </span>
          )}
          {lastLocationUpdate && (
            <span className="text-xs text-gray-300">
              · updated {new Date(lastLocationUpdate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>

      {/* Toggle button */}
      <div className="shrink-0">
        <button
          onClick={() => onToggle(agent.userId, isAvailable)}
          disabled={toggling === agent.userId}
          className={`btn-sm ${isAvailable ? 'btn-secondary text-red-600 hover:bg-red-50 border-red-200' : 'btn-secondary text-emerald-600 hover:bg-emerald-50 border-emerald-200'}`}
          title={isAvailable ? 'Mark as Busy' : 'Mark as Available'}
        >
          {toggling === agent.userId ? (
            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isAvailable ? '✗ Mark Busy' : '✓ Mark Available'}
        </button>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function AdminAgents() {
  const [agents, setAgents]   = useState([]);
  const [zones, setZones]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [toggling, setToggling] = useState(null); // userId being toggled
  const [msg, showMsg]        = useMsg();

  // Search / filter
  const [search, setSearch]         = useState('');
  const [filterAvail, setFilterAvail] = useState('all'); // 'all' | 'available' | 'busy'

  function fetchAll() {
    return Promise.all([api.get('/admin/agents'), api.get('/admin/zones')])
      .then(([a, z]) => { setAgents(a); setZones(z); });
  }

  useEffect(() => {
    fetchAll()
      .catch(err => showMsg('error', err.message))
      .finally(() => setLoading(false));
  }, []);

  async function toggleAvailability(userId, current) {
    setToggling(userId);
    try {
      await api.put(`/admin/agents/${userId}`, { isAvailable: !current });
      await fetchAll();
      showMsg('success', `Agent marked as ${current ? 'Busy' : 'Available'}.`);
    } catch (err) {
      showMsg('error', err.message);
    } finally {
      setToggling(null);
    }
  }

  // Derived list
  const filtered = agents.filter(a => {
    const matchSearch = !search.trim() ||
      a.user?.name.toLowerCase().includes(search.toLowerCase()) ||
      a.user?.email.toLowerCase().includes(search.toLowerCase()) ||
      a.currentZone?.name.toLowerCase().includes(search.toLowerCase());
    const matchAvail =
      filterAvail === 'all' ? true :
      filterAvail === 'available' ? a.isAvailable :
      !a.isAvailable;
    return matchSearch && matchAvail;
  });

  const availableCount = agents.filter(a => a.isAvailable).length;
  const busyCount      = agents.filter(a => !a.isAvailable).length;

  if (loading) return <LoadingSpinner message="Loading agents…" />;

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        icon="🚴"
        title="Delivery Agents"
        description="Create agent accounts and manage their availability. Agents are assigned orders manually or automatically."
      />

      {msg.text && <Alert type={msg.type} message={msg.text} className="mb-5" />}

      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      {agents.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Agents',  value: agents.length,  color: 'bg-gray-100 text-gray-700' },
            { label: 'Available',     value: availableCount, color: 'bg-emerald-100 text-emerald-700' },
            { label: 'Busy / Assigned', value: busyCount,    color: 'bg-red-100 text-red-700' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl ${s.color} px-4 py-3 text-center`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Two-column layout: form + list ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Create form (2 cols) */}
        <div className="lg:col-span-2">
          <div className="card sticky top-20">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-sm shrink-0">
                ➕
              </span>
              <h2 className="font-semibold text-gray-800">Create Agent Account</h2>
            </div>
            <CreateAgentForm
              zones={zones}
              onCreated={fetchAll}
              working={working}
              setWorking={setWorking}
              showMsg={showMsg}
            />
          </div>
        </div>

        {/* Agent list (3 cols) */}
        <div className="lg:col-span-3">
          {/* Search + filter bar */}
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
              <input
                className="input pl-8 text-sm"
                placeholder="Search by name, email or zone…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
              {[
                { key: 'all',       label: 'All' },
                { key: 'available', label: '✓ Available' },
                { key: 'busy',      label: '✗ Busy' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilterAvail(f.key)}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    filterAvail === f.key
                      ? 'bg-brand-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Result count */}
          <p className="text-xs text-gray-400 mb-3">
            {filtered.length} agent{filtered.length !== 1 ? 's' : ''}
            {search || filterAvail !== 'all' ? ' matching filter' : ' total'}
          </p>

          {/* List */}
          {agents.length === 0 ? (
            <EmptyState
              icon="🚴"
              title="No agents yet"
              description="Create your first delivery agent using the form. Agents can then be assigned to orders manually or automatically."
            />
          ) : filtered.length === 0 ? (
            <div className="card-sm text-center py-10">
              <p className="text-sm text-gray-400">No agents match your search or filter.</p>
              <button
                onClick={() => { setSearch(''); setFilterAvail('all'); }}
                className="mt-3 text-xs font-medium text-brand-600 hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(agent => (
                <AgentCard
                  key={agent.userId}
                  agent={agent}
                  onToggle={toggleAvailability}
                  toggling={toggling}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

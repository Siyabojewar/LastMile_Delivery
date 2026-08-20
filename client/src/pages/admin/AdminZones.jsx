import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import PageHeader from '../../components/shared/PageHeader';
import Alert from '../../components/shared/Alert';
import EmptyState from '../../components/shared/EmptyState';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

/* ─── Reusable inline feedback hook ─────────────────────────────────────── */
function useMsg() {
  const [msg, setMsg] = useState({ type: '', text: '' });
  function show(type, text) {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  }
  return [msg, show];
}

/* ─── Zone form (create / edit) ─────────────────────────────────────────── */
function ZoneForm({ editing, onSubmit, onCancel, working }) {
  const [name, setName] = useState(editing?.name || '');
  const [desc, setDesc] = useState(editing?.description || '');

  // Reset when editing target changes
  useEffect(() => {
    setName(editing?.name || '');
    setDesc(editing?.description || '');
  }, [editing]);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ name, description: desc });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="zone-name" className="label">
          Zone Name <span className="text-red-400">*</span>
        </label>
        <input
          id="zone-name"
          className="input"
          required
          placeholder="e.g. Pune Central"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <p className="field-hint">A short, recognisable name for the delivery zone.</p>
      </div>
      <div>
        <label htmlFor="zone-desc" className="label">
          Description
          <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="zone-desc"
          className="input"
          placeholder="e.g. Covers Koregaon Park, Viman Nagar, Kharadi"
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary flex-1" disabled={working}>
          {working ? (
            <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving…</>
          ) : editing ? '✓ Update Zone' : '+ Add Zone'}
        </button>
        {editing && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

/* ─── Pincode form ───────────────────────────────────────────────────────── */
function PincodeForm({ zones, onSubmit, working }) {
  const [pincode, setPincode]     = useState('');
  const [zoneId, setZoneId]       = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ pincode, zoneId });
    setPincode(''); setZoneId('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="pin-code" className="label">
          Pincode <span className="text-red-400">*</span>
        </label>
        <input
          id="pin-code"
          className="input"
          required
          inputMode="numeric"
          pattern="[0-9]{5,6}"
          placeholder="e.g. 411001"
          value={pincode}
          onChange={e => setPincode(e.target.value)}
        />
        <p className="field-hint">5–6 digit pincode. Customers can only ship to/from mapped pincodes.</p>
      </div>
      <div>
        <label htmlFor="pin-zone" className="label">
          Assign to Zone <span className="text-red-400">*</span>
        </label>
        <select
          id="pin-zone"
          className="input"
          required
          value={zoneId}
          onChange={e => setZoneId(e.target.value)}
        >
          <option value="">Select a zone…</option>
          {zones.map(z => (
            <option key={z.id} value={z.id}>{z.name}</option>
          ))}
        </select>
        {zones.length === 0 && (
          <p className="field-hint text-amber-600">Create at least one zone first.</p>
        )}
      </div>
      <button
        type="submit"
        className="btn-primary w-full"
        disabled={working || zones.length === 0}
      >
        {working ? (
          <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Mapping…</>
        ) : '+ Map Pincode'}
      </button>
    </form>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function AdminZones() {
  const [zones, setZones]         = useState([]);
  const [pincodeMap, setPincodeMap] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editingZone, setEditingZone] = useState(null);
  const [zoneWorking, setZoneWorking] = useState(false);
  const [pinWorking, setPinWorking]   = useState(false);
  const [msg, showMsg]            = useMsg();

  // Pincode search
  const [pinSearch, setPinSearch] = useState('');

  function fetchAll() {
    return Promise.all([
      api.get('/admin/zones'),
      api.get('/admin/pincode-map'),
    ]).then(([z, p]) => { setZones(z); setPincodeMap(p); });
  }

  useEffect(() => {
    fetchAll()
      .catch(err => showMsg('error', err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleZoneSubmit({ name, description }) {
    setZoneWorking(true);
    try {
      if (editingZone) {
        await api.put(`/admin/zones/${editingZone.id}`, { name, description });
        showMsg('success', `Zone "${name}" updated.`);
      } else {
        await api.post('/admin/zones', { name, description });
        showMsg('success', `Zone "${name}" created.`);
      }
      setEditingZone(null);
      await fetchAll();
    } catch (err) {
      showMsg('error', err.message);
    } finally {
      setZoneWorking(false);
    }
  }

  async function handlePincodeSubmit({ pincode, zoneId }) {
    setPinWorking(true);
    try {
      await api.post('/admin/pincode-map', { pincode, zoneId });
      showMsg('success', `Pincode ${pincode} mapped successfully.`);
      await fetchAll();
    } catch (err) {
      showMsg('error', err.message);
    } finally {
      setPinWorking(false);
    }
  }

  async function deletePin(pincode) {
    if (!window.confirm(`Remove pincode ${pincode} from service area?`)) return;
    try {
      await api.delete(`/admin/pincode-map/${pincode}`);
      showMsg('success', `Pincode ${pincode} removed.`);
      await fetchAll();
    } catch (err) {
      showMsg('error', err.message);
    }
  }

  const filteredPins = pinSearch.trim()
    ? pincodeMap.filter(p =>
        p.pincode.includes(pinSearch.trim()) ||
        p.zone?.name.toLowerCase().includes(pinSearch.toLowerCase())
      )
    : pincodeMap;

  if (loading) return <LoadingSpinner message="Loading zones…" />;

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        icon="🗺"
        title="Zones & Pincode Mapping"
        description="Define delivery zones and map serviceable pincodes to them. Customers can only ship to/from mapped pincodes."
      />

      {msg.text && <Alert type={msg.type} message={msg.text} className="mb-5" />}

      {/* ── Top row: two forms side by side ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* Zone form card */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <span className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-sm">
              🏙
            </span>
            <h2 className="font-semibold text-gray-800">
              {editingZone ? `Editing: ${editingZone.name}` : 'Add New Zone'}
            </h2>
          </div>
          <ZoneForm
            editing={editingZone}
            onSubmit={handleZoneSubmit}
            onCancel={() => setEditingZone(null)}
            working={zoneWorking}
          />
        </div>

        {/* Pincode form card */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">
              📍
            </span>
            <h2 className="font-semibold text-gray-800">Map Pincode to Zone</h2>
          </div>
          <PincodeForm zones={zones} onSubmit={handlePincodeSubmit} working={pinWorking} />
        </div>
      </div>

      {/* ── Zones list ────────────────────────────────────────────────────── */}
      <div className="card mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <span>🏙</span> Zones
            <span className="ml-1 text-xs font-normal text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
              {zones.length}
            </span>
          </h2>
        </div>

        {zones.length === 0 ? (
          <EmptyState
            icon="🗺"
            title="No zones yet"
            description="Create your first zone above to start mapping pincodes."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {zones.map(z => (
              <div
                key={z.id}
                className="flex items-center justify-between py-3 gap-3 hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {z.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{z.name}</p>
                    {z.description && (
                      <p className="text-xs text-gray-500 truncate">{z.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1 font-medium">
                    {z.pincodes?.length || 0} pincode{z.pincodes?.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setEditingZone(z)}
                    className="btn-secondary btn-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pincode mappings table ────────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <span>📍</span> Pincode Mappings
            <span className="ml-1 text-xs font-normal text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
              {pincodeMap.length}
            </span>
          </h2>
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <input
              className="input pl-8 w-44 text-sm"
              placeholder="Search pincode or zone…"
              value={pinSearch}
              onChange={e => setPinSearch(e.target.value)}
            />
          </div>
        </div>

        {pincodeMap.length === 0 ? (
          <EmptyState
            icon="📍"
            title="No pincodes mapped"
            description="Map pincodes to zones using the form above. Only mapped pincodes are serviceable."
          />
        ) : filteredPins.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            No pincodes match "<strong>{pinSearch}</strong>".
          </p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Pincode</th>
                  <th className="table-th">Zone</th>
                  <th className="table-th w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPins.map((p, idx) => (
                  <tr key={p.pincode} className={`table-row ${idx % 2 === 1 ? 'table-row-even' : ''}`}>
                    <td className="table-td">
                      <span className="font-mono font-semibold text-gray-700 text-sm">
                        {p.pincode}
                      </span>
                    </td>
                    <td className="table-td">
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <span className="w-2 h-2 rounded-full bg-brand-400 shrink-0" />
                        {p.zone?.name || '—'}
                      </span>
                    </td>
                    <td className="table-td text-right">
                      <button
                        onClick={() => deletePin(p.pincode)}
                        className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

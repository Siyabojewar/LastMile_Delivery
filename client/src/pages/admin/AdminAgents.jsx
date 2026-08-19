import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Alert from '../../components/shared/Alert';

const EMPTY = { name: '', email: '', password: '', phone: '', currentZoneId: '', currentLat: '', currentLng: '' };

export default function AdminAgents() {
  const [agents, setAgents] = useState([]);
  const [zones, setZones]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [working, setWorking] = useState(false);

  function fetchAll() {
    Promise.all([api.get('/admin/agents'), api.get('/admin/zones')])
      .then(([a, z]) => { setAgents(a); setZones(z); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchAll(); }, []);

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setSuccess(''); setWorking(true);
    try {
      await api.post('/admin/agents', form);
      setSuccess('Agent account created.');
      setForm(EMPTY);
      fetchAll();
    } catch (err) { setError(err.message); }
    finally { setWorking(false); }
  }

  async function toggleAvailability(userId, current) {
    try {
      await api.put(`/admin/agents/${userId}`, { isAvailable: !current });
      fetchAll();
    } catch (err) { setError(err.message); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Delivery Agents</h1>
      <Alert message={error} />
      <Alert type="success" message={success} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Create agent form */}
        <div className="card">
          <h2 className="font-semibold mb-4">Create Agent Account</h2>
          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <div>
              <label className="label">Full Name</label>
              <input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div>
              <label className="label">Phone (optional)</label>
              <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="label">Home Zone (optional)</label>
              <select className="input" value={form.currentZoneId} onChange={e => setForm(f => ({ ...f, currentZoneId: e.target.value }))}>
                <option value="">Select zone...</option>
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Latitude (optional)</label>
                <input className="input" type="number" step="0.0000001" value={form.currentLat} onChange={e => setForm(f => ({ ...f, currentLat: e.target.value }))} />
              </div>
              <div>
                <label className="label">Longitude (optional)</label>
                <input className="input" type="number" step="0.0000001" value={form.currentLng} onChange={e => setForm(f => ({ ...f, currentLng: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={working}>
              {working ? 'Creating...' : 'Create Agent'}
            </button>
          </form>
        </div>

        {/* Agent list */}
        <div className="card">
          <h2 className="font-semibold mb-4">Agents ({agents.length})</h2>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {agents.map(a => (
              <div key={a.userId} className="flex items-start justify-between border rounded-lg p-3">
                <div>
                  <p className="font-medium text-sm">{a.user?.name}</p>
                  <p className="text-xs text-gray-500">{a.user?.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Zone: {a.currentZone?.name || '—'}</p>
                </div>
                <div className="text-right">
                  <span className={`badge text-xs ${a.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {a.isAvailable ? 'Available' : 'Busy'}
                  </span>
                  <button
                    onClick={() => toggleAvailability(a.userId, a.isAvailable)}
                    className="block text-xs text-brand-600 hover:underline mt-1 ml-auto"
                  >
                    Toggle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

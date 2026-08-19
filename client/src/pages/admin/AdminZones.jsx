import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Alert from '../../components/shared/Alert';

export default function AdminZones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Zone form
  const [zoneName, setZoneName] = useState('');
  const [zoneDesc, setZoneDesc] = useState('');
  const [editingZone, setEditingZone] = useState(null);
  const [zoneWorking, setZoneWorking] = useState(false);

  // Pincode form
  const [pincode, setPincode] = useState('');
  const [pincodeZoneId, setPincodeZoneId] = useState('');
  const [pincodeWorking, setPincodeWorking] = useState(false);

  // Pincode map
  const [pincodeMap, setPincodeMap] = useState([]);

  function fetchAll() {
    Promise.all([
      api.get('/admin/zones'),
      api.get('/admin/pincode-map'),
    ]).then(([z, p]) => { setZones(z); setPincodeMap(p); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchAll(); }, []);

  async function handleZoneSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setZoneWorking(true);
    try {
      if (editingZone) {
        await api.put(`/admin/zones/${editingZone.id}`, { name: zoneName, description: zoneDesc });
        setSuccess('Zone updated.');
      } else {
        await api.post('/admin/zones', { name: zoneName, description: zoneDesc });
        setSuccess('Zone created.');
      }
      setZoneName(''); setZoneDesc(''); setEditingZone(null);
      fetchAll();
    } catch (err) { setError(err.message); }
    finally { setZoneWorking(false); }
  }

  async function handlePincodeSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setPincodeWorking(true);
    try {
      await api.post('/admin/pincode-map', { pincode, zoneId: pincodeZoneId });
      setSuccess('Pincode mapped.');
      setPincode(''); setPincodeZoneId('');
      fetchAll();
    } catch (err) { setError(err.message); }
    finally { setPincodeWorking(false); }
  }

  async function deletePin(p) {
    if (!window.confirm(`Remove pincode ${p}?`)) return;
    try { await api.delete(`/admin/pincode-map/${p}`); fetchAll(); }
    catch (err) { setError(err.message); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Zones & Pincode Mapping</h1>
      <Alert message={error} />
      <Alert type="success" message={success} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Zone form */}
        <div className="card">
          <h2 className="font-semibold mb-4">{editingZone ? 'Edit Zone' : 'Add Zone'}</h2>
          <form onSubmit={handleZoneSubmit} className="space-y-3">
            <div>
              <label className="label">Zone Name</label>
              <input className="input" required value={zoneName} onChange={e => setZoneName(e.target.value)} />
            </div>
            <div>
              <label className="label">Description (optional)</label>
              <input className="input" value={zoneDesc} onChange={e => setZoneDesc(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1" disabled={zoneWorking}>
                {editingZone ? 'Update Zone' : 'Add Zone'}
              </button>
              {editingZone && (
                <button type="button" className="btn-secondary" onClick={() => { setEditingZone(null); setZoneName(''); setZoneDesc(''); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Pincode form */}
        <div className="card">
          <h2 className="font-semibold mb-4">Map Pincode to Zone</h2>
          <form onSubmit={handlePincodeSubmit} className="space-y-3">
            <div>
              <label className="label">Pincode</label>
              <input className="input" required value={pincode} onChange={e => setPincode(e.target.value)} />
            </div>
            <div>
              <label className="label">Zone</label>
              <select className="input" required value={pincodeZoneId} onChange={e => setPincodeZoneId(e.target.value)}>
                <option value="">Select zone...</option>
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={pincodeWorking}>Map Pincode</button>
          </form>
        </div>
      </div>

      {/* Zones list */}
      <div className="card mb-6">
        <h2 className="font-semibold mb-4">Zones ({zones.length})</h2>
        <div className="space-y-2">
          {zones.map(z => (
            <div key={z.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <span className="font-medium">{z.name}</span>
                {z.description && <span className="text-sm text-gray-500 ml-2">{z.description}</span>}
                <span className="text-xs text-gray-400 ml-2">({z.pincodes?.length || 0} pincodes)</span>
              </div>
              <button className="text-brand-600 text-sm hover:underline" onClick={() => { setEditingZone(z); setZoneName(z.name); setZoneDesc(z.description || ''); }}>
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pincode map */}
      <div className="card">
        <h2 className="font-semibold mb-4">Pincode Mappings ({pincodeMap.length})</h2>
        <div className="max-h-80 overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="py-2 pr-4">Pincode</th>
                <th className="py-2 pr-4">Zone</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {pincodeMap.map(p => (
                <tr key={p.pincode} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-mono">{p.pincode}</td>
                  <td className="py-2 pr-4">{p.zone?.name}</td>
                  <td className="py-2">
                    <button onClick={() => deletePin(p.pincode)} className="text-red-500 text-xs hover:underline">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

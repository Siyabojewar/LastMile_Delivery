import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Alert from '../../components/shared/Alert';

const EMPTY_CARD = { orderType: 'B2C', zoneRelation: 'intra', baseRate: '', ratePerKg: '', effectiveFrom: '', isActive: true };
const EMPTY_COD  = { orderType: 'B2C', surchargeType: 'flat', value: '', isActive: true };

export default function AdminRateCards() {
  const [cards, setCards] = useState([]);
  const [codRules, setCodRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [cardForm, setCardForm] = useState(EMPTY_CARD);
  const [editingCard, setEditingCard] = useState(null);
  const [codForm, setCodForm] = useState(EMPTY_COD);
  const [editingCod, setEditingCod] = useState(null);
  const [working, setWorking] = useState(false);

  function fetchAll() {
    Promise.all([api.get('/admin/rate-cards'), api.get('/admin/cod-rules')])
      .then(([c, r]) => { setCards(c); setCodRules(r); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchAll(); }, []);

  async function handleCardSubmit(e) {
    e.preventDefault(); setError(''); setSuccess(''); setWorking(true);
    try {
      if (editingCard) {
        await api.put(`/admin/rate-cards/${editingCard.id}`, cardForm);
        setSuccess('Rate card updated.');
      } else {
        await api.post('/admin/rate-cards', cardForm);
        setSuccess('Rate card created.');
      }
      setCardForm(EMPTY_CARD); setEditingCard(null); fetchAll();
    } catch (err) { setError(err.message); }
    finally { setWorking(false); }
  }

  async function handleCodSubmit(e) {
    e.preventDefault(); setError(''); setSuccess(''); setWorking(true);
    try {
      if (editingCod) {
        await api.put(`/admin/cod-rules/${editingCod.id}`, codForm);
        setSuccess('COD rule updated.');
      } else {
        await api.post('/admin/cod-rules', codForm);
        setSuccess('COD rule created.');
      }
      setCodForm(EMPTY_COD); setEditingCod(null); fetchAll();
    } catch (err) { setError(err.message); }
    finally { setWorking(false); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Rate Cards & COD Rules</h1>
      <Alert message={error} />
      <Alert type="success" message={success} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Rate card form */}
        <div className="card">
          <h2 className="font-semibold mb-4">{editingCard ? 'Edit Rate Card' : 'Add Rate Card'}</h2>
          <form onSubmit={handleCardSubmit} className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Order Type</label>
                <select className="input" value={cardForm.orderType} onChange={e => setCardForm(f => ({ ...f, orderType: e.target.value }))}>
                  <option>B2C</option><option>B2B</option>
                </select>
              </div>
              <div>
                <label className="label">Zone Relation</label>
                <select className="input" value={cardForm.zoneRelation} onChange={e => setCardForm(f => ({ ...f, zoneRelation: e.target.value }))}>
                  <option value="intra">Intra-Zone</option>
                  <option value="inter">Inter-Zone</option>
                </select>
              </div>
              <div>
                <label className="label">Base Rate (₹)</label>
                <input className="input" type="number" min="0" step="0.01" required value={cardForm.baseRate}
                  onChange={e => setCardForm(f => ({ ...f, baseRate: e.target.value }))} />
              </div>
              <div>
                <label className="label">Rate per kg (₹)</label>
                <input className="input" type="number" min="0" step="0.01" required value={cardForm.ratePerKg}
                  onChange={e => setCardForm(f => ({ ...f, ratePerKg: e.target.value }))} />
              </div>
              <div>
                <label className="label">Effective From</label>
                <input className="input" type="date" value={cardForm.effectiveFrom}
                  onChange={e => setCardForm(f => ({ ...f, effectiveFrom: e.target.value }))} />
              </div>
              <div className="flex items-center pt-5">
                <input type="checkbox" id="rc-active" checked={cardForm.isActive}
                  onChange={e => setCardForm(f => ({ ...f, isActive: e.target.checked }))} className="mr-2" />
                <label htmlFor="rc-active" className="text-sm">Active</label>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1" disabled={working}>
                {editingCard ? 'Update' : 'Add Rate Card'}
              </button>
              {editingCard && (
                <button type="button" className="btn-secondary" onClick={() => { setEditingCard(null); setCardForm(EMPTY_CARD); }}>Cancel</button>
              )}
            </div>
          </form>
        </div>

        {/* COD rule form */}
        <div className="card">
          <h2 className="font-semibold mb-4">{editingCod ? 'Edit COD Rule' : 'Add COD Surcharge Rule'}</h2>
          <form onSubmit={handleCodSubmit} className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Order Type</label>
                <select className="input" value={codForm.orderType} onChange={e => setCodForm(f => ({ ...f, orderType: e.target.value }))}>
                  <option>B2C</option><option>B2B</option>
                </select>
              </div>
              <div>
                <label className="label">Surcharge Type</label>
                <select className="input" value={codForm.surchargeType} onChange={e => setCodForm(f => ({ ...f, surchargeType: e.target.value }))}>
                  <option value="flat">Flat (₹)</option>
                  <option value="percent">Percent (%)</option>
                </select>
              </div>
              <div>
                <label className="label">Value</label>
                <input className="input" type="number" min="0" step="0.01" required value={codForm.value}
                  onChange={e => setCodForm(f => ({ ...f, value: e.target.value }))} />
              </div>
              <div className="flex items-center pt-5">
                <input type="checkbox" id="cod-active" checked={codForm.isActive}
                  onChange={e => setCodForm(f => ({ ...f, isActive: e.target.checked }))} className="mr-2" />
                <label htmlFor="cod-active" className="text-sm">Active</label>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1" disabled={working}>
                {editingCod ? 'Update' : 'Add COD Rule'}
              </button>
              {editingCod && (
                <button type="button" className="btn-secondary" onClick={() => { setEditingCod(null); setCodForm(EMPTY_COD); }}>Cancel</button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Rate cards table */}
      <div className="card mb-6">
        <h2 className="font-semibold mb-4">Rate Cards ({cards.length})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs text-gray-500 border-b">
              <tr>
                {['Type','Zone Rel','Base Rate','Per Kg','Effective','Active',''].map(h => (
                  <th key={h} className="py-2 pr-4 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cards.map(c => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{c.orderType}</td>
                  <td className="py-2 pr-4 capitalize">{c.zoneRelation}</td>
                  <td className="py-2 pr-4">₹{Number(c.baseRate).toFixed(2)}</td>
                  <td className="py-2 pr-4">₹{Number(c.ratePerKg).toFixed(2)}</td>
                  <td className="py-2 pr-4">{new Date(c.effectiveFrom).toLocaleDateString()}</td>
                  <td className="py-2 pr-4">{c.isActive ? '✓' : '✗'}</td>
                  <td className="py-2">
                    <button className="text-brand-600 text-xs hover:underline" onClick={() => {
                      setEditingCard(c);
                      setCardForm({ orderType: c.orderType, zoneRelation: c.zoneRelation, baseRate: c.baseRate, ratePerKg: c.ratePerKg, effectiveFrom: c.effectiveFrom?.split('T')[0] || '', isActive: c.isActive });
                    }}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* COD rules table */}
      <div className="card">
        <h2 className="font-semibold mb-4">COD Surcharge Rules ({codRules.length})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs text-gray-500 border-b">
              <tr>
                {['Order Type','Type','Value','Active',''].map(h => (
                  <th key={h} className="py-2 pr-4 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codRules.map(r => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{r.orderType}</td>
                  <td className="py-2 pr-4 capitalize">{r.surchargeType}</td>
                  <td className="py-2 pr-4">{r.surchargeType === 'flat' ? `₹${Number(r.value).toFixed(2)}` : `${Number(r.value)}%`}</td>
                  <td className="py-2 pr-4">{r.isActive ? '✓' : '✗'}</td>
                  <td className="py-2">
                    <button className="text-brand-600 text-xs hover:underline" onClick={() => {
                      setEditingCod(r);
                      setCodForm({ orderType: r.orderType, surchargeType: r.surchargeType, value: r.value, isActive: r.isActive });
                    }}>Edit</button>
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

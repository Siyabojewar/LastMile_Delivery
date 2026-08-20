import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import PageHeader from '../../components/shared/PageHeader';
import Alert from '../../components/shared/Alert';
import EmptyState from '../../components/shared/EmptyState';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const EMPTY_CARD = {
  orderType: 'B2C', zoneRelation: 'intra',
  baseRate: '', ratePerKg: '', effectiveFrom: '', isActive: true,
};
const EMPTY_COD = {
  orderType: 'B2C', surchargeType: 'flat', value: '', isActive: true,
};

/* ─── Reusable inline feedback ───────────────────────────────────────────── */
function useMsg() {
  const [msg, setMsg] = useState({ type: '', text: '' });
  function show(type, text) {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  }
  return [msg, show];
}

/* ─── Active / Inactive pill ─────────────────────────────────────────────── */
function ActivePill({ isActive }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-0.5
      ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

/* ─── Zone-relation pill ─────────────────────────────────────────────────── */
function ZonePill({ relation }) {
  return (
    <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 capitalize
      ${relation === 'intra' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
      {relation === 'intra' ? '🔵 Intra-Zone' : '🟠 Inter-Zone'}
    </span>
  );
}

/* ─── Rate Card Form ─────────────────────────────────────────────────────── */
function RateCardForm({ editing, onSubmit, onCancel, working }) {
  const [form, setForm] = useState(editing
    ? {
        orderType:    editing.orderType,
        zoneRelation: editing.zoneRelation,
        baseRate:     editing.baseRate,
        ratePerKg:    editing.ratePerKg,
        effectiveFrom: editing.effectiveFrom?.split('T')[0] || '',
        isActive:     editing.isActive,
      }
    : EMPTY_CARD
  );

  useEffect(() => {
    setForm(editing
      ? {
          orderType:    editing.orderType,
          zoneRelation: editing.zoneRelation,
          baseRate:     editing.baseRate,
          ratePerKg:    editing.ratePerKg,
          effectiveFrom: editing.effectiveFrom?.split('T')[0] || '',
          isActive:     editing.isActive,
        }
      : EMPTY_CARD
    );
  }, [editing]);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  /* Live example calculation */
  const exampleCharge = form.baseRate && form.ratePerKg
    ? (parseFloat(form.baseRate) + 5 * parseFloat(form.ratePerKg)).toFixed(2)
    : null;

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Order Type <span className="text-red-400">*</span></label>
          <select className="input text-sm" value={form.orderType} onChange={e => set('orderType', e.target.value)}>
            <option value="B2C">B2C — Consumer</option>
            <option value="B2B">B2B — Business</option>
          </select>
        </div>
        <div>
          <label className="label">Zone Relation <span className="text-red-400">*</span></label>
          <select className="input text-sm" value={form.zoneRelation} onChange={e => set('zoneRelation', e.target.value)}>
            <option value="intra">Intra-Zone (same zone)</option>
            <option value="inter">Inter-Zone (different zones)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Base Rate (₹) <span className="text-red-400">*</span></label>
          <input
            className="input text-sm" type="number" min="0" step="0.01" required
            placeholder="e.g. 50.00"
            value={form.baseRate}
            onChange={e => set('baseRate', e.target.value)}
          />
          <p className="field-hint">Fixed charge per shipment regardless of weight.</p>
        </div>
        <div>
          <label className="label">Rate per kg (₹) <span className="text-red-400">*</span></label>
          <input
            className="input text-sm" type="number" min="0" step="0.01" required
            placeholder="e.g. 10.00"
            value={form.ratePerKg}
            onChange={e => set('ratePerKg', e.target.value)}
          />
          <p className="field-hint">Multiplied by the chargeable weight.</p>
        </div>
      </div>

      {/* Live example */}
      {exampleCharge && (
        <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-2.5 text-sm text-brand-700 flex items-center gap-2">
          <span>💡</span>
          <span>
            Example: a 5 kg shipment would cost{' '}
            <strong>₹{exampleCharge}</strong>
            {' '}(₹{parseFloat(form.baseRate).toFixed(2)} base + 5 × ₹{parseFloat(form.ratePerKg).toFixed(2)})
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Effective From</label>
          <input
            className="input text-sm" type="date"
            value={form.effectiveFrom}
            onChange={e => set('effectiveFrom', e.target.value)}
          />
          <p className="field-hint">When multiple cards match, the most recent one is used.</p>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            id="rc-active" type="checkbox" className="w-4 h-4 rounded accent-brand-600"
            checked={form.isActive}
            onChange={e => set('isActive', e.target.checked)}
          />
          <label htmlFor="rc-active" className="text-sm font-medium text-gray-700 cursor-pointer">
            Mark as Active
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary flex-1" disabled={working}>
          {working
            ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
            : editing ? '✓ Update Rate Card' : '+ Add Rate Card'
          }
        </button>
        {editing && (
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}

/* ─── COD Rule Form ──────────────────────────────────────────────────────── */
function CodRuleForm({ editing, onSubmit, onCancel, working }) {
  const [form, setForm] = useState(editing
    ? { orderType: editing.orderType, surchargeType: editing.surchargeType, value: editing.value, isActive: editing.isActive }
    : EMPTY_COD
  );

  useEffect(() => {
    setForm(editing
      ? { orderType: editing.orderType, surchargeType: editing.surchargeType, value: editing.value, isActive: editing.isActive }
      : EMPTY_COD
    );
  }, [editing]);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  const exampleBase = 300;
  const exampleSurcharge = form.value
    ? form.surchargeType === 'flat'
      ? parseFloat(form.value).toFixed(2)
      : ((parseFloat(form.value) / 100) * exampleBase).toFixed(2)
    : null;

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Order Type <span className="text-red-400">*</span></label>
          <select className="input text-sm" value={form.orderType} onChange={e => set('orderType', e.target.value)}>
            <option value="B2C">B2C — Consumer</option>
            <option value="B2B">B2B — Business</option>
          </select>
        </div>
        <div>
          <label className="label">Surcharge Type <span className="text-red-400">*</span></label>
          <select className="input text-sm" value={form.surchargeType} onChange={e => set('surchargeType', e.target.value)}>
            <option value="flat">Flat amount (₹)</option>
            <option value="percent">Percentage (%)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">
          Value <span className="text-red-400">*</span>
          <span className="ml-1 text-xs font-normal text-gray-400">
            {form.surchargeType === 'flat' ? '— enter amount in ₹' : '— enter percentage, e.g. 2 for 2%'}
          </span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
            {form.surchargeType === 'flat' ? '₹' : '%'}
          </span>
          <input
            className="input text-sm pl-7" type="number" min="0" step="0.01" required
            placeholder={form.surchargeType === 'flat' ? 'e.g. 50' : 'e.g. 2'}
            value={form.value}
            onChange={e => set('value', e.target.value)}
          />
        </div>
      </div>

      {/* Live example */}
      {exampleSurcharge && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 text-sm text-orange-700 flex items-center gap-2">
          <span>💡</span>
          <span>
            Example: on a ₹{exampleBase} order, COD surcharge = <strong>₹{exampleSurcharge}</strong>
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          id="cod-active" type="checkbox" className="w-4 h-4 rounded accent-brand-600"
          checked={form.isActive}
          onChange={e => set('isActive', e.target.checked)}
        />
        <label htmlFor="cod-active" className="text-sm font-medium text-gray-700 cursor-pointer">
          Mark as Active
        </label>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary flex-1" disabled={working}>
          {working
            ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
            : editing ? '✓ Update COD Rule' : '+ Add COD Rule'
          }
        </button>
        {editing && (
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function AdminRateCards() {
  const [cards, setCards]       = useState([]);
  const [codRules, setCodRules] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editingCard, setEditingCard] = useState(null);
  const [editingCod, setEditingCod]   = useState(null);
  const [cardWorking, setCardWorking] = useState(false);
  const [codWorking, setCodWorking]   = useState(false);
  const [msg, showMsg] = useMsg();

  function fetchAll() {
    return Promise.all([api.get('/admin/rate-cards'), api.get('/admin/cod-rules')])
      .then(([c, r]) => { setCards(c); setCodRules(r); });
  }

  useEffect(() => {
    fetchAll()
      .catch(err => showMsg('error', err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCardSubmit(form) {
    setCardWorking(true);
    try {
      if (editingCard) {
        await api.put(`/admin/rate-cards/${editingCard.id}`, form);
        showMsg('success', 'Rate card updated.');
      } else {
        await api.post('/admin/rate-cards', form);
        showMsg('success', 'Rate card created.');
      }
      setEditingCard(null);
      await fetchAll();
    } catch (err) {
      showMsg('error', err.message);
    } finally {
      setCardWorking(false);
    }
  }

  async function handleCodSubmit(form) {
    setCodWorking(true);
    try {
      if (editingCod) {
        await api.put(`/admin/cod-rules/${editingCod.id}`, form);
        showMsg('success', 'COD rule updated.');
      } else {
        await api.post('/admin/cod-rules', form);
        showMsg('success', 'COD rule created.');
      }
      setEditingCod(null);
      await fetchAll();
    } catch (err) {
      showMsg('error', err.message);
    } finally {
      setCodWorking(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading rate configuration…" />;

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        icon="💰"
        title="Rate Cards &amp; COD Rules"
        description="All rates are admin-controlled — no values are hardcoded. The most recent active card matching the order type and zone relation is applied."
      />

      {msg.text && <Alert type={msg.type} message={msg.text} className="mb-5" />}

      {/* ── How pricing works callout ────────────────────────────────────── */}
      <div className="mb-6 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4">
        <span className="text-xl shrink-0 mt-0.5">ℹ</span>
        <div className="text-sm text-blue-800 space-y-0.5">
          <p className="font-semibold">How pricing is calculated</p>
          <p className="text-blue-700">
            <strong>Volumetric weight</strong> = (L × B × H) / 5000 &nbsp;·&nbsp;
            <strong>Chargeable weight</strong> = max(actual, volumetric) &nbsp;·&nbsp;
            <strong>Base charge</strong> = base_rate + (chargeable_weight × rate_per_kg) &nbsp;·&nbsp;
            COD surcharge applied on top if payment type is COD.
          </p>
        </div>
      </div>

      {/* ── Two forms ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* Rate card form */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <span className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-sm shrink-0">
              📊
            </span>
            <h2 className="font-semibold text-gray-800">
              {editingCard ? `Editing Rate Card` : 'Add Rate Card'}
            </h2>
          </div>
          <RateCardForm
            editing={editingCard}
            onSubmit={handleCardSubmit}
            onCancel={() => setEditingCard(null)}
            working={cardWorking}
          />
        </div>

        {/* COD rule form */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center text-sm shrink-0">
              💵
            </span>
            <h2 className="font-semibold text-gray-800">
              {editingCod ? 'Editing COD Rule' : 'Add COD Surcharge Rule'}
            </h2>
          </div>
          <CodRuleForm
            editing={editingCod}
            onSubmit={handleCodSubmit}
            onCancel={() => setEditingCod(null)}
            working={codWorking}
          />
        </div>
      </div>

      {/* ── Rate Cards table ─────────────────────────────────────────────── */}
      <div className="card mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <span>📊</span> Rate Cards
            <span className="text-xs font-normal text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
              {cards.length}
            </span>
          </h2>
        </div>

        {cards.length === 0 ? (
          <EmptyState
            icon="📊"
            title="No rate cards yet"
            description="Add your first rate card above. Without an active rate card, orders cannot be quoted."
          />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Order Type</th>
                  <th className="table-th">Zone</th>
                  <th className="table-th">Base Rate</th>
                  <th className="table-th">Per kg</th>
                  <th className="table-th">Example (5 kg)</th>
                  <th className="table-th">Effective</th>
                  <th className="table-th">Status</th>
                  <th className="table-th w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cards.map((c, idx) => {
                  const example = (parseFloat(c.baseRate) + 5 * parseFloat(c.ratePerKg)).toFixed(2);
                  return (
                    <tr key={c.id} className={`table-row ${idx % 2 === 1 ? 'table-row-even' : ''}`}>
                      <td className="table-td">
                        <span className="text-xs font-semibold bg-gray-100 text-gray-700 rounded-full px-2.5 py-0.5">
                          {c.orderType}
                        </span>
                      </td>
                      <td className="table-td">
                        <ZonePill relation={c.zoneRelation} />
                      </td>
                      <td className="table-td font-semibold text-gray-700">
                        ₹{Number(c.baseRate).toFixed(2)}
                      </td>
                      <td className="table-td text-gray-700">
                        ₹{Number(c.ratePerKg).toFixed(2)}
                      </td>
                      <td className="table-td">
                        <span className="text-brand-700 font-semibold">₹{example}</span>
                      </td>
                      <td className="table-td text-xs text-gray-500">
                        {c.effectiveFrom
                          ? new Date(c.effectiveFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="table-td">
                        <ActivePill isActive={c.isActive} />
                      </td>
                      <td className="table-td text-right">
                        <button
                          onClick={() => setEditingCard(c)}
                          className="text-xs font-medium text-brand-600 hover:text-brand-800 hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── COD Rules table ──────────────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <span>💵</span> COD Surcharge Rules
            <span className="text-xs font-normal text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
              {codRules.length}
            </span>
          </h2>
        </div>

        {codRules.length === 0 ? (
          <EmptyState
            icon="💵"
            title="No COD rules yet"
            description="Without a COD rule, Cash on Delivery orders carry no surcharge. Add one above if needed."
          />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Order Type</th>
                  <th className="table-th">Surcharge Type</th>
                  <th className="table-th">Value</th>
                  <th className="table-th">Example (₹300 order)</th>
                  <th className="table-th">Status</th>
                  <th className="table-th w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {codRules.map((r, idx) => {
                  const exampleBase = 300;
                  const surcharge = r.surchargeType === 'flat'
                    ? Number(r.value).toFixed(2)
                    : ((parseFloat(r.value) / 100) * exampleBase).toFixed(2);
                  return (
                    <tr key={r.id} className={`table-row ${idx % 2 === 1 ? 'table-row-even' : ''}`}>
                      <td className="table-td">
                        <span className="text-xs font-semibold bg-gray-100 text-gray-700 rounded-full px-2.5 py-0.5">
                          {r.orderType}
                        </span>
                      </td>
                      <td className="table-td">
                        <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 capitalize
                          ${r.surchargeType === 'flat'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-teal-100 text-teal-700'}`}>
                          {r.surchargeType === 'flat' ? '₹ Flat' : '% Percent'}
                        </span>
                      </td>
                      <td className="table-td font-semibold text-gray-700">
                        {r.surchargeType === 'flat'
                          ? `₹${Number(r.value).toFixed(2)}`
                          : `${Number(r.value)}%`}
                      </td>
                      <td className="table-td">
                        <span className="text-orange-700 font-semibold">+₹{surcharge}</span>
                      </td>
                      <td className="table-td">
                        <ActivePill isActive={r.isActive} />
                      </td>
                      <td className="table-td text-right">
                        <button
                          onClick={() => setEditingCod(r)}
                          className="text-xs font-medium text-brand-600 hover:text-brand-800 hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

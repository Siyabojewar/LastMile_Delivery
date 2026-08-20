import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import PageHeader from '../../components/shared/PageHeader';
import FormSection from '../../components/shared/FormSection';
import QuoteCard from '../../components/shared/QuoteCard';
import Alert from '../../components/shared/Alert';

const INITIAL = {
  pickupAddress: '', pickupPincode: '',
  dropAddress: '',   dropPincode: '',
  lengthCm: '', breadthCm: '', heightCm: '',
  actualWeightKg: '',
  orderType: 'B2C', paymentType: 'Prepaid',
  scheduledDate: '',
};

export default function NewOrder() {
  const navigate = useNavigate();
  const [form, setForm]       = useState(INITIAL);
  const [quote, setQuote]     = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    if (quote) setQuote(null); // clear quote if form changes
  }

  async function handleQuote(e) {
    e.preventDefault();
    setError(''); setQuote(null); setLoading(true);
    try {
      const q = await api.post('/orders/quote', {
        pickupPincode: form.pickupPincode, dropPincode: form.dropPincode,
        orderType: form.orderType, paymentType: form.paymentType,
        lengthCm: parseFloat(form.lengthCm), breadthCm: parseFloat(form.breadthCm),
        heightCm: parseFloat(form.heightCm), actualWeightKg: parseFloat(form.actualWeightKg),
      });
      setQuote(q);
      setTimeout(() => document.getElementById('quote-section')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    setError(''); setPlacing(true);
    try {
      const order = await api.post('/orders', {
        ...form,
        lengthCm: parseFloat(form.lengthCm), breadthCm: parseFloat(form.breadthCm),
        heightCm: parseFloat(form.heightCm), actualWeightKg: parseFloat(form.actualWeightKg),
        scheduledDate: form.scheduledDate || undefined,
      });
      navigate(`/customer/orders/${order.id}`);
    } catch (err) {
      setError(err.message);
      setPlacing(false);
    }
  }

  /* Live volumetric preview */
  const vol = (form.lengthCm && form.breadthCm && form.heightCm)
    ? (parseFloat(form.lengthCm) * parseFloat(form.breadthCm) * parseFloat(form.heightCm)) / 5000
    : null;
  const chargeable = vol != null && form.actualWeightKg
    ? Math.max(parseFloat(form.actualWeightKg), vol)
    : null;

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        icon="📦"
        title="Place a New Order"
        description="Fill in the details below to get an instant price quote, then confirm your shipment."
        breadcrumbs={[
          { label: 'My Orders', href: '/customer/orders' },
          { label: 'New Order' },
        ]}
      />

      <form onSubmit={handleQuote} className="space-y-4">

        {/* ── Step 1: Pickup ───────────────────────────────────────── */}
        <FormSection title="Pickup Details" icon="📍" step={1}>
          <div>
            <label htmlFor="pickupAddress" className="label">
              Pickup Address <span className="text-red-400">*</span>
            </label>
            <textarea
              id="pickupAddress" className="input resize-none" rows={2} required
              placeholder="e.g. 12, MG Road, Koregaon Park, Pune"
              value={form.pickupAddress} onChange={e => set('pickupAddress', e.target.value)}
            />
          </div>
          <div className="max-w-xs">
            <label htmlFor="pickupPincode" className="label">
              Pickup Pincode <span className="text-red-400">*</span>
            </label>
            <input
              id="pickupPincode" className="input" type="text" inputMode="numeric"
              pattern="[0-9]{5,6}" required placeholder="e.g. 411001"
              value={form.pickupPincode} onChange={e => set('pickupPincode', e.target.value)}
            />
            <p className="field-hint">Must be a serviceable pincode mapped by admin.</p>
          </div>
        </FormSection>

        {/* ── Step 2: Drop ─────────────────────────────────────────── */}
        <FormSection title="Drop / Delivery Details" icon="🏁" step={2}>
          <div>
            <label htmlFor="dropAddress" className="label">
              Drop Address <span className="text-red-400">*</span>
            </label>
            <textarea
              id="dropAddress" className="input resize-none" rows={2} required
              placeholder="e.g. 45, Baner Road, Baner, Pune"
              value={form.dropAddress} onChange={e => set('dropAddress', e.target.value)}
            />
          </div>
          <div className="max-w-xs">
            <label htmlFor="dropPincode" className="label">
              Drop Pincode <span className="text-red-400">*</span>
            </label>
            <input
              id="dropPincode" className="input" type="text" inputMode="numeric"
              pattern="[0-9]{5,6}" required placeholder="e.g. 411045"
              value={form.dropPincode} onChange={e => set('dropPincode', e.target.value)}
            />
          </div>
        </FormSection>

        {/* ── Step 3: Dimensions ──────────────────────────────────── */}
        <FormSection title="Package Dimensions & Weight" icon="📐" step={3}>
          <p className="text-xs text-gray-400 -mt-1 leading-relaxed">
            Billing uses <strong>chargeable weight</strong> = max(actual, volumetric).
            Volumetric weight = (L × B × H) / 5000.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'lengthCm',       label: 'Length (cm)',      ph: 'e.g. 30' },
              { id: 'breadthCm',      label: 'Breadth (cm)',     ph: 'e.g. 20' },
              { id: 'heightCm',       label: 'Height (cm)',      ph: 'e.g. 15' },
              { id: 'actualWeightKg', label: 'Actual Wt (kg)',   ph: 'e.g. 2.5', step: '0.001' },
            ].map(f => (
              <div key={f.id}>
                <label htmlFor={f.id} className="label">{f.label}</label>
                <input
                  id={f.id} className="input" type="number" min="0.01"
                  step={f.step || '0.1'} required placeholder={f.ph}
                  value={form[f.id]} onChange={e => set(f.id, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Live preview pill */}
          {vol != null && (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <div className="flex items-center gap-2 bg-brand-50 border border-brand-200
                              rounded-xl px-3.5 py-2 text-xs text-brand-700 font-semibold
                              shadow-card animate-scale-in">
                <span>💡</span>
                <span>Volumetric ≈ <strong>{vol.toFixed(3)} kg</strong></span>
                {chargeable != null && (
                  <>
                    <span className="text-brand-300">·</span>
                    <span>Chargeable ≈ <strong>{chargeable.toFixed(3)} kg</strong></span>
                    {chargeable > parseFloat(form.actualWeightKg) && (
                      <span className="bg-orange-100 text-orange-700 rounded-lg px-1.5 py-0.5
                                       ring-1 ring-orange-200 font-bold text-[10px]">
                        volumetric wins
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </FormSection>

        {/* ── Step 4: Options ─────────────────────────────────────── */}
        <FormSection title="Shipment & Payment Options" icon="💳" step={4}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="orderType" className="label">Order Type</label>
              <select id="orderType" className="input" value={form.orderType}
                onChange={e => set('orderType', e.target.value)}>
                <option value="B2C">B2C — Business to Consumer</option>
                <option value="B2B">B2B — Business to Business</option>
              </select>
              <p className="field-hint">Determines which rate card is applied.</p>
            </div>
            <div>
              <label htmlFor="paymentType" className="label">Payment Type</label>
              <select id="paymentType" className="input" value={form.paymentType}
                onChange={e => set('paymentType', e.target.value)}>
                <option value="Prepaid">Prepaid — pay online</option>
                <option value="COD">COD — Cash on Delivery</option>
              </select>
              <p className="field-hint">COD orders carry an extra surcharge.</p>
            </div>
          </div>
          <div className="max-w-xs">
            <label htmlFor="scheduledDate" className="label">
              Preferred Pickup Date
              <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="scheduledDate" className="input" type="date"
              min={new Date().toISOString().split('T')[0]}
              value={form.scheduledDate} onChange={e => set('scheduledDate', e.target.value)}
            />
          </div>
        </FormSection>

        {error && <Alert message={error} />}

        <button type="submit" className="btn-primary w-full h-12 text-base btn-lg" disabled={loading}>
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Calculating your quote…</>
          ) : (
            <>Calculate Quote <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></>
          )}
        </button>
      </form>

      {/* ── Quote result ─────────────────────────────────────────── */}
      {quote && (
        <div id="quote-section" className="mt-8 animate-slide-up">
          <div className="divider-label my-4">
            Review Your Quote
          </div>
          <QuoteCard quote={quote} onConfirm={handleConfirm} loading={placing} />
          {error && <Alert message={error} className="mt-3" />}
        </div>
      )}
    </div>
  );
}

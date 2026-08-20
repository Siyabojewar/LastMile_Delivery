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
  const [form, setForm]     = useState(INITIAL);
  const [quote, setQuote]   = useState(null);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    // Clear quote when inputs change so user must re-quote
    if (quote) setQuote(null);
  }

  async function handleQuote(e) {
    e.preventDefault();
    setError('');
    setQuote(null);
    setLoading(true);
    try {
      const q = await api.post('/orders/quote', {
        pickupPincode:  form.pickupPincode,
        dropPincode:    form.dropPincode,
        orderType:      form.orderType,
        paymentType:    form.paymentType,
        lengthCm:       parseFloat(form.lengthCm),
        breadthCm:      parseFloat(form.breadthCm),
        heightCm:       parseFloat(form.heightCm),
        actualWeightKg: parseFloat(form.actualWeightKg),
      });
      setQuote(q);
      // Scroll to quote on mobile
      setTimeout(() => document.getElementById('quote-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    setError('');
    setPlacing(true);
    try {
      const order = await api.post('/orders', {
        ...form,
        lengthCm:       parseFloat(form.lengthCm),
        breadthCm:      parseFloat(form.breadthCm),
        heightCm:       parseFloat(form.heightCm),
        actualWeightKg: parseFloat(form.actualWeightKg),
        scheduledDate:  form.scheduledDate || undefined,
      });
      navigate(`/customer/orders/${order.id}`);
    } catch (err) {
      setError(err.message);
      setPlacing(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        icon="📦"
        title="Place a New Order"
        description="Fill in the details below to get an instant quote, then confirm your shipment."
        back
        backLabel="My Orders"
      />

      <form onSubmit={handleQuote} className="space-y-4">

        {/* ── Section 1: Pickup ─────────────────────────────── */}
        <FormSection title="Pickup Details" icon="📍" step={1}>
          <div>
            <label htmlFor="pickupAddress" className="label">
              Pickup Address <span className="text-red-400">*</span>
            </label>
            <textarea
              id="pickupAddress"
              className="input resize-none"
              rows={2}
              required
              placeholder="e.g. 12, MG Road, Koregaon Park, Pune"
              value={form.pickupAddress}
              onChange={e => set('pickupAddress', e.target.value)}
            />
          </div>
          <div className="max-w-xs">
            <label htmlFor="pickupPincode" className="label">
              Pickup Pincode <span className="text-red-400">*</span>
            </label>
            <input
              id="pickupPincode"
              className="input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{5,6}"
              required
              placeholder="e.g. 411001"
              value={form.pickupPincode}
              onChange={e => set('pickupPincode', e.target.value)}
            />
            <p className="field-hint">Must be a serviceable pincode mapped by admin.</p>
          </div>
        </FormSection>

        {/* ── Section 2: Drop ───────────────────────────────── */}
        <FormSection title="Drop / Delivery Details" icon="🏁" step={2}>
          <div>
            <label htmlFor="dropAddress" className="label">
              Drop Address <span className="text-red-400">*</span>
            </label>
            <textarea
              id="dropAddress"
              className="input resize-none"
              rows={2}
              required
              placeholder="e.g. 45, Baner Road, Baner, Pune"
              value={form.dropAddress}
              onChange={e => set('dropAddress', e.target.value)}
            />
          </div>
          <div className="max-w-xs">
            <label htmlFor="dropPincode" className="label">
              Drop Pincode <span className="text-red-400">*</span>
            </label>
            <input
              id="dropPincode"
              className="input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{5,6}"
              required
              placeholder="e.g. 411045"
              value={form.dropPincode}
              onChange={e => set('dropPincode', e.target.value)}
            />
          </div>
        </FormSection>

        {/* ── Section 3: Package Dimensions ─────────────────── */}
        <FormSection title="Package Dimensions &amp; Weight" icon="📐" step={3}>
          <p className="text-xs text-gray-400 -mt-1">
            Volumetric weight = (L × B × H) / 5000. You are billed on whichever is higher — actual or volumetric.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label htmlFor="lengthCm" className="label">Length (cm)</label>
              <input
                id="lengthCm"
                className="input"
                type="number" min="0.1" step="0.1" required
                placeholder="e.g. 30"
                value={form.lengthCm}
                onChange={e => set('lengthCm', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="breadthCm" className="label">Breadth (cm)</label>
              <input
                id="breadthCm"
                className="input"
                type="number" min="0.1" step="0.1" required
                placeholder="e.g. 20"
                value={form.breadthCm}
                onChange={e => set('breadthCm', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="heightCm" className="label">Height (cm)</label>
              <input
                id="heightCm"
                className="input"
                type="number" min="0.1" step="0.1" required
                placeholder="e.g. 15"
                value={form.heightCm}
                onChange={e => set('heightCm', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="actualWeightKg" className="label">Actual Weight (kg)</label>
              <input
                id="actualWeightKg"
                className="input"
                type="number" min="0.01" step="0.001" required
                placeholder="e.g. 2.5"
                value={form.actualWeightKg}
                onChange={e => set('actualWeightKg', e.target.value)}
              />
            </div>
          </div>
          {/* Live volumetric preview */}
          {form.lengthCm && form.breadthCm && form.heightCm && (
            <div className="mt-1 text-xs text-gray-500 bg-white rounded-lg border border-gray-200 px-3 py-2 flex items-center gap-2">
              <span className="text-brand-600 font-medium">Preview:</span>
              Volumetric weight ≈{' '}
              <strong>
                {((parseFloat(form.lengthCm) * parseFloat(form.breadthCm) * parseFloat(form.heightCm)) / 5000).toFixed(3)} kg
              </strong>
              {form.actualWeightKg && (
                <>
                  {' '}·{' '}Chargeable ≈{' '}
                  <strong>
                    {Math.max(
                      parseFloat(form.actualWeightKg),
                      (parseFloat(form.lengthCm) * parseFloat(form.breadthCm) * parseFloat(form.heightCm)) / 5000
                    ).toFixed(3)} kg
                  </strong>
                </>
              )}
            </div>
          )}
        </FormSection>

        {/* ── Section 4: Order & Payment Type ──────────────── */}
        <FormSection title="Shipment &amp; Payment Options" icon="💳" step={4}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="orderType" className="label">Order Type</label>
              <select
                id="orderType"
                className="input"
                value={form.orderType}
                onChange={e => set('orderType', e.target.value)}
              >
                <option value="B2C">B2C — Business to Consumer</option>
                <option value="B2B">B2B — Business to Business</option>
              </select>
              <p className="field-hint">Affects which rate card is applied.</p>
            </div>
            <div>
              <label htmlFor="paymentType" className="label">Payment Type</label>
              <select
                id="paymentType"
                className="input"
                value={form.paymentType}
                onChange={e => set('paymentType', e.target.value)}
              >
                <option value="Prepaid">Prepaid — pay now online</option>
                <option value="COD">COD — Cash on Delivery</option>
              </select>
              <p className="field-hint">COD orders carry an additional surcharge.</p>
            </div>
          </div>
          <div className="max-w-xs">
            <label htmlFor="scheduledDate" className="label">
              Preferred Pickup Date
              <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="scheduledDate"
              className="input"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={form.scheduledDate}
              onChange={e => set('scheduledDate', e.target.value)}
            />
          </div>
        </FormSection>

        {error && <Alert message={error} />}

        <button
          type="submit"
          className="btn-primary w-full h-12 text-base"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Calculating your quote…
            </>
          ) : (
            <>
              <span>Calculate Quote</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* ── Quote result ──────────────────────────────────── */}
      {quote && (
        <div id="quote-section" className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-2">Review Your Quote</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <QuoteCard quote={quote} onConfirm={handleConfirm} loading={placing} />
          {error && <Alert message={error} className="mt-3" />}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import Alert from '../../components/shared/Alert';

const INITIAL = {
  pickupAddress: '', pickupPincode: '',
  dropAddress: '', dropPincode: '',
  lengthCm: '', breadthCm: '', heightCm: '',
  actualWeightKg: '',
  orderType: 'B2C', paymentType: 'Prepaid',
  scheduledDate: '',
};

export default function NewOrder() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleQuote(e) {
    e.preventDefault();
    setError('');
    setQuote(null);
    setLoading(true);
    try {
      const q = await api.post('/orders/quote', {
        pickupPincode: form.pickupPincode,
        dropPincode: form.dropPincode,
        orderType: form.orderType,
        paymentType: form.paymentType,
        lengthCm: parseFloat(form.lengthCm),
        breadthCm: parseFloat(form.breadthCm),
        heightCm: parseFloat(form.heightCm),
        actualWeightKg: parseFloat(form.actualWeightKg),
      });
      setQuote(q);
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
        lengthCm: parseFloat(form.lengthCm),
        breadthCm: parseFloat(form.breadthCm),
        heightCm: parseFloat(form.heightCm),
        actualWeightKg: parseFloat(form.actualWeightKg),
        scheduledDate: form.scheduledDate || undefined,
      });
      navigate(`/customer/orders/${order.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Place New Order</h1>

      <form onSubmit={handleQuote} className="card space-y-5">
        <h2 className="text-lg font-semibold text-gray-800">Pickup Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Pickup Address</label>
            <input className="input" required value={form.pickupAddress}
              onChange={e => set('pickupAddress', e.target.value)} />
          </div>
          <div>
            <label className="label">Pickup Pincode</label>
            <input className="input" required value={form.pickupPincode}
              onChange={e => set('pickupPincode', e.target.value)} />
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-800">Drop Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Drop Address</label>
            <input className="input" required value={form.dropAddress}
              onChange={e => set('dropAddress', e.target.value)} />
          </div>
          <div>
            <label className="label">Drop Pincode</label>
            <input className="input" required value={form.dropPincode}
              onChange={e => set('dropPincode', e.target.value)} />
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-800">Package Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Length (cm)</label>
            <input className="input" type="number" min="0.1" step="0.1" required value={form.lengthCm}
              onChange={e => set('lengthCm', e.target.value)} />
          </div>
          <div>
            <label className="label">Breadth (cm)</label>
            <input className="input" type="number" min="0.1" step="0.1" required value={form.breadthCm}
              onChange={e => set('breadthCm', e.target.value)} />
          </div>
          <div>
            <label className="label">Height (cm)</label>
            <input className="input" type="number" min="0.1" step="0.1" required value={form.heightCm}
              onChange={e => set('heightCm', e.target.value)} />
          </div>
          <div>
            <label className="label">Actual Weight (kg)</label>
            <input className="input" type="number" min="0.1" step="0.001" required value={form.actualWeightKg}
              onChange={e => set('actualWeightKg', e.target.value)} />
          </div>
          <div>
            <label className="label">Order Type</label>
            <select className="input" value={form.orderType} onChange={e => set('orderType', e.target.value)}>
              <option value="B2C">B2C</option>
              <option value="B2B">B2B</option>
            </select>
          </div>
          <div>
            <label className="label">Payment Type</label>
            <select className="input" value={form.paymentType} onChange={e => set('paymentType', e.target.value)}>
              <option value="Prepaid">Prepaid</option>
              <option value="COD">Cash on Delivery (COD)</option>
            </select>
          </div>
          <div>
            <label className="label">Scheduled Date (optional)</label>
            <input className="input" type="date" value={form.scheduledDate}
              onChange={e => set('scheduledDate', e.target.value)} />
          </div>
        </div>

        <Alert message={error} />

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Calculating...' : 'Get Quote'}
        </button>
      </form>

      {quote && (
        <div className="card mt-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Your Quote</h2>
          <div className="space-y-2 text-sm">
            <Row label="Zone Relation" value={quote.zoneRelation === 'intra' ? 'Intra-Zone' : 'Inter-Zone'} />
            <Row label="Pickup Zone"   value={quote.pickupZone?.name} />
            <Row label="Drop Zone"     value={quote.dropZone?.name} />
            <Row label="Volumetric Weight" value={`${quote.volumetricWeightKg} kg`} />
            <Row label="Chargeable Weight" value={`${quote.chargeableWeightKg} kg`} />
            <Row label="Base Charge"   value={`₹${Number(quote.baseCharge).toFixed(2)}`} />
            {quote.codSurchargeAmount > 0 && (
              <Row label="COD Surcharge" value={`₹${Number(quote.codSurchargeAmount).toFixed(2)}`} />
            )}
            <div className="border-t pt-2 mt-2">
              <Row label="Total Charge" value={`₹${Number(quote.totalCharge).toFixed(2)}`} bold />
            </div>
          </div>
          <button className="btn-primary w-full mt-6" onClick={handleConfirm} disabled={placing}>
            {placing ? 'Placing order...' : `Confirm Order — ₹${Number(quote.totalCharge).toFixed(2)}`}
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? 'font-bold text-base text-gray-900' : 'font-medium text-gray-800'}>{value}</span>
    </div>
  );
}

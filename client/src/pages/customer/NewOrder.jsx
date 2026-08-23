import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import PageHeader from '../../components/shared/PageHeader';
import FormSection from '../../components/shared/FormSection';
import FormField from '../../components/shared/FormField';
import Select from '../../components/shared/Select';
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
  const [form, setForm] = useState(INITIAL);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  function validateField(name, value) {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'pickupAddress':
      case 'dropAddress':
        if (!value.trim()) {
          errors[name] = 'Address is required';
        } else if (value.trim().length < 10) {
          errors[name] = 'Please enter a complete address';
        } else {
          delete errors[name];
        }
        break;
      case 'pickupPincode':
      case 'dropPincode':
        if (!value) {
          errors[name] = 'Pincode is required';
        } else if (!/^[0-9]{5,6}$/.test(value)) {
          errors[name] = 'Please enter a valid 5-6 digit pincode';
        } else {
          delete errors[name];
        }
        break;
      case 'lengthCm':
      case 'breadthCm':
      case 'heightCm':
        if (!value) {
          errors[name] = 'Dimension is required';
        } else if (parseFloat(value) <= 0) {
          errors[name] = 'Must be greater than 0';
        } else if (parseFloat(value) > 500) {
          errors[name] = 'Maximum 500cm allowed';
        } else {
          delete errors[name];
        }
        break;
      case 'actualWeightKg':
        if (!value) {
          errors[name] = 'Weight is required';
        } else if (parseFloat(value) <= 0) {
          errors[name] = 'Must be greater than 0';
        } else if (parseFloat(value) > 100) {
          errors[name] = 'Maximum 100kg allowed';
        } else {
          delete errors[name];
        }
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    validateField(k, v);
    if (quote) setQuote(null); // clear quote if form changes
    if (error) setError(''); // clear general error when user starts typing
  }

  async function handleQuote(e) {
    e.preventDefault();
    setError(''); 
    setQuote(null);
    
    // Validate all required fields
    const requiredFields = ['pickupAddress', 'pickupPincode', 'dropAddress', 'dropPincode', 'lengthCm', 'breadthCm', 'heightCm', 'actualWeightKg'];
    let hasErrors = false;
    
    requiredFields.forEach(field => {
      if (!validateField(field, form[field])) {
        hasErrors = true;
      }
    });
    
    if (hasErrors) {
      setError('Please fix the errors above before calculating quote.');
      return;
    }
    
    setLoading(true);
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
      setError(err.message || 'Failed to calculate quote. Please try again.');
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
      setError(err.message || 'Failed to place order. Please try again.');
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

      <form onSubmit={handleQuote} className="space-y-6">

        {/* Step 1: Pickup */}
        <FormSection 
          title="Pickup Details" 
          icon="📍" 
          step={1}
          description="Where should we collect your package?"
        >
          <FormField
            id="pickupAddress"
            label="Pickup Address"
            required
            error={fieldErrors.pickupAddress}
            hint="Enter the complete pickup address with landmarks"
          >
            <textarea className="input resize-none"
              rows={3}
              placeholder="e.g. 12, MG Road, Koregaon Park, Pune - 411001"
              value={form.pickupAddress} 
              onChange={e => set('pickupAddress', e.target.value)}
            />
          </FormField>
          
          <FormField
            id="pickupPincode"
            label="Pickup Pincode"
            required
            error={fieldErrors.pickupPincode}
            hint="Must be a serviceable pincode mapped by admin"
            className="max-w-xs"
          >
            <input className="input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{5,6}"
              placeholder="e.g. 411001"
              maxLength={6}
              value={form.pickupPincode} 
              onChange={e => set('pickupPincode', e.target.value)}
            />
          </FormField>
        </FormSection>

        {/* Step 2: Drop */}
        <FormSection 
          title="Drop / Delivery Details" 
          icon="🏁" 
          step={2}
          description="Where should we deliver your package?"
        >
          <FormField
            id="dropAddress"
            label="Drop Address"
            required
            error={fieldErrors.dropAddress}
            hint="Enter the complete delivery address with landmarks"
          >
            <textarea className="input resize-none"
              rows={3}
              placeholder="e.g. 45, Baner Road, Baner, Pune - 411045"
              value={form.dropAddress} 
              onChange={e => set('dropAddress', e.target.value)}
            />
          </FormField>
          
          <FormField
            id="dropPincode"
            label="Drop Pincode"
            required
            error={fieldErrors.dropPincode}
            hint="Delivery location pincode"
            className="max-w-xs"
          >
            <input className="input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{5,6}"
              placeholder="e.g. 411045"
              maxLength={6}
              value={form.dropPincode} 
              onChange={e => set('dropPincode', e.target.value)}
            />
          </FormField>
        </FormSection>

        {/* Step 3: Dimensions */}
        <FormSection 
          title="Package Dimensions & Weight" 
          icon="📐" 
          step={3}
          description="Billing uses chargeable weight = max(actual, volumetric). Volumetric weight = (L × B × H) / 5000."
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <FormField
              id="lengthCm"
              label="Length (cm)"
              required
              error={fieldErrors.lengthCm}
            >
              <input className="input"
                type="number"
                min="0.1"
                step="0.1"
                placeholder="e.g. 30"
                value={form.lengthCm} 
                onChange={e => set('lengthCm', e.target.value)}
              />
            </FormField>
            
            <FormField
              id="breadthCm"
              label="Breadth (cm)"
              required
              error={fieldErrors.breadthCm}
            >
              <input className="input"
                type="number"
                min="0.1"
                step="0.1"
                placeholder="e.g. 20"
                value={form.breadthCm} 
                onChange={e => set('breadthCm', e.target.value)}
              />
            </FormField>
            
            <FormField
              id="heightCm"
              label="Height (cm)"
              required
              error={fieldErrors.heightCm}
            >
              <input className="input"
                type="number"
                min="0.1"
                step="0.1"
                placeholder="e.g. 15"
                value={form.heightCm} 
                onChange={e => set('heightCm', e.target.value)}
              />
            </FormField>
            
            <FormField
              id="actualWeightKg"
              label="Actual Wt (kg)"
              required
              error={fieldErrors.actualWeightKg}
            >
              <input className="input"
                type="number"
                min="0.001"
                step="0.001"
                placeholder="e.g. 2.5"
                value={form.actualWeightKg} 
                onChange={e => set('actualWeightKg', e.target.value)}
              />
            </FormField>
          </div>

          {/* Live preview pill */}
          {vol != null && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
                <span className="text-base">💡</span>
                <span>Weight Calculation Preview</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Volumetric:</span>
                  <span className="ml-1 font-semibold text-gray-900">{vol.toFixed(3)} kg</span>
                </div>
                {chargeable != null && (
                  <>
                    <div>
                      <span className="text-gray-500">Chargeable:</span>
                      <span className="ml-1 font-semibold text-gray-900">{chargeable.toFixed(3)} kg</span>
                    </div>
                    {chargeable > parseFloat(form.actualWeightKg) && (
                      <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 rounded-lg px-2 py-1 text-xs font-medium">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Volumetric weight applies
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </FormSection>

        {/* Step 4: Options */}
        <FormSection 
          title="Shipment & Payment Options" 
          icon="💳" 
          step={4}
          description="Choose your preferred shipment and payment settings"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              id="orderType"
              label="Order Type"
              hint="Determines which rate card is applied"
            >
              <Select 
                value={form.orderType}
                onChange={e => set('orderType', e.target.value)}
                options={[
                  { value: 'B2C', label: 'B2C — Business to Consumer' },
                  { value: 'B2B', label: 'B2B — Business to Business' }
                ]}
              />
            </FormField>
            
            <FormField
              id="paymentType"
              label="Payment Type"
              hint="COD orders carry an extra surcharge"
            >
              <Select 
                value={form.paymentType}
                onChange={e => set('paymentType', e.target.value)}
                options={[
                  { value: 'Prepaid', label: 'Prepaid — pay online' },
                  { value: 'COD', label: 'COD — Cash on Delivery' }
                ]}
              />
            </FormField>
          </div>
          
          <FormField
            id="scheduledDate"
            label="Preferred Pickup Date"
            optional
            hint="Leave empty for immediate pickup scheduling"
            className="max-w-sm"
          >
            <input className="input"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={form.scheduledDate} 
              onChange={e => set('scheduledDate', e.target.value)}
            />
          </FormField>
        </FormSection>

        {error && (
          <Alert 
            type="error" 
            message={error} 
            dismissible
            onDismiss={() => setError('')}
          />
        )}

        <button 
          type="submit" 
          className="btn-primary w-full h-12 text-base" 
          disabled={loading || Object.keys(fieldErrors).length > 0}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Calculating your quote…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calculate Quote
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* Quote result */}
      {quote && (
        <div id="quote-section" className="mt-8 animate-slide-up">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 
                           text-emerald-700 rounded-full border border-emerald-200 
                           font-medium">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Review Your Quote
            </div>
          </div>
          <QuoteCard quote={quote} onConfirm={handleConfirm} loading={placing} />
          {error && (
            <Alert 
              type="error" 
              message={error} 
              className="mt-4"
              dismissible
              onDismiss={() => setError('')}
            />
          )}
        </div>
      )}
    </div>
  );
}

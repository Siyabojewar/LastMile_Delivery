import React, { useState } from 'react';

function PricingTooltip() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(v => !v)}
        className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 text-xs font-bold
                   hover:bg-blue-300 transition-colors flex items-center justify-center
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        aria-label="How is this price calculated?"
      >
        i
      </button>
      {open && (
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-50 w-72
                        bg-gray-900 text-white text-xs rounded-xl px-4 py-3 shadow-2xl
                        leading-relaxed pointer-events-none">
          <p className="font-semibold mb-1 text-blue-300">How is my price calculated?</p>
          <p>
            Your price is based on your <strong>package size and weight</strong>, whether pickup and delivery are in the <strong>same area or different areas</strong>, and your <strong>payment method</strong>.
            Larger or heavier packages, cross-area deliveries, and Cash on Delivery orders may cost more.
          </p>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
                          border-l-[6px] border-r-[6px] border-t-[6px]
                          border-l-transparent border-r-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

export default function QuoteCard({ quote, onConfirm, loading }) {
  if (!quote) return null;

  const rows = [
    { label: 'Pickup Zone',       value: quote.pickupZone?.name || '—' },
    { label: 'Drop Zone',         value: quote.dropZone?.name   || '—' },
    { label: 'Zone Relation',     value: quote.zoneRelation === 'intra' ? '🔵 Same zone' : '🟠 Different zones' },
    { label: 'Volumetric Weight', value: `${quote.volumetricWeightKg} kg` },
    { label: 'Chargeable Weight', value: `${quote.chargeableWeightKg} kg`, note: 'max(actual, volumetric)' },
    { label: 'Base Charge',       value: `₹${Number(quote.baseCharge).toFixed(2)}` },
    ...(quote.codSurchargeAmount > 0
      ? [{ label: 'COD Surcharge', value: `₹${Number(quote.codSurchargeAmount).toFixed(2)}`, highlight: true }]
      : []),
  ];

  return (
    <div className="rounded-3xl border-2 border-blue-200 overflow-hidden shadow-lg animate-slide-up">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-800 px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-0.5">
            Your Instant Quote
          </p>
          <p className="text-white text-3xl font-extrabold tracking-tight">
            ₹{Number(quote.totalCharge).toFixed(2)}
          </p>
          <p className="text-blue-300 text-xs mt-1">
            {quote.zoneRelation === 'intra' ? '🔵 Same zone' : '🟠 Different zones'} ·{' '}
            {quote.chargeableWeightKg} kg chargeable
          </p>
        </div>
        <div className="text-5xl select-none opacity-80">🧾</div>
      </div>

      {/* Breakdown */}
      <div className="bg-white px-6 py-5 space-y-2.5">
        {/* Section heading with info tooltip */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Price Breakdown</span>
          <PricingTooltip />
        </div>

        {rows.map(row => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {row.label}
              {row.note && <span className="ml-1 text-xs text-gray-400 font-normal">({row.note})</span>}
            </span>
            <span className={`font-bold ${row.highlight ? 'text-orange-600' : 'text-gray-800'}`}>
              {row.value}
            </span>
          </div>
        ))}

        {/* Total row */}
        <div className="flex items-center justify-between pt-3 mt-1 border-t-2 border-blue-100">
          <span className="font-bold text-gray-800 text-base">Total Charge</span>
          <span className="text-2xl font-extrabold text-blue-700 tracking-tight">
            ₹{Number(quote.totalCharge).toFixed(2)}
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white px-6 pb-6">
        <button
          onClick={onConfirm}
          disabled={loading}
          className="btn-primary w-full h-12 text-base btn-lg shadow-md justify-center"
        >
          {loading ? (
            <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Placing order…</>
          ) : (
            <>Confirm &amp; Place Order <span className="text-blue-200 font-normal ml-1">— ₹{Number(quote.totalCharge).toFixed(2)}</span></>
          )}
        </button>
        <p className="text-center text-xs text-gray-400 mt-2.5">
          You won't be charged until your delivery is confirmed
        </p>
      </div>
    </div>
  );
}

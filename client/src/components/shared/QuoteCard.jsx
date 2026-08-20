import React from 'react';

/**
 * Prominent quote breakdown card shown before order confirmation.
 *
 * Props:
 *   quote   – the quote object returned by POST /orders/quote
 *   onConfirm – callback when user clicks "Confirm Order"
 *   loading – show spinner on the confirm button
 */
export default function QuoteCard({ quote, onConfirm, loading }) {
  if (!quote) return null;

  const rows = [
    { label: 'Pickup Zone',        value: quote.pickupZone?.name || '—' },
    { label: 'Drop Zone',          value: quote.dropZone?.name   || '—' },
    { label: 'Zone Relation',      value: quote.zoneRelation === 'intra' ? '🔵 Intra-Zone' : '🟠 Inter-Zone' },
    { label: 'Volumetric Weight',  value: `${quote.volumetricWeightKg} kg` },
    { label: 'Chargeable Weight',  value: `${quote.chargeableWeightKg} kg`, note: 'max(actual, volumetric)' },
    { label: 'Base Charge',        value: `₹${Number(quote.baseCharge).toFixed(2)}` },
    ...(quote.codSurchargeAmount > 0
      ? [{ label: 'COD Surcharge', value: `₹${Number(quote.codSurchargeAmount).toFixed(2)}`, highlight: true }]
      : []),
  ];

  return (
    <div className="rounded-2xl border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-brand-600 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest">Your Quote</p>
          <p className="text-white text-2xl font-bold mt-0.5">
            ₹{Number(quote.totalCharge).toFixed(2)}
          </p>
        </div>
        <div className="text-4xl select-none">🧾</div>
      </div>

      {/* Breakdown */}
      <div className="px-6 py-4 space-y-2">
        {rows.map(row => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {row.label}
              {row.note && <span className="ml-1 text-xs text-gray-400">({row.note})</span>}
            </span>
            <span className={`font-semibold ${row.highlight ? 'text-orange-600' : 'text-gray-800'}`}>
              {row.value}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between text-sm border-t border-brand-200 pt-3 mt-3">
          <span className="font-semibold text-gray-700">Total Charge</span>
          <span className="text-xl font-bold text-brand-700">
            ₹{Number(quote.totalCharge).toFixed(2)}
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-5">
        <button
          onClick={onConfirm}
          disabled={loading}
          className="btn-primary w-full h-12 text-base justify-center"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Placing order…
            </>
          ) : (
            <>
              <span>Confirm &amp; Place Order</span>
              <span className="ml-1 text-blue-200 font-normal">— ₹{Number(quote.totalCharge).toFixed(2)}</span>
            </>
          )}
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">
          You won't be charged until delivery is confirmed
        </p>
      </div>
    </div>
  );
}

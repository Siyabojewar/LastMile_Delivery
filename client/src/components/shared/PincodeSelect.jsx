import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../utils/api';

/**
 * Searchable dropdown for serviceable pincodes.
 * Fetches from /orders/serviceable-pincodes on mount.
 *
 * Props:
 *   value      – selected pincode string
 *   onChange   – called with pincode string when selected
 *   id         – input id
 *   error      – boolean or string, shows error state
 *   placeholder
 */
export default function PincodeSelect({ value, onChange, id, error = false, placeholder = 'Search pincode…' }) {
  const [pincodes, setPincodes] = useState([]);
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [loadErr, setLoadErr] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    api.get('/orders/serviceable-pincodes')
      .then(data => setPincodes(data))
      .catch(() => setLoadErr(true));
  }, []);

  // Sync query when value changes externally (e.g. form reset)
  useEffect(() => {
    if (!value) setQuery('');
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = pincodes.filter(p =>
    p.pincode.includes(query.trim()) ||
    p.zoneName.toLowerCase().includes(query.trim().toLowerCase())
  ).slice(0, 40); // cap list to 40 for perf

  function select(pincode) {
    setQuery(pincode);
    onChange(pincode);
    setOpen(false);
  }

  if (loadErr) {
    // Fall back to plain text input if API fails
    return (
      <input
        id={id}
        className={`input ${error ? 'input-error' : ''}`}
        type="text"
        inputMode="numeric"
        pattern="[0-9]{5,6}"
        placeholder="e.g. 411001"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    );
  }

  return (
    <div className="relative" ref={wrapRef}>
      <div className="relative">
        <input
          id={id}
          className={`input pr-8 ${error ? 'input-error' : ''}`}
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={query}
          autoComplete="off"
          onChange={e => {
            setQuery(e.target.value);
            onChange(''); // clear selected value while typing
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {/* dropdown arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl">
          {pincodes.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">Loading pincodes…</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">No serviceable pincodes match "{query}"</div>
          ) : (
            filtered.map(p => (
              <button
                key={p.pincode}
                type="button"
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between gap-2 transition-colors"
                onClick={() => select(p.pincode)}
              >
                <span className="font-mono font-semibold">{p.pincode}</span>
                {p.zoneName && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{p.zoneName}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">

        {/* ── Brand header ──────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-hero-gradient text-white text-3xl mb-4 shadow-card-lg
                          ring-4 ring-brand-200 select-none">
            🔑
          </div>
          <h1 className="page-title">Reset your password</h1>
          <p className="page-subtitle">We'll send you a reset link via email</p>
        </div>

        {/* ── Card ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-card-lg border border-gray-100 p-8">

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200
                            px-4 py-3 animate-scale-in">
              <span className="text-red-500 font-bold mt-px shrink-0">⚠</span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center
                              mx-auto mb-4 text-emerald-600 text-xl">
                ✓
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Check your email</h3>
              <p className="text-sm text-gray-600 mb-6">
                We've sent password reset instructions to{' '}
                <span className="font-semibold text-gray-900">{email}</span>
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <button 
                onClick={() => { setSuccess(false); setEmail(''); }}
                className="text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="label">Email address</label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <p className="field-hint mt-2">
                  Enter the email associated with your DeliverySync account
                </p>
              </div>

              <button type="submit" className="btn-primary w-full h-11 text-base" disabled={loading}>
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending reset link…</>
                ) : 'Send reset link'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
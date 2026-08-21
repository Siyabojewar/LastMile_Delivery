import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import PasswordInput from '../components/shared/PasswordInput';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
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
            🔒
          </div>
          <h1 className="page-title">Set new password</h1>
          <p className="page-subtitle">Choose a strong password for your account</p>
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
              <h3 className="font-bold text-gray-900 mb-2">Password updated!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your password has been successfully updated. You will be redirected to the login page.
              </p>
              <Link 
                to="/login"
                className="btn-primary w-full h-11 text-base justify-center"
              >
                Continue to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="label">
                  New password
                  <span className="ml-1 text-xs font-normal text-gray-400">(min. 6 characters)</span>
                </label>
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">Confirm new password</label>
                <PasswordInput
                  id="confirmPassword"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary w-full h-11 text-base" disabled={loading || !token}>
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Updating password…</>
                ) : 'Update password'}
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
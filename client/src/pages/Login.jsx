import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/shared/PasswordInput';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, token } = await api.post('/auth/login', form);
      login(user, token);
      if (user.role === 'admin')  navigate('/admin/orders');
      else if (user.role === 'agent') navigate('/agent/orders');
      else navigate('/customer/orders');
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
            📦
          </div>
          <h1 className="page-title">Welcome back</h1>
          <p className="page-subtitle">Sign in to your DeliverySync account</p>
        </div>

        {/* ── Card ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-card-lg border border-gray-100 p-8">

          {/* Error banner */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200
                            px-4 py-3 animate-scale-in">
              <span className="text-red-500 font-bold mt-px shrink-0">⚠</span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email" className="input" type="email" autoComplete="email"
                placeholder="you@example.com" required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="label">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary w-full h-11 text-base" disabled={loading}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in…</>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-500">
            New customer?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
              Create a free account
            </Link>
          </p>
        </div>

        {/* ── Role hint ─────────────────────────────────────────── */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
          {[
            { icon: '🛡', label: 'Admin' },
            { icon: '🚴', label: 'Agent' },
            { icon: '📦', label: 'Customer' },
          ].map(r => (
            <span key={r.label} className="flex items-center gap-1">
              <span>{r.icon}</span>{r.label}
            </span>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Admin &amp; agent accounts are created by an administrator.
        </p>
      </div>
    </div>
  );
}

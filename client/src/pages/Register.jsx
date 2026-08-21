import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/shared/PasswordInput';

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, token } = await api.post('/auth/register', form);
      login(user, token);
      navigate('/customer/orders');
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
          <h1 className="page-title">Create your account</h1>
          <p className="page-subtitle">Start tracking deliveries in minutes — it's free</p>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="label">Full name</label>
              <input
                id="name" className="input" type="text" autoComplete="name"
                placeholder="Rahul Sharma" required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email" className="input" type="email" autoComplete="email"
                placeholder="rahul@example.com" required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
                <span className="ml-1 text-xs font-normal text-gray-400">(min. 6 characters)</span>
              </label>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
                minLength={6}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="phone" className="label">
                Phone number
                <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
              </label>
              <input
                id="phone" className="input" type="tel" autoComplete="tel"
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary w-full h-11 text-base" disabled={loading}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account…</>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* ── What you get ──────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: '🧾', label: 'Instant quotes' },
            { icon: '📍', label: 'Live tracking' },
            { icon: '🔔', label: 'Email updates' },
          ].map(f => (
            <div key={f.label} className="bg-white/70 rounded-xl py-2.5 px-2 border border-gray-100 shadow-card">
              <p className="text-lg">{f.icon}</p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

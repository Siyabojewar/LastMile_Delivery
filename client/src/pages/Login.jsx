import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/shared/PasswordInput';
import FormField from '../components/shared/FormField';
import Alert from '../components/shared/Alert';

const ROLES = [
  { key: 'customer', label: 'Customer', icon: '📦', pill: 'bg-emerald-600 text-white', border: 'border-emerald-600 ring-2 ring-emerald-300' },
  { key: 'agent',    label: 'Agent',    icon: '🚴', pill: 'bg-amber-500 text-white',   border: 'border-amber-500 ring-2 ring-amber-300' },
  { key: 'admin',    label: 'Admin',    icon: '🛡️', pill: 'bg-purple-600 text-white',  border: 'border-purple-600 ring-2 ring-purple-300' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('customer');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const activeRole = ROLES.find(r => r.key === selectedRole);

  function validateField(name, value) {
    const errors = { ...fieldErrors };
    switch (name) {
      case 'email':
        if (!value) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(value)) errors.email = 'Please enter a valid email address';
        else delete errors.email;
        break;
      case 'password':
        if (!value) errors.password = 'Password is required';
        else if (value.length < 6) errors.password = 'Password must be at least 6 characters';
        else delete errors.password;
        break;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleChange(field, value) {
    setForm({ ...form, [field]: value });
    validateField(field, value);
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!validateField('email', form.email) || !validateField('password', form.password)) return;

    setLoading(true);
    try {
      const { user, token } = await api.post('/auth/login', form);

      // Role mismatch check
      if (user.role !== selectedRole) {
        const expected = ROLES.find(r => r.key === selectedRole)?.label;
        const actual   = ROLES.find(r => r.key === user.role)?.label || user.role;
        setError(`This account is not ${expected === 'Admin' ? 'an' : 'a'} ${expected} account. It is a ${actual} account.`);
        setLoading(false);
        return;
      }

      login(user, token);
      if (user.role === 'admin')    navigate('/admin/orders');
      else if (user.role === 'agent') navigate('/agent/orders');
      else navigate('/customer/orders');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md animate-slide-up">

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white text-3xl mb-4 shadow-xl select-none">
            📦
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-600 text-sm">Sign in to your DeliverySync account</p>
        </div>

        {/* Role selector — above the card, prominent */}
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 text-center">
            I am signing in as…
          </p>
          <div className="flex gap-2">
            {ROLES.map(role => (
              <button
                key={role.key}
                type="button"
                onClick={() => { setSelectedRole(role.key); setError(''); }}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-150
                  ${selectedRole === role.key
                    ? `${role.border} bg-white shadow-md`
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                <span className="text-xl">{role.icon}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedRole === role.key ? role.pill : 'bg-gray-100 text-gray-600'}`}>
                  {role.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="card-lg">
          {/* Active role indicator */}
          <div className={`flex items-center gap-2 text-sm font-semibold mb-5 px-3 py-2 rounded-lg ${activeRole?.pill}`}>
            <span>{activeRole?.icon}</span>
            <span>Signing in as {activeRole?.label}</span>
          </div>

          {error && (
            <Alert type="error" message={error} className="mb-5" dismissible onDismiss={() => setError('')} />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField id="email" label="Email address" required error={fieldErrors.email}>
              <input className="input"
                type="email" autoComplete="email" placeholder="you@example.com"
                value={form.email} onChange={e => handleChange('email', e.target.value)}
              />
            </FormField>

            <FormField id="password" label="Password" required error={fieldErrors.password}>
              <PasswordInput
                id="password" autoComplete="current-password" placeholder="••••••••"
                value={form.password} onChange={e => handleChange('password', e.target.value)}
                error={Boolean(fieldErrors.password)}
              />
            </FormField>

            <div className="text-right -mt-3">
              <span className="text-xs text-gray-400">Forgotten your password? Contact an administrator.</span>
            </div>

            <button
              type="submit"
              className="btn-primary w-full h-12 text-base"
              disabled={loading || Object.keys(fieldErrors).length > 0}
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in…</>
              ) : (
                `Sign In as ${activeRole?.label}`
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-gray-600">
              New to DeliverySync?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                Create a free account
              </Link>
            </p>
            <p className="text-xs text-gray-400 mt-2">Admin &amp; agent accounts are created by administrators</p>
          </div>
        </div>
      </div>
    </div>
  );
}

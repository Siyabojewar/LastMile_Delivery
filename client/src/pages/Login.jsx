import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/shared/PasswordInput';
import FormField from '../components/shared/FormField';
import Alert from '../components/shared/Alert';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  function validateField(name, value) {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'email':
        if (!value) {
          errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        } else {
          delete errors.password;
        }
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleChange(field, value) {
    setForm({ ...form, [field]: value });
    validateField(field, value);
    if (error) setError(''); // Clear general error when user starts typing
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const isEmailValid = validateField('email', form.email);
    const isPasswordValid = validateField('password', form.password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    setLoading(true);
    try {
      const { user, token } = await api.post('/auth/login', form);
      login(user, token);
      
      // Role-based redirect
      if (user.role === 'admin') navigate('/admin/orders');
      else if (user.role === 'agent') navigate('/agent/orders');
      else navigate('/customer/orders');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-neutral-50 via-white to-blue-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-blue-950/20">
      <div className="w-full max-w-md animate-slide-up">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-brand-600 dark:bg-brand-500 text-white text-3xl mb-4 shadow-card-lg
                          ring-4 ring-brand-200 dark:ring-brand-800 select-none">
            📦
          </div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
            Welcome back
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary">
            Sign in to your DeliverySync account
          </p>
        </div>

        {/* Form Card */}
        <div className="card-lg">
          {/* Error Alert */}
          {error && (
            <Alert 
              type="error" 
              message={error} 
              className="mb-6"
              dismissible
              onDismiss={() => setError('')}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              id="email"
              label="Email address"
              required
              error={fieldErrors.email}
              hint="Enter the email address associated with your account"
            >
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
              />
            </FormField>

            <FormField
              id="password"
              label="Password"
              required
              error={fieldErrors.password}
            >
              <PasswordInput
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => handleChange('password', e.target.value)}
                error={Boolean(fieldErrors.password)}
              />
              <div className="mt-3 text-right">
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-semibold text-brand-600 dark:text-brand-400 
                           hover:text-brand-700 dark:hover:text-brand-300 hover:underline
                           transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </FormField>

            <button 
              type="submit" 
              className="btn-primary w-full h-12 text-base" 
              disabled={loading || Object.keys(fieldErrors).length > 0}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h1m5 4v6m4-6v6m4-6v6" />
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
              New to DeliverySync?{' '}
              <Link 
                to="/register" 
                className="font-semibold text-brand-600 dark:text-brand-400 
                         hover:text-brand-700 dark:hover:text-brand-300 hover:underline
                         transition-colors"
              >
                Create a free account
              </Link>
            </p>
          </div>
        </div>

        {/* Role Information */}
        <div className="mt-6 p-4 bg-surface-secondary dark:bg-surface-dark-secondary rounded-xl 
                       border border-border-light dark:border-border-dark">
          <div className="flex items-center justify-center gap-6 text-sm">
            {[
              { icon: '🛡', label: 'Admin', color: 'text-purple-600 dark:text-purple-400' },
              { icon: '🚴', label: 'Agent', color: 'text-amber-600 dark:text-amber-400' },
              { icon: '📦', label: 'Customer', color: 'text-emerald-600 dark:text-emerald-400' },
            ].map(role => (
              <div key={role.label} className="flex items-center gap-1.5">
                <span className="text-base">{role.icon}</span>
                <span className={`font-medium ${role.color}`}>{role.label}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-text-tertiary dark:text-text-dark-tertiary mt-2">
            Admin & agent accounts are created by administrators
          </p>
        </div>
      </div>
    </div>
  );
}

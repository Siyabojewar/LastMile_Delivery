import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/shared/PasswordInput';
import FormField from '../components/shared/FormField';
import Alert from '../components/shared/Alert';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  function validateField(name, value) {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Full name is required';
        } else if (value.trim().length < 2) {
          errors.name = 'Name must be at least 2 characters';
        } else {
          delete errors.name;
        }
        break;
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
        } else if (!/(?=.*[a-z])(?=.*[A-Z])|(?=.*[0-9])/.test(value)) {
          errors.password = 'Password should contain uppercase, lowercase, or numbers';
        } else {
          delete errors.password;
        }
        break;
      case 'phone':
        if (value && !/^[6-9]\d{9}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
          errors.phone = 'Please enter a valid 10-digit phone number';
        } else {
          delete errors.phone;
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
    
    // Validate all required fields
    const isNameValid = validateField('name', form.name);
    const isEmailValid = validateField('email', form.email);
    const isPasswordValid = validateField('password', form.password);
    const isPhoneValid = validateField('phone', form.phone);
    
    if (!isNameValid || !isEmailValid || !isPasswordValid || !isPhoneValid) {
      return;
    }
    
    setLoading(true);
    try {
      const { user, token } = await api.post('/auth/register', form);
      login(user, token);
      navigate('/customer/orders');
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Password strength indicator
  const getPasswordStrength = () => {
    const { password } = form;
    if (!password) return { score: 0, text: '', color: '' };
    
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { score, text: 'Weak',   color: 'text-red-600' };
    if (score <= 4) return { score, text: 'Fair',   color: 'text-amber-600' };
    return           { score, text: 'Strong', color: 'text-emerald-600' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md animate-slide-up">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-blue-600 text-white text-3xl mb-4 shadow-xl select-none">
            📦
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h1>
          <p className="text-gray-600">
            Start tracking deliveries in minutes — it's free
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
              id="name"
              label="Full name"
              required
              error={fieldErrors.name}
              hint="Enter your full name as it should appear on deliveries"
            >
              <input className="input"
                type="text"
                autoComplete="name"
                placeholder="Rahul Sharma"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
              />
            </FormField>

            <FormField
              id="email"
              label="Email address"
              required
              error={fieldErrors.email}
              hint="We'll use this email for order updates and notifications"
            >
              <input className="input"
                type="email"
                autoComplete="email"
                placeholder="rahul@example.com"
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
                id="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => handleChange('password', e.target.value)}
                error={Boolean(fieldErrors.password)}
              />
            </FormField>
            {form.password && passwordStrength.score > 0 && (
              <div className="-mt-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-gray-500">Password strength:</span>
                  <span className={`text-xs font-semibold ${passwordStrength.color}`}>
                    {passwordStrength.text}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      passwordStrength.score <= 2 ? 'bg-red-500'
                      : passwordStrength.score <= 4 ? 'bg-amber-500'
                      : 'bg-emerald-500'
                    }`}
                    style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <FormField
              id="phone"
              label="Phone number"
              optional
              error={fieldErrors.phone}
              hint="For delivery coordination (optional but recommended)"
            >
              <input className="input"
                type="tel"
                autoComplete="tel"
                placeholder="9876543210"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
              />
            </FormField>

            <button 
              type="submit" 
              className="btn-primary w-full h-12 text-base" 
              disabled={loading || Object.keys(fieldErrors).length > 0}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: '🧾', label: 'Instant quotes', color: 'bg-blue-50 text-blue-700' },
            { icon: '📍', label: 'Live tracking', color: 'bg-emerald-50 text-emerald-700' },
            { icon: '🔔', label: 'Email updates', color: 'bg-purple-50 text-purple-700' },
          ].map(feature => (
            <div key={feature.label} className={`
              p-3 rounded-xl border text-center transition-all duration-200
              ${feature.color}
              border-current/20 hover:scale-105
            `}>
              <div className="text-lg mb-1">{feature.icon}</div>
              <div className="text-xs font-medium">{feature.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

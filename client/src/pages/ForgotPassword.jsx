import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import FormField from '../components/shared/FormField';
import Alert from '../components/shared/Alert';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldError, setFieldError] = useState('');

  function validateEmail(value) {
    if (!value) {
      setFieldError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(value)) {
      setFieldError('Please enter a valid email address');
      return false;
    } else {
      setFieldError('');
      return true;
    }
  }

  function handleEmailChange(value) {
    setEmail(value);
    validateEmail(value);
    if (error) setError(''); // Clear general error when user starts typing
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(email)) {
      return;
    }
    
    setLoading(true);
    
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
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
            🔑
          </div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
            Reset your password
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary">
            We'll send you a secure reset link via email
          </p>
        </div>

        {/* Form Card */}
        <div className="card-lg">

          {error && (
            <Alert 
              type="error" 
              title="Unable to send reset email"
              message={error}
              className="mb-6"
              dismissible
              onDismiss={() => setError('')}
            />
          )}

          {success ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-success-100 dark:bg-success-900/30 
                              flex items-center justify-center mx-auto mb-6 
                              text-success-600 dark:text-success-400 text-2xl">
                ✓
              </div>
              <h3 className="text-xl font-bold text-text-primary dark:text-text-dark-primary mb-3">
                Check your email
              </h3>
              <p className="text-text-secondary dark:text-text-dark-secondary mb-6">
                We've sent password reset instructions to:<br/>
                <span className="font-semibold text-text-primary dark:text-text-dark-primary">{email}</span>
              </p>
              
              <Alert
                type="info"
                title="Didn't receive the email?"
                message={
                  <ul className="text-left space-y-1 mt-2">
                    <li>• Check your spam/junk folder</li>
                    <li>• Verify the email address is correct</li>
                    <li>• Try again with a different email</li>
                  </ul>
                }
                className="mb-6 text-left"
              />
              
              <button 
                onClick={() => { setSuccess(false); setEmail(''); setError(''); setFieldError(''); }}
                className="btn-secondary w-full"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField
                id="email"
                label="Email address"
                required
                error={fieldError}
                hint="Enter the email address associated with your DeliverySync account"
              >
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => handleEmailChange(e.target.value)}
                />
              </FormField>

              <button 
                type="submit" 
                className="btn-primary w-full h-12" 
                disabled={loading || Boolean(fieldError)}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending reset link…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send reset link
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-border-light dark:border-border-dark">
            <div className="text-center">
              <Link to="/login" className="btn-ghost inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
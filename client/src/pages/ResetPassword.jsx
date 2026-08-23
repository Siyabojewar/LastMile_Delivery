import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import PasswordInput from '../components/shared/PasswordInput';
import FormField from '../components/shared/FormField';
import Alert from '../components/shared/Alert';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token]);

  function validateField(name, value) {
    const errors = { ...fieldErrors };
    
    switch (name) {
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
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Please confirm your password';
        } else if (value !== password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handlePasswordChange(value) {
    setPassword(value);
    validateField('password', value);
    // Re-validate confirm password if it exists
    if (confirmPassword) {
      const errors = { ...fieldErrors };
      if (value !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      } else {
        delete errors.confirmPassword;
      }
      setFieldErrors(errors);
    }
    if (error) setError('');
  }

  function handleConfirmPasswordChange(value) {
    setConfirmPassword(value);
    validateField('confirmPassword', value);
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validate all fields
    const isPasswordValid = validateField('password', password);
    const isConfirmPasswordValid = validateField('confirmPassword', confirmPassword);
    
    if (!isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { score: 0, text: '', color: '' };
    
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { score, text: 'Weak', color: 'text-error-600 dark:text-error-400' };
    if (score <= 4) return { score, text: 'Fair', color: 'text-warning-600 dark:text-warning-400' };
    return { score, text: 'Strong', color: 'text-success-600 dark:text-success-400' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-neutral-50 via-white to-blue-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-blue-950/20">
      <div className="w-full max-w-md animate-slide-up">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-brand-600 dark:bg-brand-500 text-white text-3xl mb-4 shadow-card-lg
                          ring-4 ring-brand-200 dark:ring-brand-800 select-none">
            🔒
          </div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
            Set new password
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary">
            Choose a strong password for your account
          </p>
        </div>

        {/* Form Card */}
        <div className="card-lg">

          {error && (
            <Alert 
              type="error" 
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
                Password updated!
              </h3>
              <p className="text-text-secondary dark:text-text-dark-secondary mb-6">
                Your password has been successfully updated. You will be redirected to the login page.
              </p>
              <Link 
                to="/login"
                className="btn-primary w-full h-12 text-base justify-center"
              >
                Continue to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField
                id="password"
                label="New password"
                required
                error={fieldErrors.password}
                hint="Choose a strong password with at least 6 characters"
              >
                <PasswordInput
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => handlePasswordChange(e.target.value)}
                  error={Boolean(fieldErrors.password)}
                />
                {password && passwordStrength.score > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary">
                        Password strength:
                      </span>
                      <span className={`text-xs font-medium ${passwordStrength.color}`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="h-1.5 bg-surface-tertiary dark:bg-surface-dark-tertiary rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score <= 2 
                            ? 'bg-error-500' 
                            : passwordStrength.score <= 4 
                              ? 'bg-warning-500' 
                              : 'bg-success-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </FormField>

              <FormField
                id="confirmPassword"
                label="Confirm new password"
                required
                error={fieldErrors.confirmPassword}
                success={confirmPassword && !fieldErrors.confirmPassword ? "Passwords match" : undefined}
              >
                <PasswordInput
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => handleConfirmPasswordChange(e.target.value)}
                  error={Boolean(fieldErrors.confirmPassword)}
                  success={confirmPassword && !fieldErrors.confirmPassword}
                />
              </FormField>

              <button 
                type="submit" 
                className="btn-primary w-full h-12 text-base" 
                disabled={loading || !token || Object.keys(fieldErrors).length > 0}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating password…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Update password
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-border-light dark:border-border-dark text-center">
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
  );
}
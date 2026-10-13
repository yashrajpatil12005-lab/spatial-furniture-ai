'use client';

import { useState } from 'react';
import { registerUser } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  validateFullName,
  normalizeFullName,
  validatePassword,
  validateConfirmPassword,
  getPasswordStrength,
  getPasswordRequirements,
  PASSWORD_MAX_LENGTH,
} from '@/lib/utils/validation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Validate the name dynamically
  const nameValidation = validateFullName(name);
  const showNameError = (nameTouched || isSubmitted) && !nameValidation.isValid;

  // Password validation & live strength
  const passwordValidation = validatePassword(password);
  const passwordRequirements = getPasswordRequirements(password);
  const passwordStrength = getPasswordStrength(password);
  const showPasswordError = (passwordTouched || isSubmitted) && !passwordValidation.isValid;

  // Confirm password validation
  const confirmValidation = validateConfirmPassword(password, confirmPassword);
  const showConfirmPasswordError = (confirmPasswordTouched || isSubmitted) && !confirmValidation.isValid;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (!nameTouched) {
      setNameTouched(true);
    }
  };

  const handleNameBlur = () => {
    setNameTouched(true);
    if (name.trim()) {
      setName(normalizeFullName(name));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setError('');

    // 1. Validate full name
    const normalizedName = normalizeFullName(name);
    const nameVal = validateFullName(normalizedName);
    if (!nameVal.isValid) {
      setNameTouched(true);
      return;
    }

    // 2. Validate email
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    // 3. Validate password
    const passVal = validatePassword(password);
    if (!passVal.isValid) {
      setPasswordTouched(true);
      return;
    }

    // 4. Validate confirm password
    const confirmVal = validateConfirmPassword(password, confirmPassword);
    if (!confirmVal.isValid) {
      setConfirmPasswordTouched(true);
      return;
    }

    // Ensure state holds the normalized name
    setName(normalizedName);
    setLoading(true);
    
    try {
      await registerUser(email, password, normalizedName);
      router.push('/customer');
    } catch (err: unknown) {
      let friendlyMessage = 'Failed to create account. Please try again.';
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code: string }).code;
        if (code === 'auth/email-already-in-use') {
          friendlyMessage = 'An account with this email address already exists.';
        } else if (code === 'auth/invalid-email') {
          friendlyMessage = 'Please enter a valid email address.';
        } else if (code === 'auth/weak-password') {
          friendlyMessage = 'Password is too weak according to server policy.';
        } else if (code === 'auth/network-request-failed') {
          friendlyMessage = 'Network error. Please check your internet connection.';
        }
      } else if (err instanceof Error) {
        friendlyMessage = err.message;
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center bg-[#F8FAFC] py-12 px-5 sm:px-8 lg:px-10">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-[#E2E8F0] card-shadow">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] mb-4">
            <span className="text-xl font-bold text-[#047857]">S</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Create Account</h1>
          <p className="mt-2 text-sm text-[#475569]">
            Start visualizing spatial furniture with AI
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleRegister} noValidate>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="name" className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">
                  Full Name
                </label>
                <span
                  id="name-char-count"
                  aria-live="polite"
                  className={`text-xs font-mono font-medium tabular-nums transition-colors ${
                    name.length >= 50 ? 'text-[#EF4444]' : 'text-[#94A3B8]'
                  }`}
                >
                  {name.length}/50
                </span>
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                maxLength={50}
                className={`block w-full px-4 py-2.5 rounded-xl bg-white text-[#111827] placeholder-[#94A3B8] text-sm focus:outline-none transition-all ${
                  showNameError
                    ? 'border border-[#EF4444] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20'
                    : 'border border-[#CBD5E1] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20'
                }`}
                placeholder="Enter your full name"
                value={name}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                aria-invalid={showNameError ? 'true' : 'false'}
                aria-describedby={showNameError ? 'name-error' : 'name-char-count'}
              />
              {showNameError && (
                <p id="name-error" role="alert" className="mt-1.5 text-xs text-[#EF4444] font-medium flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{nameValidation.error}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email-address" className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="block w-full px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-[#111827] placeholder-[#94A3B8] text-sm focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">
                  Password
                </label>
                {password.length > 0 && (
                  <span
                    id="password-strength-badge"
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-colors"
                    style={{
                      color: passwordStrength.color,
                      borderColor: `${passwordStrength.color}40`,
                      backgroundColor: `${passwordStrength.color}15`,
                    }}
                  >
                    {passwordStrength.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  maxLength={PASSWORD_MAX_LENGTH}
                  autoComplete="new-password"
                  className={`block w-full pl-4 pr-11 py-2.5 rounded-xl bg-white text-[#111827] placeholder-[#94A3B8] text-sm focus:outline-none transition-all ${
                    showPasswordError
                      ? 'border border-[#EF4444] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20'
                      : 'border border-[#CBD5E1] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20'
                  }`}
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  aria-invalid={showPasswordError ? 'true' : 'false'}
                  aria-describedby="password-requirements"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#64748B] hover:text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Live Strength Bar */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5" aria-live="polite">
                  <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full rounded-full transition-all duration-300 ${
                          step <= passwordStrength.score
                            ? step === 1
                              ? 'bg-[#EF4444]'
                              : step === 2
                              ? 'bg-[#F59E0B]'
                              : step === 3
                              ? 'bg-[#3B82F6]'
                              : 'bg-[#10B981]'
                            : 'bg-[#E2E8F0]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Password Requirements Checklist */}
              <div id="password-requirements" className="mt-2.5 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-xs text-[#475569]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[#111827] text-[11px] uppercase tracking-wider">
                    Password Requirements
                  </span>
                  <span className="text-[11px] text-[#64748B] font-mono">
                    {password.length}/128
                  </span>
                </div>
                <ul className="space-y-1">
                  {[
                    { met: passwordRequirements.minLength && passwordRequirements.maxLength, text: '8 to 128 characters' },
                    { met: passwordRequirements.hasUppercase, text: 'At least one uppercase letter (A-Z)' },
                    { met: passwordRequirements.hasLowercase, text: 'At least one lowercase letter (a-z)' },
                    { met: passwordRequirements.hasNumber, text: 'At least one number (0-9)' },
                    { met: passwordRequirements.hasSpecial, text: 'At least one special character (!@#$%...)' },
                  ].map((req, idx) => (
                    <li key={idx} className="flex items-center gap-2 transition-colors">
                      {req.met ? (
                        <svg className="w-3.5 h-3.5 text-[#10B981] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
                        </span>
                      )}
                      <span className={req.met ? 'text-[#047857] font-medium' : 'text-[#64748B]'}>
                        {req.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {showPasswordError && (
                <p id="password-error" role="alert" className="mt-1.5 text-xs text-[#EF4444] font-medium flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{passwordValidation.error}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  maxLength={PASSWORD_MAX_LENGTH}
                  autoComplete="new-password"
                  className={`block w-full pl-4 pr-11 py-2.5 rounded-xl bg-white text-[#111827] placeholder-[#94A3B8] text-sm focus:outline-none transition-all ${
                    showConfirmPasswordError
                      ? 'border border-[#EF4444] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20'
                      : 'border border-[#CBD5E1] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20'
                  }`}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setConfirmPasswordTouched(true)}
                  aria-invalid={showConfirmPasswordError ? 'true' : 'false'}
                  aria-describedby={showConfirmPasswordError ? 'confirm-password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#64748B] hover:text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {showConfirmPasswordError && (
                <p id="confirm-password-error" role="alert" className="mt-1.5 text-xs text-[#EF4444] font-medium flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{confirmValidation.error}</span>
                </p>
              )}
              {!showConfirmPasswordError && confirmPassword && password && confirmPassword === password && (
                <p className="mt-1.5 text-xs text-[#047857] font-medium flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#10B981] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Passwords match</span>
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-red-200 text-xs text-[#EF4444] text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#10B981] hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2 disabled:opacity-50 transition-all shadow-sm"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-[#64748B]">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#047857] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

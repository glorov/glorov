'use client'

import React, { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCustomerAuth } from '../../../context/CustomerAuthContext'

// Compact SVG Icons
const UserSvgIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const MessageSvgIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
)

const PhoneSvgIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
)

const LockSvgIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
)

const EyeSvgIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
)

const EyeOffSvgIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
    />
  </svg>
)

const ArrowRightSvg = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
)

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams ? (searchParams.get('redirect') || '/account') : '/account'
  const reasonParam = searchParams ? searchParams.get('reason') : null

  const effectiveReason =
    reasonParam ||
    (redirectPath.includes('checkout')
      ? 'Create your account to complete checkout and secure your order.'
      : null)

  const { register, isLoading, authError } = useCustomerAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [localError, setLocalError] = useState<string | null>(null)

  // Real-time Field Validations
  const isFirstNameValid = firstName.trim().length > 0
  const isLastNameValid = lastName.trim().length > 0
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const isPhoneValid = phone.trim().length === 10
  const isPasswordValid = password.length >= 8
  const isConfirmValid = confirmPassword.length > 0 && confirmPassword === password

  // Smart Form-Wide Validity
  const isFormValid = useMemo(() => {
    return (
      isFirstNameValid &&
      isLastNameValid &&
      isEmailValid &&
      isPhoneValid &&
      isPasswordValid &&
      isConfirmValid &&
      agreeTerms
    )
  }, [
    isFirstNameValid,
    isLastNameValid,
    isEmailValid,
    isPhoneValid,
    isPasswordValid,
    isConfirmValid,
    agreeTerms,
  ])

  // Contextual Disabled Hint
  const formStatusHint = useMemo(() => {
    if (!isFirstNameValid || !isLastNameValid) return 'Enter first & last name'
    if (!isEmailValid) return 'Enter valid email address'
    if (!isPhoneValid) return 'Enter 10-digit mobile number'
    if (!isPasswordValid) return 'Password must be min 8 chars'
    if (!isConfirmValid) return 'Passwords do not match'
    if (!agreeTerms) return 'Accept terms & privacy policy'
    return null
  }, [
    isFirstNameValid,
    isLastNameValid,
    isEmailValid,
    isPhoneValid,
    isPasswordValid,
    isConfirmValid,
    agreeTerms,
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!isFormValid) return

    const res = await register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
    })

    if (res.success) {
      const targetParams = new URLSearchParams()
      targetParams.set('registered', 'true')
      targetParams.set('email', email.trim())
      if (redirectPath && redirectPath !== '/account') {
        targetParams.set('redirect', redirectPath)
      }
      router.push(`/auth/login?${targetParams.toString()}`)
    } else {
      setLocalError(res.error || 'Failed to create account. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-[440px] mx-auto bg-white rounded-3xl border border-stone-200/90 overflow-hidden">
      {/* Compact Clean Header */}
      <div className="px-5 pt-6 pb-4 text-center bg-gradient-to-b from-[#F2F7F4] to-[#F9FAF8] border-b border-stone-100">
        <Link href="/" className="inline-block transition-transform hover:scale-[1.02] mb-2.5">
          <Image
            src="/logo/glorov-logo.svg"
            alt="GLOROV"
            width={128}
            height={32}
            className="h-7 sm:h-8 w-auto object-contain mx-auto"
            priority
          />
        </Link>

        <h1 className="text-xl sm:text-2xl font-serif font-black text-[#081C15] tracking-tight">
          Create Account
        </h1>
        <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
          Join our botanical circle for nursery orders & patron care
        </p>

        {/* Single Compact Security Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-[10px] font-semibold text-[#0A4C36] mt-2.5">
          <svg className="w-3 h-3 text-[#0A4C36]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>256-Bit SSL Secure Registration</span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Contextual Reason Banner */}
        {effectiveReason && (
          <div className="mb-4 p-3 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] text-[#081C15] text-xs flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-white text-[#0A4C36] flex items-center justify-center shrink-0 border border-[#A5D6A7]/60">
              <LockSvgIcon className="w-3.5 h-3.5" />
            </div>
            <p className="font-semibold leading-snug flex-1">{effectiveReason}</p>
          </div>
        )}

        {/* Error banner */}
        {(localError || authError) && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">{localError || authError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="signup-firstname">
                First Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <UserSvgIcon className="w-3.5 h-3.5" />
                </div>
                <input
                  id="signup-firstname"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full pl-9 pr-2.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4C36] focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="signup-lastname">
                Last Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <UserSvgIcon className="w-3.5 h-3.5" />
                </div>
                <input
                  id="signup-lastname"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full pl-9 pr-2.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4C36] focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="signup-email">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <MessageSvgIcon className="w-4 h-4" />
              </div>
              <input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patron@domain.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4C36] focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Mobile Phone */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="signup-phone">
              Mobile Phone *
            </label>
            <div className="relative flex rounded-xl border border-stone-300 bg-stone-50/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0A4C36] focus-within:border-transparent transition overflow-hidden">
              <span className="inline-flex items-center gap-1 pl-3 pr-2.5 border-r border-stone-200 text-stone-600 text-xs font-mono font-bold select-none shrink-0 bg-stone-100/60">
                <PhoneSvgIcon className="w-3.5 h-3.5 text-[#0A4C36]" />
                +91
              </span>
              <input
                id="signup-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                className="w-full px-3 py-2.5 bg-transparent text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-700" htmlFor="signup-password">
                Password (min 8 chars) *
              </label>
              {password.length > 0 && password.length < 8 && (
                <span className="text-[10px] text-amber-600 font-medium">8 chars min</span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <LockSvgIcon className="w-4 h-4" />
              </div>
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4C36] focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer transition-colors"
              >
                {showPassword ? <EyeOffSvgIcon className="w-4 h-4" /> : <EyeSvgIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-700" htmlFor="signup-confirm-password">
                Confirm Password *
              </label>
              {confirmPassword.length > 0 && (
                <span
                  className={`text-[10px] font-semibold ${
                    isConfirmValid ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {isConfirmValid ? '✓ Match' : 'Must match'}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <LockSvgIcon className="w-4 h-4" />
              </div>
              <input
                id="signup-confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent transition ${
                  confirmPassword.length > 0 && !isConfirmValid
                    ? 'border-rose-300 focus:ring-rose-500'
                    : 'border-stone-300 focus:ring-[#0A4C36]'
                }`}
              />
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="pt-0.5">
            <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-stone-600 select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#0A4C36] focus:ring-[#0A4C36] border-stone-300 cursor-pointer accent-[#0A4C36]"
              />
              <span className="leading-relaxed">
                I agree to the GLOROV{' '}
                <Link href="/policies/terms" className="text-[#0A4C36] font-bold hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/policies/privacy" className="text-[#0A4C36] font-bold hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </div>

          {/* Smart Submit CTA: Disabled until all fields are filled & valid */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full h-11 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 pt-0.5 mt-2 ${
              isFormValid && !isLoading
                ? 'bg-[#081C15] hover:bg-[#0A4C36] active:bg-[#04281B] text-white cursor-pointer active:scale-[0.99]'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-200/80'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Creating Account...</span>
              </>
            ) : isFormValid ? (
              <>
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Create Patron Account</span>
                <ArrowRightSvg className="w-4 h-4" />
              </>
            ) : (
              <span>{formStatusHint || 'Fill all fields to register'}</span>
            )}
          </button>
        </form>

        {/* Switch to Sign In */}
        <div className="mt-5 pt-3.5 border-t border-stone-100 text-center text-xs text-stone-600">
          Already have an account?{' '}
          <Link
            href={`/auth/login?redirect=${encodeURIComponent(redirectPath)}`}
            className="font-bold text-[#0A4C36] hover:underline cursor-pointer"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6 sm:py-12 px-3 sm:px-6 bg-gradient-to-b from-[#FAFBF9] via-[#F4F7F4] to-[#F9FAF8]">
      <Suspense fallback={<div className="text-center text-stone-400 text-xs py-10">Loading registration...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  )
}

'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCustomerAuth } from '../../../context/CustomerAuthContext'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams ? (searchParams.get('redirect') || '/account') : '/account'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setLocalError('Please fill in all mandatory fields.')
      return
    }

    if (password.length < 8) {
      setLocalError('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.')
      return
    }

    if (!agreeTerms) {
      setLocalError('You must agree to the GLOROV Terms of Service and Privacy Policy.')
      return
    }

    const res = await register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
    })

    if (res.success) {
      router.push(redirectPath)
    } else {
      setLocalError(res.error || 'Failed to create account. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-8 bg-white rounded-3xl border border-stone-200/90 shadow-xl">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-brand-primary flex items-center justify-center mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight font-serif">
          Join the GLOROV Circle
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Create your patron account for climate-safe nursery deliveries & expert care
        </p>
      </div>

      {/* Error banner */}
      {(localError || authError) && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{localError || authError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="signup-firstname">
              First Name *
            </label>
            <input
              id="signup-firstname"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="signup-lastname">
              Last Name *
            </label>
            <input
              id="signup-lastname"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="signup-email">
            Email Address *
          </label>
          <input
            id="signup-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="signup-phone">
            Phone Number *
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-stone-300 bg-stone-50 text-stone-500 text-xs font-mono">
              +91
            </span>
            <input
              id="signup-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="9876543210"
              className="w-full px-3 py-2 rounded-r-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="signup-password">
            Password (min 8 chars) *
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="signup-confirm-password">
            Confirm Password *
          </label>
          <input
            id="signup-confirm-password"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        <div className="pt-1">
          <label className="flex items-start gap-2 cursor-pointer text-[11px] text-stone-600">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded text-brand-primary focus:ring-brand-primary"
            />
            <span>
              I agree to the GLOROV{' '}
              <a href="#terms" className="text-brand-primary font-semibold hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" className="text-brand-primary font-semibold hover:underline">
                Botanical Privacy Policy
              </a>
              .
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-brand-primary hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Complete Registration</span>
          )}
        </button>
      </form>

      {/* Switch to Sign In */}
      <div className="mt-6 pt-5 border-t border-stone-100 text-center text-xs text-stone-600">
        Already have a GLOROV account?{' '}
        <Link
          href={`/auth/login?redirect=${encodeURIComponent(redirectPath)}`}
          className="font-bold text-brand-primary hover:underline"
        >
          Sign In here
        </Link>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4 bg-stone-50/50">
      <Suspense fallback={<div className="text-center text-stone-400 text-xs py-10">Loading registration...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  )
}

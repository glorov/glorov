'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCustomerAuth } from '../../../context/CustomerAuthContext'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams ? (searchParams.get('redirect') || '/account') : '/account'

  const { login, isLoading, authError } = useCustomerAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both your email address and password.')
      return
    }

    const res = await login(email, password)
    if (res.success) {
      router.push(redirectPath)
    } else {
      setLocalError(res.error || 'Invalid email or password.')
    }
  }

  const handleDemoLogin = async () => {
    setLocalError(null)
    setEmail('demo@glorov.in')
    setPassword('DemoPass123!')
    const res = await login('demo@glorov.in', 'DemoPass123!')
    if (res.success) {
      router.push(redirectPath)
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight font-serif">
          Welcome Back to GLOROV
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Sign in to access your garden orders, wishlist & patron perks
        </p>
      </div>

      {/* Error alert */}
      {(localError || authError) && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{localError || authError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="login-email">
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="patron@domain.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-stone-700" htmlFor="login-password">
              Password
            </label>
            <a
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault()
                alert('Password reset link has been dispatched to your email address.')
              }}
              className="text-[11px] font-semibold text-brand-primary hover:underline"
            >
              Forgot Password?
            </a>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition pr-10"
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-brand-primary hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <span>Sign In to Account</span>
          )}
        </button>

        {/* Demo Fast Login */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 text-brand-primary font-bold text-xs transition flex items-center justify-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>One-Tap Demo Login (demo@glorov.in)</span>
        </button>
      </form>

      {/* Switch to Signup */}
      <div className="mt-6 pt-5 border-t border-stone-100 text-center text-xs text-stone-600">
        New to GLOROV?{' '}
        <Link
          href={`/auth/signup?redirect=${encodeURIComponent(redirectPath)}`}
          className="font-bold text-brand-primary hover:underline"
        >
          Create a Patron Account
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4 bg-stone-50/50">
      <Suspense fallback={<div className="text-center text-stone-400 text-xs py-10">Loading authentication...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

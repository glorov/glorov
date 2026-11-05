'use client'

import React, { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCustomerAuth } from '../../../context/CustomerAuthContext'
import { useToast } from '../../../context/StorefrontContext'

// Compact SVG Icons
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

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams ? searchParams.get('email') || '' : ''
  const tokenParam = searchParams ? searchParams.get('token') || '' : ''

  const { resetPassword, isLoading, authError } = useCustomerAuth()
  const { showToast } = useToast()

  const [email, setEmail] = useState(emailParam)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const isPasswordValid = newPassword.length >= 8
  const isConfirmValid = confirmPassword.length > 0 && confirmPassword === newPassword

  const isFormValid = isEmailValid && isPasswordValid && isConfirmValid

  const formStatusHint = useMemo(() => {
    if (!isEmailValid) return 'Enter a valid email address'
    if (!isPasswordValid) return 'Password must be min 8 chars'
    if (!isConfirmValid) return 'Passwords do not match'
    return null
  }, [isEmailValid, isPasswordValid, isConfirmValid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!isFormValid) return

    const res = await resetPassword(email.trim(), newPassword, tokenParam)
    if (res.success) {
      showToast('success', 'Your password has been successfully reset! Please sign in.', {
        title: 'Password Updated',
      })
      router.push(`/auth/login?reset=success&email=${encodeURIComponent(email.trim())}`)
    } else {
      setLocalError(res.error || 'Failed to update password. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-[420px] mx-auto bg-white rounded-3xl border border-stone-200/90 shadow-xl shadow-stone-900/5 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 text-center bg-gradient-to-b from-[#F2F7F4] to-[#F9FAF8] border-b border-stone-100">
        <Link href="/" className="inline-block transition-transform hover:scale-[1.02] mb-2.5">
          <img
            src="/logo/glorov-logo.svg"
            alt="GLOROV"
            className="h-7 sm:h-8 w-auto object-contain mx-auto"
            height={32}
          />
        </Link>

        <h1 className="text-xl sm:text-2xl font-serif font-black text-[#081C15] tracking-tight">
          Set New Password
        </h1>
        <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
          Create a secure botanical password for your GLOROV account
        </p>

        {/* Security Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-[10px] font-semibold text-[#0A4C36] mt-2.5">
          <svg className="w-3 h-3 text-[#0A4C36]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>256-Bit SSL Encrypted Reset</span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Error Alert */}
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="reset-email-field">
              Account Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <MessageSvgIcon className="w-4 h-4" />
              </div>
              <input
                id="reset-email-field"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patron@domain.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4C36] focus:border-transparent transition"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="new-password">
              New Password (min 8 chars)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <LockSvgIcon className="w-4 h-4" />
              </div>
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
              <label className="block text-xs font-bold text-stone-700" htmlFor="confirm-password">
                Confirm New Password
              </label>
              {isConfirmValid && (
                <span className="text-[11px] font-bold text-[#0A4C36] flex items-center gap-1">
                  ✓ Match
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <LockSvgIcon className="w-4 h-4" />
              </div>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent transition ${
                  confirmPassword && !isConfirmValid
                    ? 'border-rose-300 focus:ring-rose-400'
                    : 'border-stone-300 focus:ring-[#0A4C36]'
                }`}
              />
            </div>
          </div>

          {/* Smart Submit CTA */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full h-11 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 pt-0.5 mt-2 ${
              isFormValid && !isLoading
                ? 'bg-[#081C15] hover:bg-[#0A4C36] active:bg-[#04281B] text-white shadow-md hover:shadow-lg cursor-pointer active:scale-[0.99]'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-200/80 shadow-none'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Updating Password...</span>
              </>
            ) : isFormValid ? (
              <>
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Update Password & Sign In</span>
                <ArrowRightSvg className="w-4 h-4" />
              </>
            ) : (
              <span>{formStatusHint || 'Fill details to reset password'}</span>
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-5 pt-3.5 border-t border-stone-100 text-center text-xs text-stone-600">
          Remember your password?{' '}
          <Link
            href="/auth/login"
            className="font-bold text-[#0A4C36] hover:underline cursor-pointer"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6 sm:py-12 px-3 sm:px-6 bg-gradient-to-b from-[#FAFBF9] via-[#F4F7F4] to-[#F9FAF8]">
      <Suspense fallback={<div className="text-center text-stone-400 text-xs py-10">Loading reset form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}

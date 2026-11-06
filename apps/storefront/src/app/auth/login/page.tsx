'use client'

import React, { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCustomerAuth } from '../../../context/CustomerAuthContext'
import { useToast } from '../../../context/StorefrontContext'
import { Modal } from '../../../components/ui/Modal'

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

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams ? (searchParams.get('redirect') || '/account') : '/account'
  const reasonParam = searchParams ? searchParams.get('reason') : null
  const registeredParam = searchParams ? searchParams.get('registered') === 'true' : false
  const resetParam = searchParams ? searchParams.get('reset') === 'success' : false
  const emailParam = searchParams ? (searchParams.get('email') || '') : ''

  const effectiveReason =
    reasonParam ||
    (redirectPath.includes('checkout')
      ? 'Please sign in to complete checkout and secure your order.'
      : null)

  const { login, requestPasswordReset, isLoading, authError } = useCustomerAuth()
  const { showToast } = useToast()

  const [email, setEmail] = useState(emailParam)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Update email if query param changes
  React.useEffect(() => {
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [emailParam])

  // Validation rules for smart button state
  const isEmailValid = useMemo(() => {
    return email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  }, [email])

  const isPasswordValid = useMemo(() => {
    return password.trim().length > 0
  }, [password])

  const isFormValid = isEmailValid && isPasswordValid

  // Forgot password modal state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [isResetSending, setIsResetSending] = useState(false)
  const [resetModalStep, setResetModalStep] = useState<'form' | 'sent'>('form')

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      showToast('warning', 'Please provide a valid email address.', {
        title: 'Valid Email Required',
      })
      return
    }

    setIsResetSending(true)
    const res = await requestPasswordReset(resetEmail.trim())
    setIsResetSending(false)

    if (res.success) {
      setResetModalStep('sent')
      showToast('success', `Password recovery link dispatched to ${resetEmail.trim()}. Check your inbox!`, {
        title: 'Reset Link Dispatched',
      })
    } else {
      showToast('error', res.error || 'Failed to dispatch password recovery link.', {
        title: 'Recovery Failed',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!isFormValid) return

    const res = await login(email, password)
    if (res.success) {
      router.push(redirectPath)
    } else {
      setLocalError(res.error || 'Invalid email or password.')
    }
  }

  return (
    <div className="w-full max-w-[420px] mx-auto bg-white rounded-3xl border border-stone-200/90 overflow-hidden">
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
          Welcome Back
        </h1>
        <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
          Sign in to access your orders, saved plants & perks
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
          <span>256-Bit SSL Encrypted Portal</span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Registration Success Banner */}
        {registeredParam && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-[#081C15] text-xs flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#0A4C36] text-white flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-[#081C15] text-xs sm:text-sm">Account created successfully!</p>
              <p className="text-emerald-800 text-[11px] sm:text-xs mt-0.5 leading-snug">
                Welcome to GLOROV. Please enter your password to sign in.
              </p>
            </div>
          </div>
        )}

        {/* Password Reset Success Banner */}
        {resetParam && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-[#081C15] text-xs flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#0A4C36] text-white flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-[#081C15] text-xs sm:text-sm">Password updated successfully!</p>
              <p className="text-emerald-800 text-[11px] sm:text-xs mt-0.5 leading-snug">
                Your credentials have been securely updated. Please sign in with your new password.
              </p>
            </div>
          </div>
        )}

        {/* Contextual Reason Banner */}
        {effectiveReason && (
          <div className="mb-4 p-3 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] text-[#081C15] text-xs flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-white text-[#0A4C36] flex items-center justify-center shrink-0 border border-[#A5D6A7]/60">
              <LockSvgIcon className="w-3.5 h-3.5" />
            </div>
            <p className="font-semibold leading-snug flex-1">{effectiveReason}</p>
          </div>
        )}

        {/* Error alert banner */}
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
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="login-email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <MessageSvgIcon className="w-4 h-4" />
              </div>
              <input
                id="login-email"
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-700" htmlFor="login-password">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email.trim())
                  setResetModalStep('form')
                  setIsForgotPasswordOpen(true)
                }}
                className="text-[11px] font-bold text-[#0A4C36] hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <LockSvgIcon className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
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

          {/* Smart Submit CTA: Disabled until all fields are filled & valid */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full h-11 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 pt-0.5 mt-2 ${
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
                <span>Verifying...</span>
              </>
            ) : isFormValid ? (
              <>
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Sign In to Account</span>
                <ArrowRightSvg className="w-4 h-4" />
              </>
            ) : (
              <span>Fill email & password to sign in</span>
            )}
          </button>
        </form>

        {/* Switch to Signup */}
        <div className="mt-5 pt-3.5 border-t border-stone-100 text-center text-xs text-stone-600">
          New to GLOROV?{' '}
          <Link
            href={`/auth/signup?redirect=${encodeURIComponent(redirectPath)}`}
            className="font-bold text-[#0A4C36] hover:underline cursor-pointer"
          >
            Create account
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotPasswordOpen}
        onClose={() => {
          setIsForgotPasswordOpen(false)
          setResetModalStep('form')
        }}
        title="Reset Password"
        maxWidth="sm"
      >
        {resetModalStep === 'form' ? (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-left">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7]/70">
              <div className="w-8 h-8 rounded-xl bg-white text-[#0A4C36] flex items-center justify-center shrink-0 border border-[#A5D6A7]/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                Enter your email to receive password recovery instructions.
              </p>
            </div>

            <div>
              <label htmlFor="reset-email" className="block text-xs font-bold text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <MessageSvgIcon className="w-4 h-4" />
                </div>
                <input
                  id="reset-email"
                  type="email"
                  required
                  autoFocus
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="patron@domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0A4C36] focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <Link
                href={`/auth/forgot-password?email=${encodeURIComponent(resetEmail || email.trim())}`}
                onClick={() => setIsForgotPasswordOpen(false)}
                className="text-[11px] font-bold text-[#0A4C36] hover:underline"
              >
                Dedicated recovery page →
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetSending}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#081C15] hover:bg-[#0A4C36] text-white transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isResetSending ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#0A4C36] flex items-center justify-center mx-auto border border-emerald-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-serif font-black text-[#081C15]">Reset Link Sent</h3>
              <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto leading-relaxed">
                We&apos;ve sent recovery instructions to <strong className="text-stone-900">{resetEmail}</strong>. Please check your inbox and spam folder.
              </p>
            </div>
            <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
              <Link
                href={`/auth/reset-password?email=${encodeURIComponent(resetEmail)}`}
                onClick={() => setIsForgotPasswordOpen(false)}
                className="w-full py-2 rounded-xl text-xs font-bold bg-[#081C15] hover:bg-[#0A4C36] text-white text-center transition"
              >
                Set New Password Now →
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPasswordOpen(false)
                  setResetModalStep('form')
                }}
                className="w-full py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 text-center transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6 sm:py-12 px-3 sm:px-6 bg-gradient-to-b from-[#FAFBF9] via-[#F4F7F4] to-[#F9FAF8]">
      <Suspense fallback={<div className="text-center text-stone-400 text-xs py-10">Loading authentication...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

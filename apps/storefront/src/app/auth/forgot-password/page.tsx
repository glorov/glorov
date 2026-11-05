'use client'

import React, { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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

const ArrowRightSvg = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
)

function ForgotPasswordForm() {
  const searchParams = useSearchParams()
  const initialEmail = searchParams ? searchParams.get('email') || '' : ''

  const { requestPasswordReset, isLoading, authError } = useCustomerAuth()
  const { showToast } = useToast()

  const [email, setEmail] = useState(initialEmail)
  const [isSuccess, setIsSuccess] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const isEmailValid = useMemo(() => {
    return email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  }, [email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!isEmailValid) return

    const res = await requestPasswordReset(email.trim())
    if (res.success) {
      setIsSuccess(true)
      showToast('success', `Password recovery link dispatched to ${email.trim()}`, {
        title: 'Instructions Sent',
      })
    } else {
      setLocalError(res.error || 'Failed to dispatch recovery link. Please try again.')
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
          {isSuccess ? 'Check Your Inbox' : 'Reset Password'}
        </h1>
        <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
          {isSuccess
            ? 'We have sent recovery instructions to your email address'
            : 'Enter the email associated with your GLOROV account'}
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
          <span>256-Bit SSL Encrypted Recovery</span>
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

        {isSuccess ? (
          /* Success Confirmation View (Matches Flutter _buildSuccessView) */
          <div className="space-y-4 text-center py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#0A4C36] flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
              We&apos;ve sent password reset instructions to <strong className="text-stone-900">{email.trim()}</strong>. Follow the instructions to set your new password.
            </p>

            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                href={`/auth/reset-password?email=${encodeURIComponent(email.trim())}`}
                className="w-full h-11 rounded-xl font-bold text-xs sm:text-sm bg-[#081C15] hover:bg-[#0A4C36] text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <span>Set New Password Now</span>
                <ArrowRightSvg className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="w-full py-2.5 rounded-xl font-semibold text-xs text-stone-600 hover:bg-stone-100 transition cursor-pointer"
              >
                Send to a different email
              </button>
            </div>
          </div>
        ) : (
          /* Request Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="recovery-email">
                Registered Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <MessageSvgIcon className="w-4 h-4" />
                </div>
                <input
                  id="recovery-email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patron@domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4C36] focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isEmailValid || isLoading}
              className={`w-full h-11 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 pt-0.5 mt-2 ${
                isEmailValid && !isLoading
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
                  <span>Sending Instructions...</span>
                </>
              ) : isEmailValid ? (
                <>
                  <span>Send Recovery Instructions</span>
                  <ArrowRightSvg className="w-4 h-4" />
                </>
              ) : (
                <span>Enter valid email to send link</span>
              )}
            </button>
          </form>
        )}

        {/* Return to Login */}
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

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6 sm:py-12 px-3 sm:px-6 bg-gradient-to-b from-[#FAFBF9] via-[#F4F7F4] to-[#F9FAF8]">
      <Suspense fallback={<div className="text-center text-stone-400 text-xs py-10">Loading recovery...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  )
}

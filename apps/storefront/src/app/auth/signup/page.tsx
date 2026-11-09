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

const CheckSvgIcon = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
)

function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: '', color: 'bg-stone-200' }
  if (pwd.length < 8) return { score: 1, label: 'Too short (min 8 chars)', color: 'bg-rose-500' }

  let score = 1
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1
  if (/\d/.test(pwd)) score += 1
  if (/[^a-zA-Z0-9]/.test(pwd)) score += 1

  if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' }
  if (score === 3) return { score: 3, label: 'Good', color: 'bg-emerald-500' }
  return { score: 4, label: 'Strong botanical key', color: 'bg-[#0A4C36]' }
}

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

  // 2-Step Wizard State: Step 1 (Personal Info) | Step 2 (Security / Password)
  const [step, setStep] = useState<1 | 2>(1)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [localError, setLocalError] = useState<string | null>(null)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Real-time Field Validations
  const isFirstNameValid = firstName.trim().length > 0
  const isLastNameValid = lastName.trim().length > 0
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const cleanPhone = phone.trim().replace(/\D/g, '')
  const isPhoneValid = cleanPhone.length === 10
  const isPasswordValid = password.length >= 8
  const isConfirmValid = confirmPassword.length > 0 && confirmPassword === password

  // Step 1 Validity (Personal & Contact)
  const isStep1Valid = useMemo(() => {
    return isFirstNameValid && isLastNameValid && isEmailValid && isPhoneValid
  }, [isFirstNameValid, isLastNameValid, isEmailValid, isPhoneValid])

  // Step 2 Validity (Password & Terms)
  const isStep2Valid = useMemo(() => {
    return isPasswordValid && isConfirmValid && agreeTerms
  }, [isPasswordValid, isConfirmValid, agreeTerms])

  const pwdStrength = useMemo(() => getPasswordStrength(password), [password])

  const handleNextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setTouched((prev) => ({
      ...prev,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    }))
    if (!isStep1Valid) return
    setLocalError(null)
    setStep(2)
  }

  const handlePrevStep = () => {
    setLocalError(null)
    setStep(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setTouched((prev) => ({
      ...prev,
      password: true,
      confirmPassword: true,
    }))

    if (!isStep1Valid) {
      setStep(1)
      return
    }

    if (!isStep2Valid) return

    const res = await register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: cleanPhone,
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
    <div className="w-full max-w-[440px] mx-auto bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
      {/* Compact Clean Header */}
      <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 text-center bg-gradient-to-b from-[#F2F7F4] to-[#F9FAF8] border-b border-stone-100">
        <Link href="/" className="inline-block transition-transform hover:scale-[1.02] mb-2">
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
        <p className="text-xs text-stone-500 mt-0.5 max-w-xs mx-auto">
          Join our botanical circle for nursery orders & patron care
        </p>

        {/* Security Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-[10.5px] font-semibold text-[#0A4C36] mt-2">
          <LockSvgIcon className="w-3 h-3 text-[#0A4C36]" />
          <span>256-Bit SSL Secure Registration</span>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Step Progress Indicator matching modern e-commerce checkout best practices */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <button
              type="button"
              onClick={() => step === 2 && handlePrevStep()}
              className={`flex items-center gap-1.5 font-bold transition-opacity ${step === 1 ? 'text-[#081C15]' : 'text-stone-500 hover:text-[#0A4C36] cursor-pointer'
                }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10.5px] font-black transition-colors ${step === 1
                    ? 'bg-[#0A4C36] text-white'
                    : 'bg-emerald-100 text-[#0A4C36]'
                  }`}
              >
                {step > 1 ? <CheckSvgIcon className="w-3 h-3" /> : '1'}
              </span>
              <span>Personal Details</span>
            </button>

            <div className="flex items-center gap-1.5 font-bold">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10.5px] font-black transition-colors ${step === 2
                    ? 'bg-[#0A4C36] text-white'
                    : 'bg-stone-200 text-stone-500'
                  }`}
              >
                2
              </span>
              <span className={step === 2 ? 'text-[#081C15]' : 'text-stone-400'}>
                Set Password
              </span>
            </div>
          </div>

          {/* Progress Bar Line */}
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0A4C36] to-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

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

        {/* Multi-step Registration Form */}
        <form onSubmit={step === 1 ? handleNextStep : handleSubmit} className="space-y-3">
          {/* ================= STEP 1: Personal & Contact Details ================= */}
          <div className={step === 1 ? 'space-y-3' : 'hidden'}>
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
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, firstName: true }))}
                    placeholder="First name"
                    className="w-full pl-9 pr-2.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4C36] focus:border-transparent transition"
                  />
                </div>
                {touched.firstName && !isFirstNameValid && (
                  <p className="mt-1 text-[10.5px] text-rose-500">First name is required</p>
                )}
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
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, lastName: true }))}
                    placeholder="Last name"
                    className="w-full pl-9 pr-2.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4C36] focus:border-transparent transition"
                  />
                </div>
                {touched.lastName && !isLastNameValid && (
                  <p className="mt-1 text-[10.5px] text-rose-500">Last name is required</p>
                )}
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
                  onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                  placeholder="patron@domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4C36] focus:border-transparent transition"
                />
              </div>
              {touched.email && !isEmailValid && (
                <p className="mt-1 text-[10.5px] text-rose-500">Enter a valid email address</p>
              )}
            </div>

            {/* Mobile Phone (Indian format +91 for order shipping updates) */}
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
                  inputMode="numeric"
                  maxLength={10}
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                  placeholder="9876543210"
                  className="w-full px-3 py-2.5 bg-transparent text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 focus:outline-none font-mono"
                />
              </div>
              {touched.phone && !isPhoneValid && (
                <p className="mt-1 text-[10.5px] text-rose-500">Enter a 10-digit Indian mobile number</p>
              )}
              <p className="mt-1 text-[10.5px] text-stone-500">
                Used for dispatch updates & live plant delivery coordination
              </p>
            </div>

            {/* Step 1 CTA: Continue to Set Password */}
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!isStep1Valid}
              className={`w-full h-11 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 pt-0.5 mt-3 ${isStep1Valid
                  ? 'bg-[#081C15] hover:bg-[#0A4C36] active:bg-[#04281B] text-white cursor-pointer active:scale-[0.99] shadow-sm'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-200/80'
                }`}
            >
              <span>Continue to Set Password</span>
              <ArrowRightSvg className="w-4 h-4" />
            </button>
          </div>

          {/* ================= STEP 2: Password & Security ================= */}
          <div className={step === 2 ? 'space-y-3' : 'hidden'}>
            {/* Patron Details Summary Pill */}
            <div className="p-3 rounded-2xl bg-[#F4F7F4] border border-[#E0EBE3] flex items-center justify-between text-xs">
              <div className="min-w-0 pr-2">
                <p className="font-bold text-stone-900 truncate">
                  {firstName} {lastName}
                </p>
                <p className="text-[11px] text-stone-500 truncate">
                  {email} • +91 {phone}
                </p>
              </div>
              <button
                type="button"
                onClick={handlePrevStep}
                className="text-[11px] font-bold text-[#0A4C36] hover:underline shrink-0 px-2 py-1 rounded-lg hover:bg-emerald-50 transition"
              >
                Edit
              </button>
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
                  onBlur={() => setTouched((p) => ({ ...p, password: true }))}
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

              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex gap-1 h-1 w-full">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-full flex-1 rounded-full transition-colors ${pwdStrength.score >= level ? pwdStrength.color : 'bg-stone-200'
                          }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-stone-500">Security strength:</span>
                    <span className="font-semibold text-stone-700">{pwdStrength.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700" htmlFor="signup-confirm-password">
                  Confirm Password *
                </label>
                {confirmPassword.length > 0 && (
                  <span
                    className={`text-[10px] font-semibold ${isConfirmValid ? 'text-emerald-700' : 'text-rose-600'
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
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent transition ${confirmPassword.length > 0 && !isConfirmValid
                      ? 'border-rose-300 focus:ring-rose-500'
                      : 'border-stone-300 focus:ring-[#0A4C36]'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer transition-colors"
                >
                  {showConfirmPassword ? <EyeOffSvgIcon className="w-4 h-4" /> : <EyeSvgIcon className="w-4 h-4" />}
                </button>
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

            {/* Step 2 CTA Row: Back & Submit */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handlePrevStep}
                className="h-11 px-3.5 sm:px-4 rounded-xl border border-stone-300 hover:border-stone-400 text-stone-700 font-bold text-xs sm:text-sm hover:bg-stone-50 transition flex items-center justify-center gap-1 shrink-0"
              >
                <span>← Back</span>
              </button>

              <button
                type="submit"
                disabled={!isStep2Valid || isLoading}
                className={`flex-1 h-11 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${isStep2Valid && !isLoading
                    ? 'bg-[#081C15] hover:bg-[#0A4C36] active:bg-[#04281B] text-white cursor-pointer active:scale-[0.99] shadow-sm'
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
                ) : (
                  <>
                    <LockSvgIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Create Patron Account</span>
                    <ArrowRightSvg className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Switch to Sign In */}
        <div className="mt-4 pt-3.5 border-t border-stone-100 text-center text-xs text-stone-600">
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
    <div className="min-h-[80vh] flex items-center justify-center py-4 sm:py-12 px-2.5 sm:px-6 bg-gradient-to-b from-[#FAFBF9] via-[#F4F7F4] to-[#F9FAF8]">
      <Suspense fallback={<div className="text-center text-stone-400 text-xs py-10">Loading registration...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  )
}

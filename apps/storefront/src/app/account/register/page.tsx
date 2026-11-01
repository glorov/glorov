'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { registerCustomerAction, getCurrentCustomerAction } from '@/lib/customer-actions'
import { getSafeRedirectUrl } from '@/lib/security'
import styles from '../AuthPage.module.css'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = getSafeRedirectUrl(searchParams.get('callbackUrl'), '/account')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    async function checkExistingAuth() {
      try {
        const res = await getCurrentCustomerAction()
        if (res.success && res.customer) {
          router.replace(callbackUrl)
          return
        }
      } finally {
        setIsCheckingAuth(false)
      }
    }
    checkExistingAuth()
  }, [router, callbackUrl])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('Please enter both your first and last name')
      return
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address')
      return
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      return
    }

    if (phone.trim() && !/^[6-9][0-9]{9}$/.test(phone.trim())) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number')
      return
    }

    setIsLoading(true)
    try {
      const res = await registerCustomerAction({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      })

      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed. Please verify your details.')
        return
      }

      // Successful registration
      router.push(callbackUrl)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className={styles.spinnerCenter} aria-label="Checking authentication status">
        <Loader2 className={styles.spinAnimation} size={28} color="#0a4c36" />
      </div>
    )
  }

  return (
    <main className={styles.authWrapper}>
      <div className={styles.authContainer}>
        {/* Header Branding */}
        <div className={styles.authHeader}>
          <Link href="/" className={styles.logoLink} aria-label="GLOROV Botanicals Homepage">
            <Image
              src="/glorov-logo.svg"
              alt="GLOROV"
              width={160}
              height={44}
              priority
              className={styles.authLogoImg}
            />
          </Link>
          <h1 className={styles.authTitle}>Create an Account</h1>
          <p className={styles.authSubtitle}>
            Join GLOROV for express delivery of live plants, seed viability tracking, and care guides
          </p>
        </div>

        {/* Auth Card */}
        <div className={styles.authCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Customer Registration</h2>
            <p className={styles.cardDescription}>
              Fill in your details to set up your verified GLOROV profile
            </p>
          </div>

          <div className={styles.cardBody}>
            {errorMessage && (
              <div role="alert" aria-live="polite" className={styles.alertError}>
                <AlertCircle size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className={styles.form} aria-label="Customer registration form">
              <div className={styles.formRowTwoCol}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="firstName">
                    First Name *
                  </label>
                  <div className={styles.inputWrapper}>
                    <User className={styles.inputIcon} aria-hidden="true" />
                    <input
                      id="firstName"
                      type="text"
                      required
                      aria-required="true"
                      placeholder="Aarav"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="lastName">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    aria-required="true"
                    placeholder="Sharma"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={styles.input}
                    style={{ paddingLeft: 14 }}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="regEmail">
                  Email Address *
                </label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} aria-hidden="true" />
                  <input
                    id="regEmail"
                    type="email"
                    required
                    aria-required="true"
                    autoComplete="email"
                    placeholder="aarav.sharma@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="regPhone">
                  Mobile Number (Optional)
                </label>
                <div className={styles.inputWrapper}>
                  <Phone className={styles.inputIcon} aria-hidden="true" />
                  <input
                    id="regPhone"
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210 (10 digits)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formRowTwoCol}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="regPassword">
                    Password * (8+ chars)
                  </label>
                  <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} aria-hidden="true" />
                    <input
                      id="regPassword"
                      type="password"
                      required
                      aria-required="true"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="confirmPassword">
                    Confirm Password *
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    aria-required="true"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.input}
                    style={{ paddingLeft: 14 }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={styles.submitBtn}
                aria-label={isLoading ? 'Creating account' : 'Create verified account'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className={styles.spinAnimation} size={16} aria-hidden="true" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Verified Account</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className={styles.cardFooter}>
            <p className={styles.footerText}>
              Already have an account?{' '}
              <Link
                href={`/account/login${callbackUrl !== '/account' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
                className={styles.footerLink}
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.spinnerCenter} aria-label="Loading registration page">
          <Loader2 className={styles.spinAnimation} size={28} color="#0a4c36" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}

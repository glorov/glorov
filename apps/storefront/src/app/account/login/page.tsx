'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, Loader2, KeyRound } from 'lucide-react'
import {
  loginCustomerAction,
  requestPasswordResetAction,
  getCurrentCustomerAction,
} from '@/lib/customer-actions'
import { getSafeRedirectUrl } from '@/lib/security'
import styles from '../AuthPage.module.css'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = getSafeRedirectUrl(searchParams.get('callbackUrl'), '/account')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  // Forgot password flow
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [isForgotLoading, setIsForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null)
  const [forgotError, setForgotError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password')
      return
    }

    setIsLoading(true)
    try {
      const res = await loginCustomerAction({
        email: email.trim(),
        password,
      })

      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please check your credentials.')
        return
      }

      // Successful login
      router.push(callbackUrl)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed due to unexpected error'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError(null)
    setForgotSuccess(null)

    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setForgotError('Enter a valid email address')
      return
    }

    setIsForgotLoading(true)
    try {
      const res = await requestPasswordResetAction(forgotEmail.trim())
      if (!res.success) {
        setForgotError(res.error || 'Password reset request failed')
        return
      }
      setForgotSuccess(res.message)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error sending password reset'
      setForgotError(msg)
    } finally {
      setIsForgotLoading(false)
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
          <h1 className={styles.authTitle}>Customer Sign In</h1>
          <p className={styles.authSubtitle}>
            Access your orders, saved botanical addresses, and plant care history
          </p>
        </div>

        {/* Auth Card */}
        <div className={styles.authCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Welcome back</h2>
            <p className={styles.cardDescription}>
              Enter your registered GLOROV account credentials
            </p>
          </div>

          <div className={styles.cardBody}>
            {errorMessage && (
              <div role="alert" aria-live="polite" className={styles.alertError}>
                <AlertCircle size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className={styles.form} aria-label="Customer sign in form">
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="email">
                  Email Address
                </label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} aria-hidden="true" />
                  <input
                    id="email"
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
                <div className={styles.formGroupHeader}>
                  <label className={styles.label} htmlFor="password">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true)
                      setForgotEmail(email)
                    }}
                    className={styles.textLink}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} aria-hidden="true" />
                  <input
                    id="password"
                    type="password"
                    required
                    aria-required="true"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={styles.submitBtn}
                aria-label={isLoading ? 'Signing in' : 'Sign in to account'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className={styles.spinAnimation} size={16} aria-hidden="true" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className={styles.cardFooter}>
            <p className={styles.footerText}>
              Don&apos;t have an account yet?{' '}
              <Link
                href={`/account/register${callbackUrl !== '/account' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
                className={styles.footerLink}
              >
                Create Account
              </Link>
            </p>
            {callbackUrl.includes('checkout') && (
              <p className={styles.footerText}>
                or{' '}
                <Link href="/checkout" className={styles.footerLink}>
                  Continue as Guest
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Forgot Password Section */}
        {showForgotModal && (
          <div className={styles.forgotBox} role="region" aria-label="Password recovery section">
            <h3 className={styles.forgotTitle}>Reset Your Password</h3>
            <p className={styles.forgotDesc}>
              Enter your email to receive recovery instructions.
            </p>

            {forgotSuccess ? (
              <div className={styles.alertSuccess} role="status">
                <CheckCircle2 size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{forgotSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className={styles.form} aria-label="Password reset request">
                {forgotError && (
                  <div className={styles.alertError} role="alert">
                    <span>{forgotError}</span>
                  </div>
                )}
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="forgot-email">
                    Account Email
                  </label>
                  <div className={styles.inputWrapper}>
                    <Mail className={styles.inputIcon} aria-hidden="true" />
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      aria-required="true"
                      placeholder="Enter your email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>
                <div className={styles.forgotActions}>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className={styles.sendBtn}
                  >
                    {isForgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>

                <div style={{ paddingTop: 10, textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
                  <Link
                    href="/account/reset-password"
                    className={styles.textLink}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <KeyRound size={12} aria-hidden="true" />
                    Already have a reset token? Set new password
                  </Link>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.spinnerCenter} aria-label="Loading authentication page">
          <Loader2 className={styles.spinAnimation} size={28} color="#0a4c36" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}

'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Lock, KeyRound, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import { resetCustomerPasswordAction } from '@/lib/customer-actions'
import styles from '../AuthPage.module.css'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const initialToken = searchParams.get('token') || ''

  const [token, setToken] = useState(initialToken)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!token.trim()) {
      setErrorMessage('Reset token is required')
      return
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const res = await resetCustomerPasswordAction({
        token: token.trim(),
        password,
        confirm_password: confirmPassword,
      })

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to reset password. The link or token may have expired.')
        return
      }

      setIsSuccess(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error resetting password'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
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
          <h1 className={styles.authTitle}>Set New Password</h1>
          <p className={styles.authSubtitle}>
            Choose a secure 8+ character password for your account
          </p>
        </div>

        {/* Auth Card */}
        <div className={styles.authCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Account Recovery</h2>
            <p className={styles.cardDescription}>
              Enter your reset token and new account password
            </p>
          </div>

          <div className={styles.cardBody}>
            {isSuccess ? (
              <div>
                <div className={styles.alertSuccess} role="status">
                  <CheckCircle2 size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '0.875rem', fontWeight: 700 }}>
                      Password Successfully Reset!
                    </h3>
                    <p style={{ margin: 0 }}>
                      Your account credentials have been updated. You can now sign in with your new
                      password.
                    </p>
                  </div>
                </div>

                <Link
                  href="/account/login"
                  className={styles.submitBtn}
                  style={{ textDecoration: 'none' }}
                >
                  <span>Sign In with New Password</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form} aria-label="Reset password form">
                {errorMessage && (
                  <div role="alert" aria-live="polite" className={styles.alertError}>
                    <AlertCircle size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="token">
                    Reset Token *
                  </label>
                  <div className={styles.inputWrapper}>
                    <KeyRound className={styles.inputIcon} aria-hidden="true" />
                    <input
                      id="token"
                      type="text"
                      required
                      aria-required="true"
                      placeholder="Paste reset token here"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className={styles.input}
                      style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="newPassword">
                    New Password * (8+ chars)
                  </label>
                  <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} aria-hidden="true" />
                    <input
                      id="newPassword"
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
                  <label className={styles.label} htmlFor="confirmNewPassword">
                    Confirm New Password *
                  </label>
                  <input
                    id="confirmNewPassword"
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className={styles.submitBtn}
                  aria-label={isLoading ? 'Updating password' : 'Reset password'}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className={styles.spinAnimation} size={16} aria-hidden="true" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Reset Password</span>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className={styles.cardFooter}>
            <p className={styles.footerText}>
              Remember your password?{' '}
              <Link href="/account/login" className={styles.footerLink}>
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.spinnerCenter} aria-label="Loading password reset page">
          <Loader2 className={styles.spinAnimation} size={28} color="#0a4c36" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}

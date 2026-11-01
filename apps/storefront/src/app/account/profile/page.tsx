'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Phone, Building2, CheckCircle2, AlertCircle, Loader2, Lock, ArrowLeft } from 'lucide-react'

import {
  getCurrentCustomerAction,
  updateCustomerProfileAction,
  updateCustomerPasswordAction,
} from '@/lib/customer-actions'
import type { StoreCustomer } from '@/lib/customer'
import { AccountNav } from '@/components/account/AccountNav'
import styles from './CustomerProfile.module.css'

export default function ProfilePage() {
  const router = useRouter()
  const [customer, setCustomer] = useState<StoreCustomer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')

  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Password change states
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setIsUpdatingPassword(true)
    try {
      const res = await updateCustomerPasswordAction({
        password: newPassword,
        confirm_password: confirmPassword,
      })

      if (!res.success) {
        setPasswordError(res.error || 'Failed to update password')
        return
      }

      setPasswordSuccess('Your password has been changed successfully.')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error changing password'
      setPasswordError(msg)
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  useEffect(() => {
    async function loadCustomer() {
      setIsLoading(true)
      try {
        const res = await getCurrentCustomerAction()
        if (!res.success || !res.customer) {
          router.push('/account/login')
          return
        }
        setCustomer(res.customer)
        setFirstName(res.customer.first_name || '')
        setLastName(res.customer.last_name || '')
        setPhone(res.customer.phone || '')
        setCompanyName(res.customer.company_name || '')
      } finally {
        setIsLoading(false)
      }
    }
    loadCustomer()
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('First and last name are required')
      return
    }

    if (phone.trim() && !/^[6-9][0-9]{9}$/.test(phone.trim())) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number')
      return
    }

    setIsSaving(true)
    try {
      const res = await updateCustomerProfileAction({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || undefined,
        company_name: companyName.trim() || undefined,
      })

      if (!res.success || !res.customer) {
        setErrorMessage(res.error || 'Failed to update profile')
        return
      }

      setCustomer(res.customer)
      setSuccessMessage('Your profile information was updated successfully.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating profile'
      setErrorMessage(msg)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.spinnerContainer} aria-label="Loading customer profile">
        <Loader2 size={32} color="#0a4c36" className={styles.spinner} />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Mobile Back Bar */}
      <div className={styles.mobileTopBar}>
        <Link href="/account" className={styles.mobileBackBtn} aria-label="Back to Account Dashboard">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Account</span>
        </Link>
      </div>

      <header className={styles.headerArea}>
        <h1 className={styles.title}>Profile Settings</h1>
        <p className={styles.subtitle}>
          Update your personal details, contact numbers, and security credentials.
        </p>
      </header>

      <div className={styles.profileLayout}>
        <AccountNav />

        <main className={styles.mainContent} aria-label="Customer profile and settings">
          {/* Personal Information Card */}
          <section className={styles.profileCard} aria-labelledby="personal-info-heading">
            <div className={styles.cardHeader}>
              <h2 id="personal-info-heading" className={styles.cardTitle}>
                <User size={18} aria-hidden="true" />
                <span>Personal Information</span>
              </h2>
              <p className={styles.cardSubtitle}>
                These details will be used for delivery coordination and order updates.
              </p>
            </div>

            <div className={styles.cardBody}>
              {successMessage && (
                <div role="status" aria-live="polite" className={styles.alertSuccess}>
                  <CheckCircle2 size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div role="alert" aria-live="polite" className={styles.alertError}>
                  <AlertCircle size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSave} className={styles.form} aria-label="Update personal details">
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="profile-first-name">
                      First Name *
                    </label>
                    <input
                      id="profile-first-name"
                      required
                      aria-required="true"
                      autoComplete="given-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={styles.input}
                      style={{ paddingLeft: 14 }}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="profile-last-name">
                      Last Name *
                    </label>
                    <input
                      id="profile-last-name"
                      required
                      aria-required="true"
                      autoComplete="family-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={styles.input}
                      style={{ paddingLeft: 14 }}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className={styles.label} htmlFor="profile-email">
                      Email Address
                    </label>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '2px 8px', borderRadius: 9999, backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
                      Primary Auth Identity
                    </span>
                  </div>
                  <div className={styles.inputWrapper}>
                    <Mail className={styles.inputIcon} aria-hidden="true" />
                    <input
                      id="profile-email"
                      disabled
                      type="email"
                      value={customer?.email || ''}
                      className={`${styles.input} ${styles.inputDisabled}`}
                    />
                  </div>
                  <p style={{ fontSize: '0.6875rem', color: '#64748b', margin: '2px 0 0' }}>
                    To modify your login email address, contact customer care at support@glorov.in.
                  </p>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="profile-phone">
                      Mobile Number
                    </label>
                    <div className={styles.inputWrapper}>
                      <Phone className={styles.inputIcon} aria-hidden="true" />
                      <input
                        id="profile-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        maxLength={10}
                        placeholder="9876543210 (10 digits)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="profile-company">
                      Company / Organization (Optional)
                    </label>
                    <div className={styles.inputWrapper}>
                      <Building2 className={styles.inputIcon} aria-hidden="true" />
                      <input
                        id="profile-company"
                        type="text"
                        autoComplete="organization"
                        placeholder="Nursery, Garden Club, etc."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className={styles.submitBtn}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className={styles.spinner} aria-hidden="true" />
                      <span>Saving changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </form>
            </div>
          </section>

          {/* Security & Password Card */}
          <section className={styles.profileCard} aria-labelledby="security-password-heading">
            <div className={styles.cardHeader}>
              <h2 id="security-password-heading" className={styles.cardTitle}>
                <Lock size={18} aria-hidden="true" />
                <span>Security &amp; Password</span>
              </h2>
              <p className={styles.cardSubtitle}>
                Update your account password to keep your botanical orders and saved data safe.
              </p>
            </div>

            <div className={styles.cardBody}>
              {passwordSuccess && (
                <div role="status" aria-live="polite" className={styles.alertSuccess}>
                  <CheckCircle2 size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div role="alert" aria-live="polite" className={styles.alertError}>
                  <AlertCircle size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className={styles.form} aria-label="Update password">
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="profile-new-password">
                      New Password * (8+ chars)
                    </label>
                    <input
                      id="profile-new-password"
                      required
                      aria-required="true"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={styles.input}
                      style={{ paddingLeft: 14 }}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="profile-confirm-password">
                      Confirm New Password *
                    </label>
                    <input
                      id="profile-confirm-password"
                      required
                      aria-required="true"
                      type="password"
                      autoComplete="new-password"
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
                  disabled={isUpdatingPassword}
                  className={styles.submitBtn}
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 size={16} className={styles.spinner} aria-hidden="true" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

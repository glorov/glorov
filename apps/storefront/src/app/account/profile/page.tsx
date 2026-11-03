'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCustomerAuth } from '../../../context/CustomerAuthContext'
import { GlorovAccountIcon } from '../../../components/common/GlorovAccountIcon'

export default function ProfilePage() {
  const { customer, updateProfile } = useCustomerAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [gardeningExperience, setGardeningExperience] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Intermediate')
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [resetSent, setResetSent] = useState(false)

  useEffect(() => {
    if (customer) {
      setFirstName(customer.firstName || '')
      setLastName(customer.lastName || '')
      setPhone(customer.phone || '')
      if (customer.gardeningExperience) {
        setGardeningExperience(customer.gardeningExperience)
      }
    }
  }, [customer])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setStatusMessage(null)

    try {
      const success = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        gardeningExperience,
      })

      if (success) {
        setStatusMessage({ type: 'success', text: 'Profile updated successfully in browser memory!' })
        setTimeout(() => setStatusMessage(null), 4000)
      } else {
        setStatusMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordReset = () => {
    setResetSent(true)
    setTimeout(() => setResetSent(false), 5000)
  }

  const displayName = `${firstName} ${lastName}`.trim() || customer?.email || 'Botanical Patron'

  if (!customer) {
    return (
      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-stone-200/90 shadow-xs text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#E8F5E9] border-1.5 border-[#86EFAC] text-[#1B4332] flex items-center justify-center">
          <GlorovAccountIcon user={null} size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-900 font-serif">Sign In to View Your Profile</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
            Please sign in to view and customize your botanical patron name, contact coordinates, and gardening preferences.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/auth/login"
            className="px-5 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#163829] transition shadow-xs"
          >
            Sign In to GLOROV
          </Link>
          <Link
            href="/auth/signup"
            className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
          >
            Create Account
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Title & Status Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-serif">Customer Profile</h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your personal botanical club information, contact coordinates, and gardening preferences.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full bg-[#E8F5E9] border border-[#B7E4C7] text-[#1B4332] text-xs font-bold whitespace-nowrap">
          <svg className="w-3.5 h-3.5 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Verified Patron</span>
        </div>
      </div>

      {/* Demo Account Badge Notice (Identical to Flutter ProfileSection) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#E8F5E9]/60 border border-[#B7E4C7] flex items-start gap-3 text-xs text-[#1B4332] leading-relaxed">
        <svg className="w-4 h-4 text-[#1B4332] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <p>
          <strong className="font-bold">Demonstration Account:</strong> This profile is preconfigured for frontend evaluation. Form edits persist in your browser localStorage without requiring SMS OTP or external auth servers.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs">
        {/* User Avatar & Membership Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-stone-100">
          <GlorovAccountIcon user={customer} size={64} showBadge={true} />
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 font-serif truncate">
              {displayName}
            </h2>
            <p className="text-xs text-stone-500 truncate">{customer?.email}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#0F281E]/10 text-[#0F281E] text-[10px] font-bold">
                Botanical Patron • Green Club
              </span>
              <span className="text-[10px] text-stone-400">
                {customer?.memberSince ? `Member since ${customer.memberSince}` : 'Member since March 2026'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Toast Alert */}
        {statusMessage && (
          <div
            className={`my-4 p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-semibold">{statusMessage.text}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="profile-first-name">
                First Name *
              </label>
              <input
                id="profile-first-name"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Aarav"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="profile-last-name">
                Last Name *
              </label>
              <input
                id="profile-last-name"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="profile-email">
                Email Address
              </label>
              <input
                id="profile-email"
                type="email"
                disabled
                value={customer?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 text-xs cursor-not-allowed select-none"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                Your email address serves as your primary Medusa account identifier.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="profile-phone">
                Mobile Phone (10 Digits) *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-stone-300 bg-stone-50 text-stone-600 text-xs font-mono font-medium">
                  +91
                </span>
                <input
                  id="profile-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 rounded-r-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition"
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-1">
                Used for SMS shipment alerts and cold-chain courier delivery verification.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="profile-experience">
              Gardening Experience Level
            </label>
            <select
              id="profile-experience"
              value={gardeningExperience}
              onChange={(e) => setGardeningExperience(e.target.value as 'Beginner' | 'Intermediate' | 'Expert')}
              className="w-full sm:w-2/3 px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent bg-white transition cursor-pointer"
            >
              <option value="Beginner">Beginner (Indoor low-maintenance plants & succulents)</option>
              <option value="Intermediate">Intermediate (Balcony vegetables, perennials & flowering plants)</option>
              <option value="Expert">Expert (Hydroponics, rare exotics, terrace orchards & bonsai)</option>
            </select>
            <p className="text-[10px] text-stone-400 mt-1">
              Customizes your seasonal germination reminders and watering recommendations.
            </p>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#0F281E] hover:bg-[#1B4332] text-white font-bold text-xs transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Card */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs">
        <h3 className="text-sm font-bold text-stone-900 mb-1 font-serif">Security & Access</h3>
        <p className="text-xs text-stone-500 mb-4">
          Manage your login password and authenticated botanical sessions.
        </p>

        {resetSent ? (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Password reset verification link sent to {customer?.email || 'your email'}!</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handlePasswordReset}
            className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs transition inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span>Send Password Reset Link</span>
          </button>
        )}
      </div>
    </div>
  )
}

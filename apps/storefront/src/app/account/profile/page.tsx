'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, Building2, CheckCircle2, AlertCircle, Loader2, Lock } from 'lucide-react'

import {
  getCurrentCustomerAction,
  updateCustomerProfileAction,
  updateCustomerPasswordAction,
} from '@/lib/customer-actions'
import type { StoreCustomer } from '@/lib/customer'
import { AccountNav } from '@/components/account/AccountNav'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-botanical-700" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Profile Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update your personal details and contact numbers.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <AccountNav />

        <div className="flex-1 w-full space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-botanical-700" />
                Personal Information
              </CardTitle>
              <CardDescription className="text-xs">
                These details will be used for delivery coordination and order updates.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {successMessage && (
                <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      First Name *
                    </label>
                    <Input
                      required
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      Last Name *
                    </label>
                    <Input
                      required
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground">
                      Email Address
                    </label>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                      Primary Auth Identity
                    </Badge>
                  </div>
                  <div className="relative">
                    <Input
                      disabled
                      type="email"
                      value={customer?.email || ''}
                      className="bg-muted text-muted-foreground pl-9 cursor-not-allowed"
                    />
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    To modify your login email address, contact customer care.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Input
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210 (10 digits)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="pl-9"
                      />
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      Company / Organization (Optional)
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Nursery, Garden Club, etc."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="pl-9"
                      />
                      <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-botanical-700 hover:bg-botanical-800 text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving changes...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security & Password Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5 text-botanical-700" />
                Security &amp; Password
              </CardTitle>
              <CardDescription className="text-xs">
                Update your account password to keep your orders and saved data safe.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {passwordSuccess && (
                <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      New Password * (8+ chars)
                    </label>
                    <Input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      Confirm New Password *
                    </label>
                    <Input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="bg-botanical-700 hover:bg-botanical-800 text-white"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Leaf, Lock, Mail, User, Phone, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { registerCustomerAction, getCurrentCustomerAction } from '@/lib/customer-actions'
import { getSafeRedirectUrl } from '@/lib/security'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'

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
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-botanical-700" />
      </div>
    )
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="h-10 w-10 rounded-xl bg-botanical-700 flex items-center justify-center text-white shadow-sm group-hover:bg-botanical-800 transition-colors">
              <Leaf className="h-5 w-5 text-emerald-200" />
            </div>
            <span className="font-extrabold tracking-tight text-2xl text-botanical-900">
              GLOROV
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create an Account
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Join GLOROV for express delivery of live plants, seed viability tracking, and care guides
          </p>
        </div>

        <Card className="shadow-md border-border/80">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Customer Registration</CardTitle>
            <CardDescription className="text-xs">
              Fill in your details to set up your verified GLOROV profile
            </CardDescription>
          </CardHeader>

          <CardContent>
            {errorMessage && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="firstName">
                    First Name *
                  </label>
                  <div className="relative">
                    <Input
                      id="firstName"
                      type="text"
                      required
                      placeholder="Aarav"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-9"
                    />
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="lastName">
                    Last Name *
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    required
                    placeholder="Sharma"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="regEmail">
                  Email Address *
                </label>
                <div className="relative">
                  <Input
                    id="regEmail"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="aarav.sharma@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="regPhone">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Input
                    id="regPhone"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="regPassword">
                    Password * (8+ chars)
                  </label>
                  <div className="relative">
                    <Input
                      id="regPassword"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                    />
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="confirmPassword">
                    Confirm Password *
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-botanical-700 hover:bg-botanical-800 text-white font-medium mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Verified Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-0 border-t border-border/50 text-center">
            <div className="text-xs text-muted-foreground mt-4 w-full">
              Already have an account?{' '}
              <Link
                href={`/account/login${callbackUrl !== '/account' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
                className="font-semibold text-botanical-700 hover:text-botanical-800 hover:underline"
              >
                Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-botanical-700" /></div>}>
      <RegisterForm />
    </Suspense>
  )
}

'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Leaf, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, Loader2, KeyRound } from 'lucide-react'
import {
  loginCustomerAction,
  requestPasswordResetAction,
  getCurrentCustomerAction,
} from '@/lib/customer-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/account'

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
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-botanical-700" />
      </div>
    )
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
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
            Customer Sign In
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access your orders, saved botanical addresses, and plant care history
          </p>
        </div>

        <Card className="shadow-md border-border/80">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Welcome back</CardTitle>
            <CardDescription className="text-xs">
              Enter your registered GLOROV account credentials
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

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    id="email"
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground" htmlFor="password">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true)
                      setForgotEmail(email)
                    }}
                    className="text-xs text-botanical-700 hover:text-botanical-800 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                  />
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-botanical-700 hover:bg-botanical-800 text-white font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-0 border-t border-border/50 text-center">
            <div className="text-xs text-muted-foreground mt-4">
              Don&apos;t have an account yet?{' '}
              <Link
                href={`/account/register${callbackUrl !== '/account' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
                className="font-semibold text-botanical-700 hover:text-botanical-800 hover:underline"
              >
                Create Account
              </Link>
            </div>
            {callbackUrl.includes('checkout') && (
              <div className="text-xs text-muted-foreground">
                or{' '}
                <Link
                  href="/checkout"
                  className="font-medium text-botanical-700 hover:underline"
                >
                  Continue as Guest
                </Link>
              </div>
            )}
          </CardFooter>
        </Card>

        {/* Forgot Password Section / Dialog */}
        {showForgotModal && (
          <div className="mt-4 p-4 rounded-xl border bg-card shadow-sm text-left">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Reset Your Password
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Enter your email to receive recovery instructions.
            </p>

            {forgotSuccess ? (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{forgotSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                {forgotError && (
                  <div className="p-2 text-xs rounded bg-destructive/10 text-destructive">
                    {forgotError}
                  </div>
                )}
                <Input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isForgotLoading}
                    className="bg-botanical-700 hover:bg-botanical-800 text-white"
                  >
                    {isForgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </div>

                <div className="pt-2 text-center border-t border-border/50">
                  <Link
                    href="/account/reset-password"
                    className="text-[11px] text-botanical-700 hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    <KeyRound className="h-3 w-3" />
                    Already have a reset token? Set new password
                  </Link>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-botanical-700" /></div>}>
      <LoginForm />
    </Suspense>
  )
}

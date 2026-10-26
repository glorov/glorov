'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Leaf, Lock, KeyRound, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import { resetCustomerPasswordAction } from '@/lib/customer-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'

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
            Set New Password
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a secure 8+ character password for your account
          </p>
        </div>

        <Card className="shadow-md border-border/80">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Account Recovery</CardTitle>
            <CardDescription className="text-xs">
              Enter your reset token and new account password
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isSuccess ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 text-xs">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-emerald-950 mb-1">
                      Password Successfully Reset!
                    </h4>
                    <p>
                      Your account credentials have been updated. You can now sign in with your new
                      password.
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full bg-botanical-700 hover:bg-botanical-800 text-white font-medium"
                >
                  <Link href="/account/login">
                    Sign In with New Password
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="token">
                    Reset Token *
                  </label>
                  <div className="relative">
                    <Input
                      id="token"
                      type="text"
                      required
                      placeholder="Paste reset token here"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="pl-9 font-mono text-xs"
                    />
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground" htmlFor="newPassword">
                    New Password * (8+ chars)
                  </label>
                  <div className="relative">
                    <Input
                      id="newPassword"
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
                  <label className="text-xs font-medium text-foreground" htmlFor="confirmNewPassword">
                    Confirm New Password *
                  </label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-botanical-700 hover:bg-botanical-800 text-white font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="pt-0 border-t border-border/50 text-center">
            <div className="text-xs text-muted-foreground mt-4 w-full">
              Remember your password?{' '}
              <Link
                href="/account/login"
                className="font-semibold text-botanical-700 hover:text-botanical-800 hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-botanical-700" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}

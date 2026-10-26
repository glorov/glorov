'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, MapPin, User, LogOut } from 'lucide-react'
import { logoutCustomerAction } from '@/lib/customer-actions'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/account/orders', label: 'Order History', icon: Package },
  { href: '/account/addresses', label: 'Saved Addresses', icon: MapPin },
  { href: '/account/profile', label: 'Profile Settings', icon: User },
]

export function AccountNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logoutCustomerAction()
      router.push('/account/login')
      router.refresh()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <nav className="flex flex-col gap-1 w-full md:w-64 shrink-0 bg-card p-3 rounded-xl border shadow-sm">
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Account Navigation
      </div>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive =
          item.href === '/account'
            ? pathname === '/account'
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-botanical-700 text-white shadow-sm'
                : 'text-foreground/80 hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}

      <div className="my-2 border-t border-border" />

      <Button
        variant="ghost"
        disabled={isLoggingOut}
        onClick={handleLogout}
        className="w-full justify-start gap-3 px-3 py-2.5 h-auto text-destructive hover:bg-destructive/10 hover:text-destructive text-sm font-medium"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span>{isLoggingOut ? 'Logging out...' : 'Sign Out'}</span>
      </Button>
    </nav>
  )
}

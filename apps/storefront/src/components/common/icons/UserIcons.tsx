'use client'

import React from 'react'
import type { StoreCustomer } from '@/lib/customer'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  className?: string
}

/**
 * Custom SVG Icon specifically designed for unauthenticated / guest visitors.
 * Features a refined botanical-style user outline paired with an access / sign-in indicator.
 */
export function GuestUserIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Head silhouette with gentle botanical taper */}
      <circle cx="12" cy="7.5" r="4" />
      {/* Shoulders with open guest arc */}
      <path d="M4 20.5a8 8 0 0 1 12.5 -6.5" />
      {/* Guest / Access badge in lower-right: subtle keyhole plus badge */}
      <circle cx="18" cy="18" r="3.5" fill="#f0fdf4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M18 16.2v3.6" strokeWidth="1.6" />
      <path d="M16.2 18h3.6" strokeWidth="1.6" />
    </svg>
  )
}

/**
 * Custom SVG Icon representing an authenticated / verified customer.
 * Used when initial avatar circle is not in use or as a standalone SVG.
 */
export function AuthenticatedUserIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Authenticated user head */}
      <circle cx="12" cy="7.5" r="4" fill="currentColor" fillOpacity="0.12" />
      {/* Shoulders */}
      <path d="M4 20.5a8 8 0 0 1 11 -7" />
      {/* Verified / active check badge */}
      <circle cx="18" cy="17.5" r="4" fill="#0a4c36" stroke="#ffffff" strokeWidth="1.5" />
      <path d="M16.5 17.5l1 1 2 -2" stroke="#ffffff" strokeWidth="1.6" />
    </svg>
  )
}

interface UserProfileAvatarProps {
  customer: StoreCustomer | null
  size?: number
  className?: string
  showStatusDot?: boolean
}

/**
 * Dynamic profile avatar based on the authenticated customer profile.
 * Displays calculated initials with botanical brand styling and an active status badge.
 */
export function UserProfileAvatar({
  customer,
  size = 28,
  className,
  showStatusDot = true,
}: UserProfileAvatarProps) {
  if (!customer) {
    return <GuestUserIcon size={size} className={className} />
  }

  // Derive initials from customer profile
  const firstName = customer.first_name?.trim() || ''
  const lastName = customer.last_name?.trim() || ''
  let initials = ''

  if (firstName && lastName) {
    initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  } else if (firstName) {
    initials = firstName.slice(0, 2).toUpperCase()
  } else if (customer.email) {
    initials = customer.email.slice(0, 2).toUpperCase()
  } else {
    initials = 'G'
  }

  const fontSize = Math.max(10, Math.floor(size * 0.42))
  const dotSize = Math.max(7, Math.floor(size * 0.28))

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '9999px',
        backgroundColor: 'var(--ugaoo-dark, #0a4c36)',
        color: '#ffffff',
        border: '1.5px solid #d1fae5',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(10, 76, 54, 0.25)',
        cursor: 'pointer',
      }}
      title={`Logged in as ${customer.first_name ? `${customer.first_name} ${customer.last_name || ''}` : customer.email}`}
      aria-label={`User profile for ${customer.first_name || customer.email}`}
    >
      <span
        style={{
          fontFamily: 'var(--font-plus-jakarta), sans-serif',
          fontWeight: 700,
          fontSize: `${fontSize}px`,
          letterSpacing: '0.02em',
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        {initials}
      </span>

      {showStatusDot && (
        <span
          style={{
            position: 'absolute',
            bottom: '-1px',
            right: '-1px',
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            borderRadius: '9999px',
            backgroundColor: '#10b981',
            border: '1.5px solid #ffffff',
            boxShadow: '0 0 0 1px rgba(10, 76, 54, 0.1)',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

'use client'

import React, { useMemo } from 'react'
import type { CustomerUser } from '../../types/account'
import { GlorovCustomIcons } from './GlorovIcons'

export interface GlorovAccountIconProps {
  user?: CustomerUser | null
  size?: number
  showBadge?: boolean
  className?: string
  isActive?: boolean
}

export function getInitials(user?: CustomerUser | null): string {
  if (!user) return 'G'
  const first = user.firstName?.trim() || ''
  const last = user.lastName?.trim() || ''
  if (first && last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
  }
  if (first) {
    return first.slice(0, 2).toUpperCase()
  }
  if (user.email) {
    const namePart = user.email.split('@')[0]
    return namePart.slice(0, 2).toUpperCase()
  }
  return 'G'
}

export const GlorovAccountIcon: React.FC<GlorovAccountIconProps> = ({
  user,
  size = 24,
  showBadge = true,
  className = '',
  isActive = false,
}) => {
  const initials = useMemo(() => getInitials(user), [user])
  const badgeSize = Math.max(8, Math.round(size * 0.36))
  const fontSize = Math.max(9, Math.round(size * 0.42))

  if (user) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full select-none flex-shrink-0 transition-transform ${className}`}
        style={{ width: size, height: size }}
        aria-label={`Account of ${user.firstName || 'Patron'}`}
      >
        {/* Outer Circle with Botanical Gradient */}
        <div
          className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0A4C36 0%, #166534 100%)',
            border: '1.4px solid #86EFAC',
          }}
        >
          <span
            className="text-white font-extrabold tracking-tight"
            style={{ fontSize: `${fontSize}px`, lineHeight: 1 }}
          >
            {initials}
          </span>
        </div>

        {/* Verified Checkmark Badge at bottom-right */}
        {showBadge && (
          <span
            className="absolute rounded-full flex items-center justify-center"
            style={{
              width: `${badgeSize}px`,
              height: `${badgeSize}px`,
              right: '-1px',
              bottom: '-1px',
              backgroundColor: '#10B981',
              border: '1.2px solid #FFFFFF',
            }}
          >
            <svg
              className="text-white"
              style={{ width: `${Math.round(badgeSize * 0.7)}px`, height: `${Math.round(badgeSize * 0.7)}px` }}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}
      </div>
    )
  }

  // Guest State: Bespoke Artisanal Guest User Icon
  return (
    <div
      className={`inline-flex items-center justify-center select-none flex-shrink-0 transition-colors ${
        isActive ? 'text-[#1B4332]' : 'text-[#64748B]'
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <GlorovCustomIcons.guestUser size={size} />
    </div>
  )
}

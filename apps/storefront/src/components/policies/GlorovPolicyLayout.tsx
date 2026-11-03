'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { PageContainer } from '../layout/PageContainer'

export interface PolicyNavItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
}

export const POLICY_TABS: PolicyNavItem[] = [
  {
    id: 'privacy',
    label: 'Privacy Policy',
    href: '/policies/privacy',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    id: 'terms',
    label: 'Terms & Conditions',
    href: '/policies/terms',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
  {
    id: 'shipping',
    label: 'Shipping & Transit Shield',
    href: '/policies/shipping',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
      </svg>
    ),
  },
]

export interface GlorovPolicyLayoutProps {
  currentTab: 'privacy' | 'terms' | 'shipping'
  badgeText: string
  badgeIcon?: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
}

export const GlorovPolicyLayout: React.FC<GlorovPolicyLayoutProps> = ({
  currentTab,
  badgeText,
  badgeIcon,
  title,
  subtitle,
  children,
}) => {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="w-full bg-[#F9FAF8] pb-16 min-h-[85vh]">
      {/* Breadcrumb Strip matching Flutter */}
      <div className="w-full bg-white border-b border-stone-200/80">
        <PageContainer className="py-2.5 sm:py-3 max-w-[1040px]">
          <nav aria-label="Breadcrumb" className="text-xs text-stone-500 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1 font-semibold text-[#0F281E] hover:text-[#1B4332] transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            <span className="text-stone-300">|</span>
            <Link href="/" className="hover:text-[#1B4332] transition">
              Home
            </Link>
            <span className="text-stone-300">/</span>
            <span className="font-semibold text-stone-800 truncate max-w-[200px] sm:max-w-none">{title}</span>
          </nav>
        </PageContainer>
      </div>

      <PageContainer className="py-5 sm:py-8 max-w-[1040px] space-y-4 sm:space-y-6">
        {/* Horizontal Policy Switcher Pill Tabs matching Flutter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {POLICY_TABS.map((tab) => {
            const isActive = tab.id === currentTab || pathname === tab.href
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                  isActive
                    ? 'bg-[#0F281E] text-white'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-stone-500'}>{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Main Document Card */}
        <article className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-8 md:p-10 shadow-xs space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="border-b border-stone-100 pb-5 sm:pb-6 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5E9] border border-[#B7E4C7] text-[#1B4332] font-bold text-xs uppercase tracking-wider">
              {badgeIcon}
              <span>{badgeText}</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-tight">
              {title}
            </h1>
            <p className="text-xs text-stone-500 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Children Content */}
          <div className="space-y-6 sm:space-y-8 text-stone-700">
            {children}
          </div>
        </article>
      </PageContainer>
    </div>
  )
}

/**
 * Reusable Policy Section Component with Leading Icon
 */
export const PolicySection: React.FC<{
  icon?: React.ReactNode
  title: string
  children: React.ReactNode
}> = ({ icon, title, children }) => (
  <section className="space-y-3">
    <div className="flex items-center gap-2.5">
      {icon && <span className="text-[#1B4332] flex-shrink-0">{icon}</span>}
      <h2 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
        {title}
      </h2>
    </div>
    <div className="text-xs sm:text-sm text-stone-600 leading-relaxed space-y-2.5 pl-0 sm:pl-7">
      {children}
    </div>
  </section>
)

/**
 * Reusable Policy Callout Box with soft sage background
 */
export const PolicyCalloutBox: React.FC<{
  title: string
  text: string
  icon?: React.ReactNode
}> = ({ title, text, icon }) => (
  <div className="p-4 rounded-2xl bg-[#F2F7F4] border border-[#D1E3D8] text-xs leading-relaxed space-y-1 my-3">
    <div className="flex items-center gap-2 text-[#0A4C36] font-bold">
      {icon || (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      <span>{title}</span>
    </div>
    <p className="text-[#234433]">{text}</p>
  </div>
)

/**
 * Reusable Bullet item with green dot
 */
export const PolicyBullet: React.FC<{
  label: string
  description: string
}> = ({ label, description }) => (
  <li className="flex items-start gap-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
    <span className="w-1.5 h-1.5 rounded-full bg-[#1B4332] mt-2 flex-shrink-0" />
    <div>
      <strong className="font-bold text-stone-900">{label}</strong>{' '}
      <span>{description}</span>
    </div>
  </li>
)

/**
 * Reusable Contact Card helper
 */
export const PolicyContactCard: React.FC<{
  title: string
  entity: string
  address: string
  email: string
  phone: string
}> = ({ title, entity, address, email, phone }) => (
  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2 text-xs text-stone-700">
    <p className="font-bold text-stone-900 font-serif text-sm">{title}</p>
    <div className="flex items-center gap-2">
      <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <span>{entity}</span>
    </div>
    <div className="flex items-center gap-2">
      <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span>{address}</span>
    </div>
    <div className="flex items-center gap-2">
      <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <a href={`mailto:${email}`} className="text-[#1B4332] font-semibold hover:underline">
        {email}
      </a>
    </div>
    <div className="flex items-center gap-2">
      <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
      <span>{phone}</span>
    </div>
  </div>
)

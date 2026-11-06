'use client'

import React, { useState } from 'react'
import { PageContainer } from '../../../components/layout/PageContainer'
import { Button } from '../../../components/ui/Button'
import { IconButton } from '../../../components/ui/IconButton'
import { Input } from '../../../components/ui/Input'
import { Textarea } from '../../../components/ui/Textarea'
import { Select } from '../../../components/ui/Select'
import { Checkbox } from '../../../components/ui/Checkbox'
import { Radio } from '../../../components/ui/Radio'
import { Badge } from '../../../components/ui/Badge'
import { Card } from '../../../components/ui/Card'
import { Divider } from '../../../components/ui/Divider'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { Spinner } from '../../../components/feedback/Spinner'
import { Alert } from '../../../components/feedback/Alert'
import { Modal } from '../../../components/ui/Modal'
import { Drawer } from '../../../components/ui/Drawer'
import { Tooltip } from '../../../components/ui/Tooltip'

/**
 * Development-Only Design System & Reusable Component Showcase.
 * Used for visual verification across all required viewport widths (350px to 1440px).
 */
export default function DesignSystemShowcasePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerPlacement, setDrawerPlacement] = useState<'left' | 'right' | 'bottom'>('left')
  const [checkboxChecked, setCheckboxChecked] = useState(true)
  const [radioSelected, setRadioSelected] = useState('razorpay')
  const [inputValue, setInputValue] = useState('411001')
  const [alertDismissed, setAlertDismissed] = useState(false)

  return (
    <PageContainer className="py-8 sm:py-12 space-y-12">
      {/* ─── Showcase Header ─────────────────────────────────────────────── */}
      <div className="border-b border-border-subtle pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <Badge status="brand">Internal Dev Testbed</Badge>
          <Badge status="neutral">350px Viewport Compliant</Badge>
        </div>
        <h1 className="font-serif text-display-md sm:text-display-lg text-forest-deep">
          GLOROV Design System Showcase
        </h1>
        <p className="font-sans text-body-md text-text-secondary max-w-2xl">
          Comprehensive inventory of migrated Flutter tokens and foundational React UI components.
          Designed for strict visual parity and responsive resilience.
        </p>
      </div>

      {/* ─── 1. Brand Color Tokens ───────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-serif text-title-lg sm:text-display-sm text-text-primary">
          1. Botanical Color Tokens
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-forest-deep text-white p-3 rounded-md border border-white/10">
            <span className="text-label-sm font-semibold block">forest-deep</span>
            <span className="text-body-sm opacity-80">#1B4332</span>
          </div>
          <div className="bg-forest-medium text-white p-3 rounded-md border border-white/10">
            <span className="text-label-sm font-semibold block">forest-medium</span>
            <span className="text-body-sm opacity-80">#2D6A4F</span>
          </div>
          <div className="bg-sage text-white p-3 rounded-md border border-white/10">
            <span className="text-label-sm font-semibold block">sage</span>
            <span className="text-body-sm opacity-80">#52B788</span>
          </div>
          <div className="bg-mint-badge text-forest-deep border border-mint p-3 rounded-md">
            <span className="text-label-sm font-semibold block">mint-badge</span>
            <span className="text-body-sm opacity-80">#D8F3DC</span>
          </div>
          <div className="bg-mint-surface text-forest-deep border border-mint p-3 rounded-md">
            <span className="text-label-sm font-semibold block">mint-surface</span>
            <span className="text-body-sm opacity-80">#E8F5E9</span>
          </div>
          <div className="bg-tag-dark-blue text-white p-3 rounded-md border border-white/10">
            <span className="text-label-sm font-semibold block">tag-dark-blue</span>
            <span className="text-body-sm opacity-80">#0C2340</span>
          </div>
          <div className="bg-earth-gold text-white p-3 rounded-md border border-white/10">
            <span className="text-label-sm font-semibold block">earth-gold</span>
            <span className="text-body-sm opacity-80">#DDA15E</span>
          </div>
          <div className="bg-terracotta text-white p-3 rounded-md border border-white/10">
            <span className="text-label-sm font-semibold block">terracotta</span>
            <span className="text-body-sm opacity-80">#BC6C25</span>
          </div>
          <div className="bg-surface-cream text-text-primary border border-border-subtle p-3 rounded-md">
            <span className="text-label-sm font-semibold block">surface-cream</span>
            <span className="text-body-sm text-text-muted">#F9FAF8</span>
          </div>
          <div className="bg-surface-pure text-text-primary border border-border-subtle p-3 rounded-md">
            <span className="text-label-sm font-semibold block">surface-pure</span>
            <span className="text-body-sm text-text-muted">#FFFFFF</span>
          </div>
          <div className="bg-brand-success text-white p-3 rounded-md border border-white/10">
            <span className="text-label-sm font-semibold block">brand-success</span>
            <span className="text-body-sm opacity-80">#10B981</span>
          </div>
          <div className="bg-brand-error text-white p-3 rounded-md border border-white/10">
            <span className="text-label-sm font-semibold block">brand-error</span>
            <span className="text-body-sm opacity-80">#EF4444</span>
          </div>
        </div>
      </section>

      {/* ─── 2. Typography Scale ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-serif text-title-lg sm:text-display-sm text-text-primary">
          2. Typography Scale
        </h2>
        <Card padding="md" className="space-y-4">
          <div className="space-y-1">
            <span className="text-label-sm text-text-muted">display-lg (Fraunces 36px/700)</span>
            <p className="font-serif text-display-lg text-forest-deep leading-tight">
              Rare Botanical Seeds & Live Flora
            </p>
          </div>
          <Divider />
          <div className="space-y-1">
            <span className="text-label-sm text-text-muted">display-md (Fraunces 28px/700)</span>
            <p className="font-serif text-display-md text-text-primary">
              Fresh Heirloom Harvest Collections
            </p>
          </div>
          <Divider />
          <div className="space-y-1">
            <span className="text-label-sm text-text-muted">display-sm (Fraunces 24px/700)</span>
            <p className="font-serif text-display-sm text-text-primary">
              Seasonal Flowering Varieties
            </p>
          </div>
          <Divider />
          <div className="space-y-1">
            <span className="text-label-sm text-text-muted">title-lg / head-md (Plus Jakarta 16px-20px/600)</span>
            <p className="font-sans text-head-md font-semibold text-text-primary">
              Monstera Deliciosa — Swiss Cheese Plant
            </p>
          </div>
          <Divider />
          <div className="space-y-1">
            <span className="text-label-sm text-text-muted">body-md / body-sm (Plus Jakarta 14px-12px/400)</span>
            <p className="font-sans text-body-md text-text-secondary leading-relaxed">
              Germinates reliably within 7 to 14 days under partial sunlight. Packet includes 50+ hand-curated seeds with comprehensive sowing instructions.
            </p>
          </div>
        </Card>
      </section>

      {/* ─── 3. Buttons & Icon Buttons ───────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-serif text-title-lg sm:text-display-sm text-text-primary">
          3. Buttons & Touch Targets
        </h2>
        <Card padding="md" className="space-y-6">
          {/* Variants */}
          <div>
            <h4 className="text-label-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
              Action Variants (min 44px height for mobile safety)
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary (Forest Deep)</Button>
              <Button variant="secondary">Secondary (Sage)</Button>
              <Button variant="outline">Outlined Neutral</Button>
              <Button variant="subtle">Subtle Mint</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="danger">Destructive Danger</Button>
            </div>
          </div>

          {/* Sizes & States */}
          <div className="pt-4 border-t border-border-light">
            <h4 className="text-label-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
              Sizes, Loading & Disabled States
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small (36px)</Button>
              <Button size="md">Medium (44px)</Button>
              <Button size="lg">Large (50px)</Button>
              <Button size="md" isLoading>
                Updating Cart
              </Button>
              <Button size="md" disabled>
                Sold Out
              </Button>
            </div>
          </div>

          {/* Icon Buttons */}
          <div className="pt-4 border-t border-border-light">
            <h4 className="text-label-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
              Icon Buttons (Accessible aria-label + 44px touch targets)
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <IconButton
                aria-label="Add to wishlist"
                variant="outline"
                size="md"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                }
              />
              <IconButton
                aria-label="Decrease quantity"
                variant="subtle"
                size="md"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                }
              />
              <IconButton
                aria-label="Increase quantity"
                variant="subtle"
                size="md"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                }
              />
              <IconButton
                aria-label="Delete line item"
                variant="ghost"
                size="md"
                className="text-brand-error hover:bg-brand-error-surface"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                }
              />
              <Tooltip content="Verified Botanical Germination Guarantee">
                <IconButton
                  aria-label="Information tooltip"
                  variant="ghost"
                  size="md"
                  icon={
                    <svg className="w-5 h-5 text-forest-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
              </Tooltip>
            </div>
          </div>
        </Card>
      </section>

      {/* ─── 4. Form Controls ────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-serif text-title-lg sm:text-display-sm text-text-primary">
          4. Form Controls & Validation
        </h2>
        <Card padding="md" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Delivery PIN Code"
              required
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. 411001"
              helperText="Enter 6-digit PIN code to check Shiprocket serviceability"
              iconLeading={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />

            <Input
              label="Promo Code"
              placeholder="e.g. GLOROV10"
              error="Coupon code has expired"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border-light">
            <Select
              label="Select Growing Region"
              options={[
                { value: 'all', label: 'All India (All Seasons)' },
                { value: 'tropical', label: 'Tropical Coastal Region' },
                { value: 'subtropical', label: 'Sub-Tropical Northern Plains' },
                { value: 'temperate', label: 'Temperate Hill Station' },
              ]}
            />

            <Select
              label="Sort Products"
              options={[
                { value: 'featured', label: 'Featured Collections' },
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
                { value: 'newest', label: 'New Botanical Arrivals' },
              ]}
            />
          </div>

          <div className="pt-4 border-t border-border-light">
            <Textarea
              label="Delivery Instructions / Landmark"
              placeholder="e.g. Near Community Botanical Garden, Flat 402"
              helperText="Optional notes for courier partner delivery executive"
              rows={3}
            />
          </div>

          <div className="pt-4 border-t border-border-light space-y-4">
            <h4 className="text-label-sm font-semibold text-text-muted uppercase tracking-wider">
              Checkboxes & Radio Options
            </h4>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="space-y-2">
                <Checkbox
                  label="Free Seed Kit with Orders"
                  description="Complimentary seasonal trial seed packet included"
                  checked={checkboxChecked}
                  onChange={(e) => setCheckboxChecked(e.target.checked)}
                />
                <Checkbox
                  label="Email Germination Tips"
                  description="Weekly watering schedule and lighting alerts"
                  checked={false}
                  onChange={() => {}}
                />
              </div>

              <div className="space-y-2">
                <Radio
                  name="payment_showcase"
                  value="razorpay"
                  label="Razorpay (Prepaid)"
                  description="Zero delivery fees above ₹499"
                  checked={radioSelected === 'razorpay'}
                  onChange={() => setRadioSelected('razorpay')}
                />
                <Radio
                  name="payment_showcase"
                  value="cod"
                  label="Cash on Delivery (COD)"
                  description="Non-perishable seed packets only"
                  checked={radioSelected === 'cod'}
                  onChange={() => setRadioSelected('cod')}
                />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ─── 5. Badges & Status Indicators ───────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-serif text-title-lg sm:text-display-sm text-text-primary">
          5. Badges & Tags
        </h2>
        <Card padding="md" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge status="brand" withDot>
              Verified Botanical
            </Badge>
            <Badge status="discount">30% OFF</Badge>
            <Badge status="success" withDot>
              In Stock
            </Badge>
            <Badge status="warning" withDot>
              Low Stock (4 left)
            </Badge>
            <Badge status="error" withDot>
              Out of Stock
            </Badge>
            <Badge status="info">Organic Certified</Badge>
            <Badge status="neutral">Standard Shipping</Badge>
          </div>

          <Divider />

          <div className="flex flex-wrap items-center gap-2.5">
            <Badge size="sm" status="brand">Small Badge</Badge>
            <Badge size="md" status="brand">Medium Badge</Badge>
            <Badge size="lg" status="brand">Large Badge</Badge>
          </div>
        </Card>
      </section>

      {/* ─── 6. Contextual Alerts ────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-serif text-title-lg sm:text-display-sm text-text-primary">
          6. Contextual Alerts
        </h2>
        <div className="space-y-3">
          {!alertDismissed && (
            <Alert
              variant="info"
              title="Monsoon Sowing Window Active"
              onDismiss={() => setAlertDismissed(true)}
            >
              Recommended season for planting Kharif flowering seeds and exotic climbers.
            </Alert>
          )}

          <Alert
            variant="success"
            title="Pincode 411001 Serviceable"
          >
            Standard courier delivery within 3-4 business days via Shiprocket network.
          </Alert>

          <Alert
            variant="warning"
            title="Live Plant Delivery Restriction"
          >
            Perishable plants require prepaid checkout to ensure rapid transit. COD is disabled for live flora.
          </Alert>

          <Alert
            variant="error"
            title="Payment Authorization Failed"
            action={
              <Button size="sm" variant="danger">
                Retry Payment
              </Button>
            }
          >
            Bank declined the transaction. Please check card limits or select UPI.
          </Alert>
        </div>
      </section>

      {/* ─── 7. Skeletons & Spinners ─────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-serif text-title-lg sm:text-display-sm text-text-primary">
          7. Loading Skeletons & Spinners
        </h2>
        <Card padding="md" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-3">
              <Skeleton variant="card" height="160px" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="50%" />
            </div>
            <div className="space-y-3">
              <Skeleton variant="card" height="160px" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="50%" />
            </div>
            <div className="space-y-3">
              <Skeleton variant="card" height="160px" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="50%" />
            </div>
          </div>

          <div className="pt-4 border-t border-border-light flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span className="text-body-sm text-text-muted">Small (16px)</span>
            </div>
            <div className="flex items-center gap-2">
              <Spinner size="md" />
              <span className="text-body-sm text-text-muted">Medium (32px)</span>
            </div>
            <div className="flex items-center gap-2">
              <Spinner size="lg" />
              <span className="text-body-sm text-text-muted">Large (48px)</span>
            </div>
          </div>
        </Card>
      </section>

      {/* ─── 8. Modals & Drawers ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-serif text-title-lg sm:text-display-sm text-text-primary">
          8. Modals & Slide-out Drawers
        </h2>
        <Card padding="md" className="space-y-4">
          <p className="text-body-md text-text-secondary">
            Test keyboard Escape key, body scroll locking, and mobile responsive boundaries:
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
            >
              Open Pincode Modal
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setDrawerPlacement('left')
                setIsDrawerOpen(true)
              }}
            >
              Open Nav Drawer (Left)
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setDrawerPlacement('right')
                setIsDrawerOpen(true)
              }}
            >
              Open Cart Drawer (Right)
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setDrawerPlacement('bottom')
                setIsDrawerOpen(true)
              }}
            >
              Open Action Sheet (Bottom)
            </Button>
          </div>
        </Card>
      </section>

      {/* ─── Interactive Modal Instance ──────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Botanical Serviceability Check"
        footer={
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={() => setIsModalOpen(false)}>
              Verify Address
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-body-md text-text-secondary">
            Enter your 6-digit Indian Postal PIN code to inspect live courier rates and transit time:
          </p>
          <Input
            label="PIN Code"
            defaultValue="411001"
            placeholder="e.g. 411001"
            iconLeading={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            }
          />
          <Alert variant="success">
            Pincode 411001 is serviced by Shiprocket surface air couriers.
          </Alert>
        </div>
      </Modal>

      {/* ─── Interactive Drawer Instance ─────────────────────────────────── */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        placement={drawerPlacement}
        title={
          drawerPlacement === 'left'
            ? 'Nursery Navigation'
            : drawerPlacement === 'right'
            ? 'Your Garden Bag'
            : 'Quick Options'
        }
        footer={
          <Button fullWidth variant="primary" onClick={() => setIsDrawerOpen(false)}>
            Close Drawer
          </Button>
        }
      >
        <div className="space-y-4">
          <p className="text-body-sm text-text-muted">
            Drawer sliding smoothly from <strong>{drawerPlacement}</strong> with body scroll locking.
          </p>
          <div className="space-y-2">
            <div className="p-3 bg-surface-cream rounded-md border border-border-subtle">
              <span className="font-semibold block text-forest-deep text-title-sm">Heirloom Vegetable Seeds</span>
              <span className="text-body-sm text-text-muted">24 curated varieties available</span>
            </div>
            <div className="p-3 bg-surface-cream rounded-md border border-border-subtle">
              <span className="font-semibold block text-forest-deep text-title-sm">Indoor Air-Purifying Plants</span>
              <span className="text-body-sm text-text-muted">Ready to pot with live transit care</span>
            </div>
            <div className="p-3 bg-surface-cream rounded-md border border-border-subtle">
              <span className="font-semibold block text-forest-deep text-title-sm">Artisanal Ceramic Planters</span>
              <span className="text-body-sm text-text-muted">Glazed finish with bottom drainage holes</span>
            </div>
          </div>
        </div>
      </Drawer>
    </PageContainer>
  )
}

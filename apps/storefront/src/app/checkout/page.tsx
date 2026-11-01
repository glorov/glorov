'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShieldCheck,
  Truck,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sprout,
  Edit3,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import {
  getCartShippingOptionsAction,
  selectShippingMethodAction,
  updateDeliveryAddressAction,
  completeOrderAction,
} from '@/lib/cart-actions'
import type { StoreShippingOption } from '@/lib/cart'
import { formatINR } from '@/lib/utils'
import { getCurrentCustomerAction } from '@/lib/customer-actions'
import type { StoreCustomer, StoreCustomerAddress } from '@/lib/customer'
import styles from './CheckoutPage.module.css'

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Chandigarh',
  'Puducherry',
]

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, isLoading: isCartLoading, refreshCart, clearCart } = useCart()

  // Form states
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('Maharashtra')
  const [postalCode, setPostalCode] = useState('')
  const [phone, setPhone] = useState('')
  const [customer, setCustomer] = useState<StoreCustomer | null>(null)

  // Validation & UI state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isEditingAddress, setIsEditingAddress] = useState<boolean>(false)
  const isPlacingOrderRef = useRef<boolean>(false)

  // Shipping & flow states
  const [shippingOptions, setShippingOptions] = useState<StoreShippingOption[]>([])
  const [selectedOptionId, setSelectedOptionId] = useState<string>('')
  const [paymentProvider, setPaymentProvider] = useState<
    'pp_razorpay_razorpay' | 'pp_cod_cod' | 'pp_system_default'
  >('pp_razorpay_razorpay')
  const [isOptionsLoading, setIsOptionsLoading] = useState<boolean>(false)
  const [isSavingAddress, setIsSavingAddress] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [addressSaved, setAddressSaved] = useState<boolean>(false)

  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[fieldName]
        return next
      })
    }
  }

  const applySavedAddress = (addr: StoreCustomerAddress) => {
    setFirstName(addr.first_name || '')
    setLastName(addr.last_name || '')
    setAddress1(addr.address_1 || '')
    setAddress2(addr.address_2 || '')
    setCity(addr.city || '')
    setProvince(addr.province || 'Maharashtra')
    setPostalCode(addr.postal_code || '')
    if (addr.phone) setPhone(addr.phone)
    setFieldErrors({})
    setIsEditingAddress(false)
    if (
      cart?.shipping_address?.address_1 === addr.address_1 &&
      cart?.shipping_address?.postal_code === addr.postal_code
    ) {
      setAddressSaved(true)
    } else {
      setAddressSaved(false)
    }
  }

  // Load customer profile and saved addresses if authenticated
  useEffect(() => {
    async function loadCustomerProfile() {
      const res = await getCurrentCustomerAction()
      if (res.success && res.customer) {
        setCustomer(res.customer)
        if (!email && res.customer.email) {
          setEmail(res.customer.email)
        }
        const defaultAddr =
          res.customer.addresses.find((a) => a.is_default_shipping) || res.customer.addresses[0]
        if (defaultAddr && !firstName && !address1) {
          applySavedAddress(defaultAddr)
        }
      }
    }
    loadCustomerProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Populate from existing cart data if available
  useEffect(() => {
    if (cart) {
      if (cart.email && !email) setEmail(cart.email)
      const addr = cart.shipping_address
      if (addr) {
        if (addr.first_name && !firstName) setFirstName(addr.first_name)
        if (addr.last_name && !lastName) setLastName(addr.last_name)
        if (addr.address_1 && !address1) setAddress1(addr.address_1)
        if (addr.address_2 && !address2) setAddress2(addr.address_2)
        if (addr.city && !city) setCity(addr.city)
        if (addr.province && !province) setProvince(addr.province)
        if (addr.postal_code && !postalCode) setPostalCode(addr.postal_code)
        if (addr.phone && !phone) setPhone(addr.phone)
        if (addr.address_1) setAddressSaved(true)
      }
      if (cart.shipping_methods && cart.shipping_methods.length > 0) {
        setSelectedOptionId(cart.shipping_methods[0].shipping_option_id || '')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart])

  // Fetch shipping options
  useEffect(() => {
    async function loadShipping() {
      setIsOptionsLoading(true)
      const res = await getCartShippingOptionsAction()
      if (res.success && res.options) {
        setShippingOptions(res.options)
        if (res.options.length > 0 && !selectedOptionId) {
          setSelectedOptionId(res.options[0].id)
        }
      }
      setIsOptionsLoading(false)
    }
    loadShipping()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const items = cart?.items || []
  const subtotal = cart?.item_subtotal || cart?.subtotal || 0
  const discountTotal = cart?.discount_total || 0
  const shippingTotal = cart?.shipping_total || 0
  const taxTotal = cart?.tax_total || 0
  const grandTotal = cart?.total || Math.max(0, subtotal - discountTotal + shippingTotal + taxTotal)

  // Validate and save customer details & delivery address
  const validateAndSaveAddress = async (): Promise<boolean> => {
    setFormError(null)

    const errors: Record<string, string> = {}

    // Field-level format guards
    if (!email || !email.includes('@')) {
      errors.email = 'Please enter a valid email address.'
    }
    if (!firstName.trim()) {
      errors.firstName = 'First name is required.'
    }
    if (!lastName.trim()) {
      errors.lastName = 'Last name is required.'
    }
    if (!address1.trim() || address1.trim().length < 5) {
      errors.address1 = 'Please enter full house/flat no. and street address (at least 5 characters).'
    }
    const cleanPostal = postalCode.replace(/\D/g, '')
    if (!/^[1-9][0-9]{5}$/.test(cleanPostal)) {
      errors.postalCode = 'Please enter a valid 6-digit Indian PIN code (e.g. 411001, 560001).'
    }
    if (!city.trim()) {
      errors.city = 'City / District is required.'
    }
    const digits = phone.replace(/\D/g, '')
    const cleanPhone = digits.length > 10 && digits.startsWith('91') ? digits.slice(-10) : digits.slice(-10)
    if (!/^[6-9][0-9]{9}$/.test(cleanPhone)) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setFormError('Please resolve the required fields highlighted below.')
      return false
    }
    setFieldErrors({})

    setIsSavingAddress(true)
    try {
      const res = await updateDeliveryAddressAction({
        email,
        shippingAddress: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          address_1: address1.trim(),
          address_2: address2.trim() || undefined,
          city: city.trim(),
          province: province.trim(),
          postal_code: cleanPostal,
          phone: cleanPhone,
          country_code: 'in',
        },
      })

      if (res.success) {
        setAddressSaved(true)
        setIsEditingAddress(false)
        const optionsRes = await getCartShippingOptionsAction()
        if (optionsRes.success && optionsRes.options.length > 0) {
          setShippingOptions(optionsRes.options)
          const targetOpt = selectedOptionId || optionsRes.options[0].id
          setSelectedOptionId(targetOpt)
          await selectShippingMethodAction(targetOpt)
        }
        await refreshCart()
        return true
      } else {
        setFormError(res.error || 'Failed to save address details')
        return false
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error saving address')
      return false
    } finally {
      setIsSavingAddress(false)
    }
  }

  // Handle explicit Save & Continue submit
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    await validateAndSaveAddress()
  }

  // Handle shipping selection change
  const handleShippingChange = async (optionId: string) => {
    setSelectedOptionId(optionId)
    setFormError(null)
    const res = await selectShippingMethodAction(optionId)
    if (res.success) {
      await refreshCart()
    } else {
      setFormError(res.error || 'Failed to apply shipping option')
    }
  }

  // Handle final order completion with double-submission prevention
  const handlePlaceOrder = async () => {
    if (isPlacingOrderRef.current || isSubmitting) return

    setFormError(null)

    if (!addressSaved || isEditingAddress || !cart?.shipping_address?.address_1) {
      const savedOk = await validateAndSaveAddress()
      if (!savedOk) {
        return
      }
    }

    if (!cart?.shipping_methods || cart.shipping_methods.length === 0) {
      if (selectedOptionId) {
        await selectShippingMethodAction(selectedOptionId)
      } else {
        setFormError('Please select a shipping method before placing order.')
        return
      }
    }

    if (paymentProvider === 'pp_cod_cod' && grandTotal > 500000) {
      setFormError('Cash on Delivery is limited to orders up to ₹5,000. Please select Razorpay online payment.')
      return
    }

    isPlacingOrderRef.current = true
    setIsSubmitting(true)

    try {
      const res = await completeOrderAction(paymentProvider)
      if (res.success && res.orderId) {
        await clearCart()
        router.push(`/order/confirmed/${res.orderId}`)
      } else {
        setFormError(res.error || 'Order completion failed. Please verify your items.')
        setIsSubmitting(false)
        isPlacingOrderRef.current = false
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error placing order')
      setIsSubmitting(false)
      isPlacingOrderRef.current = false
    }
  }

  if (isCartLoading && items.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.emptyBox}>
          <Loader2 size={36} className={styles.spinner} style={{ color: 'var(--ugaoo-green)', margin: '0 auto' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '1rem 0 0' }}>
            Preparing secure checkout...
          </h2>
        </div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.emptyBox}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#f0f9f4', color: '#0a4c36', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Sprout size={28} aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Your cart is empty</h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(4, 32, 24, 0.65)', margin: '0.5rem 0 1.5rem' }}>
            Add heirloom seed packets or live plants to your cart before proceeding to checkout.
          </p>
          <Link href="/store" className={styles.primaryBtn} style={{ maxWidth: '240px', margin: '0 auto' }}>
            Browse Seed Varieties
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Header Title & Security Status */}
        <div className={styles.checkoutHeader}>
          <div className={styles.titleArea}>
            <h1 className={styles.pageTitle}>Express Botanical Checkout</h1>
            <p className={styles.pageSubtitle}>
              Pan-India nursery direct dispatch. Living plants and tested heirloom seeds.
            </p>
          </div>
          <div className={styles.securityBadge}>
            <ShieldCheck size={16} aria-hidden="true" />
            <span>256-Bit SSL Encrypted Nursery Checkout</span>
          </div>
        </div>

        {/* Global Error Banner */}
        {formError && (
          <div
            role="alert"
            aria-live="polite"
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: '#fff5f5',
              border: '1px solid #feb2b2',
              borderRadius: '12px',
              color: '#c53030',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              fontSize: '0.875rem',
            }}
          >
            <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
            <div>
              <span style={{ fontWeight: 700 }}>Checkout Notice: </span>
              <span>{formError}</span>
              {formError.includes('Cash on Delivery is limited') && (
                <div style={{ marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentProvider('pp_razorpay_razorpay')
                      setFormError(null)
                    }}
                    className={styles.outlineBtn}
                  >
                    Switch to Razorpay Online Payment &amp; Proceed
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main 2-Column Grid */}
        <div className={styles.layout}>
          {/* Left Column: Checkout Forms */}
          <div className={styles.formCol}>
            {/* STEP 1: Delivery Address */}
            <section className={styles.card} aria-label="Customer & Delivery Address">
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <span className={styles.stepNumber}>1</span>
                  Customer &amp; Indian Delivery Address
                </h2>
                {addressSaved && (
                  <span className={`${styles.pillBadge} ${styles.pillBadgeGreen}`}>
                    <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} aria-hidden="true" />
                    Address Recorded
                  </span>
                )}
              </div>

              {/* Saved Address Summary Card */}
              {addressSaved && !isEditingAddress ? (
                <div className={styles.savedAddressCard}>
                  <div className={styles.savedAddressInfo}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: 'var(--ugaoo-text-dark)' }}>
                        {firstName} {lastName}
                      </span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'rgba(4, 32, 24, 0.6)' }}>
                        (+91 {phone})
                      </span>
                      <span className={`${styles.pillBadge} ${styles.pillBadgeGreen}`}>
                        Courier Verified
                      </span>
                    </div>
                    <p style={{ margin: 0, color: 'var(--ugaoo-text-dark)' }}>
                      {address1}
                      {address2 ? `, ${address2}` : ''}
                    </p>
                    <p style={{ margin: 0, color: 'rgba(4, 32, 24, 0.7)' }}>
                      {city}, {province} — <strong>{postalCode}</strong>
                    </p>
                    <p style={{ margin: 0, fontSize: '0.775rem', color: 'rgba(4, 32, 24, 0.6)' }}>
                      Tracking notifications sent to: <strong>{email}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(true)}
                    className={styles.outlineBtn}
                    aria-label="Edit saved delivery address"
                  >
                    <Edit3 size={14} aria-hidden="true" />
                    <span>Edit</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Account Status / Logged In Notice */}
                  {customer ? (
                    <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: '#f0f9f4', border: '1px solid rgba(10, 76, 54, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                      <div>
                        <span style={{ color: 'rgba(4, 32, 24, 0.65)' }}>Logged in as: </span>
                        <strong>{customer.first_name} {customer.last_name}</strong> ({customer.email})
                      </div>
                      <Link href="/account" style={{ color: 'var(--ugaoo-green)', fontWeight: 700 }}>
                        My Account
                      </Link>
                    </div>
                  ) : (
                    <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: '#faf9f7', border: '1px solid rgba(4, 32, 24, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                      <span style={{ color: 'rgba(4, 32, 24, 0.65)' }}>
                        Already have an account? Sign in to use saved addresses.
                      </span>
                      <Link href="/account/login?callbackUrl=/checkout" style={{ color: 'var(--ugaoo-maroon)', fontWeight: 700 }}>
                        Sign In
                      </Link>
                    </div>
                  )}

                  {/* Saved Addresses Selector */}
                  {customer && customer.addresses.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <h3 id="saved-address-heading" style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                        Select from Saved Delivery Addresses
                      </h3>
                      <div role="group" aria-labelledby="saved-address-heading" className={styles.savedAddressesGrid}>
                        {customer.addresses.map((saved) => {
                          const isSelected =
                            address1 === saved.address_1 && postalCode === saved.postal_code

                          return (
                            <button
                              key={saved.id}
                              type="button"
                              onClick={() => applySavedAddress(saved)}
                              className={`${styles.savedAddressBtn} ${isSelected ? styles.savedAddressBtnActive : ''}`}
                            >
                              <span style={{ fontWeight: 700 }}>
                                {saved.first_name} {saved.last_name}
                              </span>
                              <span>{saved.address_1}</span>
                              <span style={{ color: 'rgba(4, 32, 24, 0.6)' }}>
                                {saved.city}, {saved.province} — {saved.postal_code}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Address Form */}
                  <form onSubmit={handleSaveAddress} noValidate>
                    <div className={styles.formGrid}>
                      {/* Email */}
                      <div className={`${styles.fieldGroup} ${styles.colSpan2}`}>
                        <label htmlFor="checkout-email" className={styles.label}>
                          Email Address for Live Tracking Updates
                          <span className={styles.requiredAsterisk} aria-hidden="true">*</span>
                        </label>
                        <input
                          id="checkout-email"
                          type="email"
                          autoComplete="email"
                          required
                          aria-required="true"
                          aria-invalid={!!fieldErrors.email}
                          aria-describedby={fieldErrors.email ? 'checkout-email-error' : undefined}
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            clearFieldError('email')
                          }}
                          placeholder="e.g. rahul.sharma@example.com"
                          className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                        />
                        {fieldErrors.email && (
                          <p id="checkout-email-error" role="alert" aria-live="polite" className={styles.errorText}>
                            {fieldErrors.email}
                          </p>
                        )}
                      </div>

                      {/* First Name */}
                      <div className={styles.fieldGroup}>
                        <label htmlFor="checkout-first-name" className={styles.label}>
                          First Name
                          <span className={styles.requiredAsterisk} aria-hidden="true">*</span>
                        </label>
                        <input
                          id="checkout-first-name"
                          type="text"
                          autoComplete="given-name"
                          required
                          aria-required="true"
                          aria-invalid={!!fieldErrors.firstName}
                          aria-describedby={fieldErrors.firstName ? 'checkout-first-name-error' : undefined}
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value)
                            clearFieldError('firstName')
                          }}
                          placeholder="First Name"
                          className={`${styles.input} ${fieldErrors.firstName ? styles.inputError : ''}`}
                        />
                        {fieldErrors.firstName && (
                          <p id="checkout-first-name-error" role="alert" aria-live="polite" className={styles.errorText}>
                            {fieldErrors.firstName}
                          </p>
                        )}
                      </div>

                      {/* Last Name */}
                      <div className={styles.fieldGroup}>
                        <label htmlFor="checkout-last-name" className={styles.label}>
                          Last Name
                          <span className={styles.requiredAsterisk} aria-hidden="true">*</span>
                        </label>
                        <input
                          id="checkout-last-name"
                          type="text"
                          autoComplete="family-name"
                          required
                          aria-required="true"
                          aria-invalid={!!fieldErrors.lastName}
                          aria-describedby={fieldErrors.lastName ? 'checkout-last-name-error' : undefined}
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value)
                            clearFieldError('lastName')
                          }}
                          placeholder="Last Name"
                          className={`${styles.input} ${fieldErrors.lastName ? styles.inputError : ''}`}
                        />
                        {fieldErrors.lastName && (
                          <p id="checkout-last-name-error" role="alert" aria-live="polite" className={styles.errorText}>
                            {fieldErrors.lastName}
                          </p>
                        )}
                      </div>

                      {/* Address Line 1 */}
                      <div className={`${styles.fieldGroup} ${styles.colSpan2}`}>
                        <label htmlFor="checkout-address-1" className={styles.label}>
                          Flat / House No. &amp; Building / Street
                          <span className={styles.requiredAsterisk} aria-hidden="true">*</span>
                        </label>
                        <input
                          id="checkout-address-1"
                          type="text"
                          autoComplete="address-line1"
                          required
                          aria-required="true"
                          aria-invalid={!!fieldErrors.address1}
                          aria-describedby={fieldErrors.address1 ? 'checkout-address-1-error' : undefined}
                          value={address1}
                          onChange={(e) => {
                            setAddress1(e.target.value)
                            clearFieldError('address1')
                          }}
                          placeholder="e.g. Flat 302, Palm Grove Apts, 5th Cross Road"
                          className={`${styles.input} ${fieldErrors.address1 ? styles.inputError : ''}`}
                        />
                        {fieldErrors.address1 && (
                          <p id="checkout-address-1-error" role="alert" aria-live="polite" className={styles.errorText}>
                            {fieldErrors.address1}
                          </p>
                        )}
                      </div>

                      {/* Address Line 2 */}
                      <div className={`${styles.fieldGroup} ${styles.colSpan2}`}>
                        <label htmlFor="checkout-address-2" className={styles.label}>
                          Landmark / Area (Optional)
                        </label>
                        <input
                          id="checkout-address-2"
                          type="text"
                          autoComplete="address-line2"
                          value={address2}
                          onChange={(e) => setAddress2(e.target.value)}
                          placeholder="e.g. Near Botanical Garden / Metro Pillar 42"
                          className={styles.input}
                        />
                      </div>

                      {/* City */}
                      <div className={styles.fieldGroup}>
                        <label htmlFor="checkout-city" className={styles.label}>
                          City / District
                          <span className={styles.requiredAsterisk} aria-hidden="true">*</span>
                        </label>
                        <input
                          id="checkout-city"
                          type="text"
                          autoComplete="address-level2"
                          required
                          aria-required="true"
                          aria-invalid={!!fieldErrors.city}
                          aria-describedby={fieldErrors.city ? 'checkout-city-error' : undefined}
                          value={city}
                          onChange={(e) => {
                            setCity(e.target.value)
                            clearFieldError('city')
                          }}
                          placeholder="City"
                          className={`${styles.input} ${fieldErrors.city ? styles.inputError : ''}`}
                        />
                        {fieldErrors.city && (
                          <p id="checkout-city-error" role="alert" aria-live="polite" className={styles.errorText}>
                            {fieldErrors.city}
                          </p>
                        )}
                      </div>

                      {/* State / Province */}
                      <div className={styles.fieldGroup}>
                        <label htmlFor="checkout-province" className={styles.label}>
                          State / Union Territory
                          <span className={styles.requiredAsterisk} aria-hidden="true">*</span>
                        </label>
                        <select
                          id="checkout-province"
                          value={province}
                          required
                          aria-required="true"
                          onChange={(e) => setProvince(e.target.value)}
                          className={styles.input}
                        >
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* PIN Code */}
                      <div className={styles.fieldGroup}>
                        <label htmlFor="checkout-postal-code" className={styles.label}>
                          Indian Postal PIN Code
                          <span className={styles.requiredAsterisk} aria-hidden="true">*</span>
                        </label>
                        <input
                          id="checkout-postal-code"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          autoComplete="postal-code"
                          required
                          aria-required="true"
                          aria-invalid={!!fieldErrors.postalCode}
                          aria-describedby={fieldErrors.postalCode ? 'checkout-postal-code-error' : undefined}
                          value={postalCode}
                          onChange={(e) => {
                            setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                            clearFieldError('postalCode')
                          }}
                          placeholder="6-digit PIN (e.g. 411001)"
                          className={`${styles.input} ${fieldErrors.postalCode ? styles.inputError : ''}`}
                        />
                        {fieldErrors.postalCode && (
                          <p id="checkout-postal-code-error" role="alert" aria-live="polite" className={styles.errorText}>
                            {fieldErrors.postalCode}
                          </p>
                        )}
                      </div>

                      {/* Mobile Phone */}
                      <div className={styles.fieldGroup}>
                        <label htmlFor="checkout-phone" className={styles.label}>
                          10-Digit Mobile Number
                          <span className={styles.requiredAsterisk} aria-hidden="true">*</span>
                        </label>
                        <input
                          id="checkout-phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          required
                          aria-required="true"
                          aria-invalid={!!fieldErrors.phone}
                          aria-describedby={fieldErrors.phone ? 'checkout-phone-error' : undefined}
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value)
                            clearFieldError('phone')
                          }}
                          placeholder="e.g. 9876543210"
                          className={`${styles.input} ${fieldErrors.phone ? styles.inputError : ''}`}
                        />
                        {fieldErrors.phone && (
                          <p id="checkout-phone-error" role="alert" aria-live="polite" className={styles.errorText}>
                            {fieldErrors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="submit"
                        disabled={isSavingAddress}
                        className={styles.primaryBtn}
                        style={{ maxWidth: '280px' }}
                      >
                        {isSavingAddress ? (
                          <>
                            <Loader2 size={16} className={styles.spinner} aria-hidden="true" />
                            <span>Verifying Delivery PIN...</span>
                          </>
                        ) : (
                          <>
                            <span>Save &amp; Select Delivery</span>
                            <ArrowRight size={16} aria-hidden="true" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </section>

            {/* STEP 2: Shipping Method Selection */}
            <section className={styles.card} aria-label="Nursery Shipping Method">
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <span className={styles.stepNumber}>2</span>
                  Nursery Courier &amp; Transit Method
                </h2>
              </div>

              {isOptionsLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(4, 32, 24, 0.6)' }}>
                  <Loader2 size={24} className={styles.spinner} style={{ margin: '0 auto 8px', color: 'var(--ugaoo-green)' }} aria-hidden="true" />
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>
                    Calculating transit options from Pune Hub...
                  </p>
                </div>
              ) : shippingOptions.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'rgba(4, 32, 24, 0.65)', margin: 0 }}>
                  Please enter your delivery PIN code in Step 1 to calculate regional express routes.
                </p>
              ) : (
                <div role="radiogroup" aria-label="Indian Shipping Method" className={styles.radioList}>
                  {shippingOptions.map((opt) => {
                    const isSelected = selectedOptionId === opt.id
                    const optPrice = opt.amount || 0
                    const optId = `shipping-option-${opt.id}`

                    return (
                      <div
                        key={opt.id}
                        className={`${styles.radioCard} ${isSelected ? styles.radioCardSelected : ''}`}
                      >
                        <label htmlFor={optId} className={styles.radioLabel}>
                          <div className={styles.radioContent}>
                            <input
                              id={optId}
                              type="radio"
                              name="shipping_method"
                              value={opt.id}
                              checked={isSelected}
                              onChange={() => handleShippingChange(opt.id)}
                              className={styles.radioInput}
                            />
                            <div className={styles.radioDetails}>
                              <div className={styles.radioTitleRow}>
                                <span className={styles.radioTitle}>{opt.name}</span>
                                {opt.name.includes('Express') && (
                                  <span className={`${styles.pillBadge} ${styles.pillBadgeGreen}`}>
                                    Air Express
                                  </span>
                                )}
                              </div>
                              {opt.type?.description && (
                                <p className={styles.radioDesc}>{opt.type.description}</p>
                              )}
                              <p className={styles.radioDesc} style={{ color: 'var(--ugaoo-green)', fontWeight: 600 }}>
                                Dispatched directly from Pune Central Nursery Hub (PIN: 411001)
                              </p>
                            </div>
                          </div>

                          <span className={styles.radioPrice}>{formatINR(optPrice)}</span>
                        </label>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* STEP 3: Payment Method Selection */}
            <section className={styles.card} aria-label="Payment Method Selection">
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <span className={styles.stepNumber}>3</span>
                  Indian Payment Method
                </h2>
              </div>

              <div role="radiogroup" aria-label="Indian Payment Method" className={styles.radioList}>
                {/* Option 1: Razorpay Online Payment */}
                <div
                  className={`${styles.radioCard} ${paymentProvider === 'pp_razorpay_razorpay' ? styles.radioCardSelected : ''}`}
                >
                  <label htmlFor="payment-provider-razorpay" className={styles.radioLabel}>
                    <div className={styles.radioContent}>
                      <input
                        id="payment-provider-razorpay"
                        type="radio"
                        name="payment_provider"
                        value="pp_razorpay_razorpay"
                        checked={paymentProvider === 'pp_razorpay_razorpay'}
                        onChange={() => setPaymentProvider('pp_razorpay_razorpay')}
                        className={styles.radioInput}
                      />
                      <div className={styles.radioDetails}>
                        <div className={styles.radioTitleRow}>
                          <span className={styles.radioTitle}>Razorpay Secure Online Payment</span>
                          <span className={`${styles.pillBadge} ${styles.pillBadgeGreen}`}>Recommended</span>
                        </div>
                        <p className={styles.radioDesc}>
                          UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards, &amp; Net Banking
                        </p>
                        <p className={styles.radioDesc} style={{ color: 'var(--ugaoo-green)', fontWeight: 600 }}>
                          ⚡ Instant payment confirmation &amp; priority nursery dispatch
                        </p>
                      </div>
                    </div>
                    <CreditCard size={20} style={{ color: 'var(--ugaoo-green)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                  </label>
                </div>

                {/* Option 2: Cash on Delivery (COD) */}
                <div
                  className={`${styles.radioCard} ${paymentProvider === 'pp_cod_cod' ? styles.radioCardSelected : ''}`}
                >
                  <label htmlFor="payment-provider-cod" className={styles.radioLabel}>
                    <div className={styles.radioContent}>
                      <input
                        id="payment-provider-cod"
                        type="radio"
                        name="payment_provider"
                        value="pp_cod_cod"
                        checked={paymentProvider === 'pp_cod_cod'}
                        onChange={() => setPaymentProvider('pp_cod_cod')}
                        className={styles.radioInput}
                      />
                      <div className={styles.radioDetails}>
                        <div className={styles.radioTitleRow}>
                          <span className={styles.radioTitle}>Cash on Delivery (COD)</span>
                          <span className={`${styles.pillBadge} ${styles.pillBadgeButter}`}>Doorstep Cash</span>
                        </div>
                        <p className={styles.radioDesc}>
                          Pay cash to courier executive upon delivery. Please keep exact change ready.
                        </p>
                      </div>
                    </div>
                    <Truck size={20} style={{ color: '#854d0e', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                  </label>

                  {/* COD Threshold Alert placed outside label to avoid nesting violation */}
                  {grandTotal > 500000 && (
                    <div className={styles.codAlert}>
                      <p className={styles.codAlertText}>
                        ⚠️ COD is restricted to orders up to ₹5,000. For higher values, please select Razorpay.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentProvider('pp_razorpay_razorpay')
                          setFormError(null)
                        }}
                        className={styles.outlineBtn}
                        style={{ alignSelf: 'flex-start' }}
                      >
                        Switch to Razorpay Online Payment
                      </button>
                    </div>
                  )}
                </div>

                {/* Option 3: Sandbox Developer Testing */}
                <div
                  className={`${styles.radioCard} ${paymentProvider === 'pp_system_default' ? styles.radioCardSelected : ''}`}
                >
                  <label htmlFor="payment-provider-default" className={styles.radioLabel}>
                    <div className={styles.radioContent}>
                      <input
                        id="payment-provider-default"
                        type="radio"
                        name="payment_provider"
                        value="pp_system_default"
                        checked={paymentProvider === 'pp_system_default'}
                        onChange={() => setPaymentProvider('pp_system_default')}
                        className={styles.radioInput}
                      />
                      <div className={styles.radioDetails}>
                        <div className={styles.radioTitleRow}>
                          <span className={styles.radioTitle}>Sandbox Test Authorization</span>
                          <span className={`${styles.pillBadge} ${styles.pillBadgeButter}`}>Developer Mode</span>
                        </div>
                        <p className={styles.radioDesc}>
                          Simulates order placement and inventory reservation without charging payment gateways.
                        </p>
                      </div>
                    </div>
                    <ShieldCheck size={20} style={{ color: 'var(--ugaoo-green)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                  </label>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Order Summary */}
          <div className={styles.summaryCol}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Order Review</h2>

              {/* Items List */}
              <div
                tabIndex={0}
                aria-label="Purchased items summary"
                className={styles.itemsList}
              >
                {items.map((item) => (
                  <div key={item.id} className={styles.itemRow}>
                    <div className={styles.itemThumb}>
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          width={52}
                          height={52}
                          unoptimized
                        />
                      ) : (
                        <Sprout size={20} style={{ color: 'var(--ugaoo-green)' }} aria-hidden="true" />
                      )}
                    </div>
                    <div className={styles.itemMeta}>
                      <p className={styles.itemTitle}>{item.title}</p>
                      <p className={styles.itemVariant}>
                        Qty: {item.quantity} {item.variant_title ? `• ${item.variant_title}` : ''}
                      </p>
                    </div>
                    <span className={styles.itemPrice}>
                      {formatINR(item.subtotal || (item.unit_price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculation Rows */}
              <div className={styles.calcRows}>
                <div className={styles.calcRow}>
                  <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                  <span className={styles.calcValue}>{formatINR(subtotal)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className={styles.calcRow} style={{ color: '#0a4c36' }}>
                    <span>Promotion Discount</span>
                    <span className={styles.calcValue}>-{formatINR(discountTotal)}</span>
                  </div>
                )}
                <div className={styles.calcRow}>
                  <span>Nursery Shipping</span>
                  <span className={styles.calcValue}>
                    {shippingTotal === 0 ? (
                      <span style={{ color: '#0a4c36', fontWeight: 700 }}>FREE</span>
                    ) : (
                      formatINR(shippingTotal)
                    )}
                  </span>
                </div>
                <div className={styles.calcRow}>
                  <span>Agricultural GST (HSN 1209)</span>
                  <span className={styles.calcValue}>
                    {taxTotal === 0 ? '₹0 (0% Exempt)' : formatINR(taxTotal)}
                  </span>
                </div>
              </div>

              {/* Total Row */}
              <div className={styles.totalRow}>
                <span>Total Amount</span>
                <span className={styles.totalPrice}>{formatINR(grandTotal)}</span>
              </div>

              {/* Order Submit CTA */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className={styles.primaryBtn}
                aria-label="Authorize and place botanical order"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className={styles.spinner} aria-hidden="true" />
                    <span>Placing Your Order...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order • {formatINR(grandTotal)}</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </>
                )}
              </button>

              {/* Trust Reassurance Box */}
              <div className={styles.trustBadgesBox}>
                <div className={styles.trustPillar}>
                  <ShieldCheck size={16} style={{ flexShrink: 0 }} aria-hidden="true" />
                  <span>48-Hour Live Plant &amp; Seed Replacement Guarantee</span>
                </div>
                <div className={styles.trustPillar}>
                  <Truck size={16} style={{ flexShrink: 0 }} aria-hidden="true" />
                  <span>Climate-Proof Ventilated Packaging from Pune Hub</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

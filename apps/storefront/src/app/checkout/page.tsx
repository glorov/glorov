'use client'

import React, { useState, useEffect } from 'react'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatINR } from '@/lib/utils'
import { getCurrentCustomerAction } from '@/lib/customer-actions'
import type { StoreCustomer, StoreCustomerAddress } from '@/lib/customer'


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
  const isPlacingOrderRef = React.useRef<boolean>(false)

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
        // Refresh available shipping options now that address is recorded
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

    // Ensure address is validated and saved if not yet saved or currently being edited
    if (!addressSaved || isEditingAddress || !cart?.shipping_address?.address_1) {
      const savedOk = await validateAndSaveAddress()
      if (!savedOk) {
        return
      }
    }

    // Ensure shipping method is applied
    if (!cart?.shipping_methods || cart.shipping_methods.length === 0) {
      if (selectedOptionId) {
        await selectShippingMethodAction(selectedOptionId)
      } else {
        setFormError('Please select a shipping method before placing order.')
        return
      }
    }

    // Validate COD eligibility
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
      <div className="container mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-botanical-600" />
        <h2 className="text-xl font-bold text-botanical-950">Preparing secure checkout...</h2>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-full bg-botanical-50 flex items-center justify-center text-botanical-700 mb-4">
          <Sprout className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-botanical-950">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Add seed packets or live plants to your cart before proceeding to checkout.
        </p>
        <Button asChild variant="botanical" className="mt-6 rounded-full">
          <Link href="/#catalog">Browse Seed Varieties</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Title */}
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl sm:text-3xl font-black text-botanical-950 tracking-tight">
          Express Botanical Checkout
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Indian domestic fulfillment. Native Medusa checkout workflow.
        </p>
      </div>

      {/* Global Form Error Banner */}
      {formError && (
        <div className="my-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Checkout Notice: </span>
            <span>{formError}</span>
            {formError.includes('Cash on Delivery is limited') && (
              <div className="mt-2.5">
                <Button
                  type="button"
                  variant="botanical"
                  size="sm"
                  onClick={() => {
                    setPaymentProvider('pp_razorpay_razorpay')
                    setFormError(null)
                  }}
                  className="rounded-lg text-xs"
                >
                  Switch to Razorpay Online Payment &amp; Proceed
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8">
        {/* Left: Checkout Steps (8 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* STEP 1: Customer Details & Indian Delivery Address */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-botanical-800 text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h2 className="text-lg font-bold text-botanical-950">
                  Customer &amp; Indian Delivery Address
                </h2>
              </div>
              {addressSaved && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Address Saved
                </span>
              )}
            </div>

            {/* Collapsed view when address is saved and not actively being edited */}
            {addressSaved && !isEditingAddress ? (
              <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-botanical-950">
                      {firstName} {lastName}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      (+91 {phone})
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                      Verified for Courier Delivery
                    </span>
                  </div>
                  <p className="text-xs text-botanical-900">
                    {address1}
                    {address2 ? `, ${address2}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {city}, {province} — <span className="font-mono font-bold text-botanical-950">{postalCode}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Order confirmation &amp; live tracking: <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingAddress(true)}
                  className="rounded-lg text-xs font-semibold shrink-0 gap-1.5 border-emerald-300 text-emerald-900 hover:bg-emerald-100/60"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Address</span>
                </Button>
              </div>
            ) : (
              <>
                {customer ? (
                  <div className="mb-5 p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Logged in as: </span>
                      <span className="font-bold text-foreground">
                        {customer.first_name} {customer.last_name}
                      </span>
                      <span className="text-muted-foreground ml-1">({customer.email})</span>
                    </div>
                    <Link
                      href="/account"
                      className="text-xs font-semibold text-botanical-700 hover:underline"
                    >
                      My Account
                    </Link>
                  </div>
                ) : (
                  <div className="mb-5 p-3 rounded-lg bg-muted/40 border border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Already have an account? Log in to use your saved addresses.
                    </span>
                    <Link
                      href="/account/login?callbackUrl=/checkout"
                      className="font-bold text-botanical-700 hover:underline shrink-0 ml-2"
                    >
                      Sign In
                    </Link>
                  </div>
                )}

                {customer && customer.addresses.length > 0 && (
                  <div className="mb-5 space-y-2">
                    <label className="block text-xs font-bold text-botanical-900">
                      Select from Saved Delivery Addresses
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {customer.addresses.map((saved) => {
                        const isSelected =
                          address1 === saved.address_1 && postalCode === saved.postal_code

                        return (
                          <button
                            key={saved.id}
                            type="button"
                            onClick={() => applySavedAddress(saved)}
                            className={`p-3 rounded-lg border text-left text-xs transition-all ${
                              isSelected
                                ? 'border-botanical-600 bg-botanical-50/50 ring-1 ring-botanical-600'
                                : 'border-border bg-background hover:bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold text-foreground mb-1">
                              <span>{saved.address_name || `${saved.first_name}'s Address`}</span>
                              {saved.is_default_shipping && (
                                <span className="text-[10px] text-botanical-700 bg-botanical-100 px-1.5 py-0.5 rounded font-medium">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground truncate">{saved.address_1}</p>
                            <p className="text-muted-foreground">
                              {saved.city}, {saved.postal_code}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSaveAddress} className="space-y-6">
                  {/* Group 1: Contact Details */}
                  <div className="space-y-4">
                    <div className="pb-1 border-b border-border/60">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Contact Details
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="checkout-email" className="block text-xs font-bold text-botanical-900 mb-1">
                          Email Address (for order tracking &amp; GST invoice) *
                        </label>
                        <input
                          id="checkout-email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          aria-invalid={!!fieldErrors.email}
                          aria-describedby={fieldErrors.email ? 'checkout-email-error' : undefined}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            clearFieldError('email')
                          }}
                          placeholder="e.g. priya.sharma@example.com"
                          className={`w-full h-10 px-3.5 rounded-lg border ${
                            fieldErrors.email
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-border focus:ring-botanical-600'
                          } bg-background text-sm focus:outline-none focus:ring-2 transition`}
                        />
                        {fieldErrors.email && (
                          <p id="checkout-email-error" className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="checkout-phone" className="block text-xs font-bold text-botanical-900 mb-1">
                          10-Digit Mobile Phone (for delivery coordination) *
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-border bg-earth-100 text-xs font-bold text-botanical-900">
                            +91
                          </span>
                          <input
                            id="checkout-phone"
                            type="tel"
                            autoComplete="tel-national"
                            inputMode="numeric"
                            required
                            maxLength={15}
                            value={phone}
                            aria-invalid={!!fieldErrors.phone}
                            aria-describedby={fieldErrors.phone ? 'checkout-phone-error' : undefined}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, '')
                              const sanitized = raw.length > 10 && raw.startsWith('91') ? raw.slice(-10) : raw.slice(0, 10)
                              setPhone(sanitized)
                              clearFieldError('phone')
                            }}
                            placeholder="9876543210"
                            className={`flex-1 h-10 px-3.5 rounded-r-lg border ${
                              fieldErrors.phone
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-border focus:ring-botanical-600'
                            } bg-background text-sm font-mono focus:outline-none focus:ring-2 transition`}
                          />
                        </div>
                        {fieldErrors.phone && (
                          <p id="checkout-phone-error" className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Group 2: Delivery Address */}
                  <div className="space-y-4">
                    <div className="pb-1 border-b border-border/60">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Delivery Address
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="checkout-first-name" className="block text-xs font-bold text-botanical-900 mb-1">
                          First Name *
                        </label>
                        <input
                          id="checkout-first-name"
                          type="text"
                          autoComplete="given-name"
                          required
                          value={firstName}
                          aria-invalid={!!fieldErrors.firstName}
                          aria-describedby={fieldErrors.firstName ? 'checkout-first-name-error' : undefined}
                          onChange={(e) => {
                            setFirstName(e.target.value)
                            clearFieldError('firstName')
                          }}
                          placeholder="First name"
                          className={`w-full h-10 px-3.5 rounded-lg border ${
                            fieldErrors.firstName
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-border focus:ring-botanical-600'
                          } bg-background text-sm focus:outline-none focus:ring-2 transition`}
                        />
                        {fieldErrors.firstName && (
                          <p id="checkout-first-name-error" className="text-xs text-red-600 mt-1">{fieldErrors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="checkout-last-name" className="block text-xs font-bold text-botanical-900 mb-1">
                          Last Name *
                        </label>
                        <input
                          id="checkout-last-name"
                          type="text"
                          autoComplete="family-name"
                          required
                          value={lastName}
                          aria-invalid={!!fieldErrors.lastName}
                          aria-describedby={fieldErrors.lastName ? 'checkout-last-name-error' : undefined}
                          onChange={(e) => {
                            setLastName(e.target.value)
                            clearFieldError('lastName')
                          }}
                          placeholder="Last name"
                          className={`w-full h-10 px-3.5 rounded-lg border ${
                            fieldErrors.lastName
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-border focus:ring-botanical-600'
                          } bg-background text-sm focus:outline-none focus:ring-2 transition`}
                        />
                        {fieldErrors.lastName && (
                          <p id="checkout-last-name-error" className="text-xs text-red-600 mt-1">{fieldErrors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="checkout-address-1" className="block text-xs font-bold text-botanical-900 mb-1">
                        Flat / House No., Apartment &amp; Building Name *
                      </label>
                      <input
                        id="checkout-address-1"
                        type="text"
                        autoComplete="address-line1"
                        required
                        value={address1}
                        aria-invalid={!!fieldErrors.address1}
                        aria-describedby={fieldErrors.address1 ? 'checkout-address-1-error' : undefined}
                        onChange={(e) => {
                          setAddress1(e.target.value)
                          clearFieldError('address1')
                        }}
                        placeholder="e.g. Flat 302, Palm Groves"
                        className={`w-full h-10 px-3.5 rounded-lg border ${
                          fieldErrors.address1
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-border focus:ring-botanical-600'
                        } bg-background text-sm focus:outline-none focus:ring-2 transition`}
                      />
                      {fieldErrors.address1 && (
                        <p id="checkout-address-1-error" className="text-xs text-red-600 mt-1">{fieldErrors.address1}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="checkout-address-2" className="block text-xs font-bold text-botanical-900 mb-1">
                        Street, Area, Landmark (Optional)
                      </label>
                      <input
                        id="checkout-address-2"
                        type="text"
                        autoComplete="address-line2"
                        value={address2}
                        onChange={(e) => setAddress2(e.target.value)}
                        placeholder="e.g. Near Rose Garden, MG Road"
                        className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-botanical-600 transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="checkout-postal-code" className="block text-xs font-bold text-botanical-900 mb-1">
                          PIN Code (6 Digits) *
                        </label>
                        <input
                          id="checkout-postal-code"
                          type="text"
                          autoComplete="postal-code"
                          inputMode="numeric"
                          required
                          maxLength={8}
                          value={postalCode}
                          aria-invalid={!!fieldErrors.postalCode}
                          aria-describedby={fieldErrors.postalCode ? 'checkout-postal-code-error' : undefined}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/\D/g, '').slice(0, 6)
                            setPostalCode(clean)
                            clearFieldError('postalCode')
                          }}
                          placeholder="e.g. 411001"
                          className={`w-full h-10 px-3.5 rounded-lg border ${
                            fieldErrors.postalCode
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-border focus:ring-botanical-600'
                          } bg-background text-sm font-mono focus:outline-none focus:ring-2 transition`}
                        />
                        {fieldErrors.postalCode && (
                          <p id="checkout-postal-code-error" className="text-xs text-red-600 mt-1">{fieldErrors.postalCode}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="checkout-city" className="block text-xs font-bold text-botanical-900 mb-1">
                          City / District *
                        </label>
                        <input
                          id="checkout-city"
                          type="text"
                          autoComplete="address-level2"
                          required
                          value={city}
                          aria-invalid={!!fieldErrors.city}
                          aria-describedby={fieldErrors.city ? 'checkout-city-error' : undefined}
                          onChange={(e) => {
                            setCity(e.target.value)
                            clearFieldError('city')
                          }}
                          placeholder="e.g. Pune"
                          className={`w-full h-10 px-3.5 rounded-lg border ${
                            fieldErrors.city
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-border focus:ring-botanical-600'
                          } bg-background text-sm focus:outline-none focus:ring-2 transition`}
                        />
                        {fieldErrors.city && (
                          <p id="checkout-city-error" className="text-xs text-red-600 mt-1">{fieldErrors.city}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="checkout-province" className="block text-xs font-bold text-botanical-900 mb-1">
                          State / UT *
                        </label>
                        <select
                          id="checkout-province"
                          autoComplete="address-level1"
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-botanical-600 transition"
                        >
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    {isEditingAddress && addressSaved && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditingAddress(false)
                          setFieldErrors({})
                        }}
                        className="rounded-lg text-xs"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={isSavingAddress}
                      variant="botanical"
                      size="sm"
                      className="rounded-lg gap-2"
                    >
                      {isSavingAddress ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Validating Address...</span>
                        </>
                      ) : (
                        <>
                          <span>Save &amp; Continue</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </section>

          {/* STEP 2: Shipping Method Selection */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border mb-6">
              <div className="h-7 w-7 rounded-full bg-botanical-800 text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="text-lg font-bold text-botanical-950">
                Indian Shipping Method
              </h2>
            </div>

            {isOptionsLoading ? (
              <div className="py-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-botanical-600" />
                <span>Loading available shipping options for your PIN code...</span>
              </div>
            ) : shippingOptions.length === 0 ? (
              <div className="p-4 rounded-lg bg-earth-50 border border-border text-sm text-muted-foreground">
                Please save your delivery address above to load available Indian shipping routes.
              </div>
            ) : (
              <div className="space-y-3">
                {shippingOptions.map((opt) => {
                  const isSelected = selectedOptionId === opt.id
                  const optPrice = opt.amount || 0

                  return (
                    <label
                      key={opt.id}
                      onClick={() => handleShippingChange(opt.id)}
                      className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-botanical-600 bg-botanical-50/50 shadow-xs'
                          : 'border-border hover:border-earth-300 bg-background'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="shipping_method"
                          value={opt.id}
                          checked={isSelected}
                          onChange={() => handleShippingChange(opt.id)}
                          className="mt-1 h-4 w-4 text-botanical-700 focus:ring-botanical-600 border-border"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-botanical-950">
                              {opt.name}
                            </span>
                            {opt.name.includes('Express') && (
                              <Badge variant="botanical" className="text-[10px] py-0 px-1.5">
                                Air Express
                              </Badge>
                            )}
                          </div>
                          {opt.type?.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {opt.type.description}
                            </p>
                          )}
                          <p className="text-[11px] text-botanical-700 mt-1">
                            Dispatched from: Pune Central Nursery Hub (PIN: 411001)
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-sm text-botanical-950">
                          {formatINR(optPrice)}
                        </span>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
          </section>

          {/* STEP 3: Payment Method Selection */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border mb-6">
              <div className="h-7 w-7 rounded-full bg-botanical-800 text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h2 className="text-lg font-bold text-botanical-950">
                Indian Payment Method
              </h2>
            </div>

            <div className="space-y-3">
              {/* Option 1: Razorpay Indian Online Payments (Recommended) */}
              <label
                onClick={() => setPaymentProvider('pp_razorpay_razorpay')}
                className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentProvider === 'pp_razorpay_razorpay'
                    ? 'border-botanical-600 bg-botanical-50/50 shadow-xs'
                    : 'border-border hover:border-earth-300 bg-background'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment_provider"
                    value="pp_razorpay_razorpay"
                    checked={paymentProvider === 'pp_razorpay_razorpay'}
                    onChange={() => setPaymentProvider('pp_razorpay_razorpay')}
                    className="mt-1 h-4 w-4 text-botanical-700 focus:ring-botanical-600 border-border"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-botanical-950">
                        Razorpay Secure Online Payment
                      </span>
                      <Badge variant="botanical" className="text-[10px] py-0 px-1.5">
                        Recommended
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards, &amp; Net Banking
                    </p>
                    <p className="text-[11px] text-emerald-800 font-medium mt-1">
                      ⚡ Instant payment confirmation &amp; priority nursery dispatch
                    </p>
                  </div>
                </div>
                <CreditCard className="h-5 w-5 text-botanical-700 flex-shrink-0 mt-0.5" />
              </label>

              {/* Option 2: Cash on Delivery (COD) */}
              <label
                onClick={() => setPaymentProvider('pp_cod_cod')}
                className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentProvider === 'pp_cod_cod'
                    ? 'border-botanical-600 bg-botanical-50/50 shadow-xs'
                    : 'border-border hover:border-earth-300 bg-background'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment_provider"
                    value="pp_cod_cod"
                    checked={paymentProvider === 'pp_cod_cod'}
                    onChange={() => setPaymentProvider('pp_cod_cod')}
                    className="mt-1 h-4 w-4 text-botanical-700 focus:ring-botanical-600 border-border"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-botanical-950">
                        Cash on Delivery (COD)
                      </span>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-earth-800 border-earth-300">
                        Doorstep Cash
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pay cash to courier executive upon delivery. Please keep exact change ready.
                    </p>
                    {grandTotal > 500000 && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                        <p className="text-[11px] text-amber-800 font-medium">
                          ⚠️ COD is restricted to orders up to ₹5,000. For higher values, please select Razorpay.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPaymentProvider('pp_razorpay_razorpay')
                            setFormError(null)
                          }}
                          className="mt-1.5 h-7 text-xs font-semibold text-botanical-800 border-botanical-300 hover:bg-botanical-50"
                        >
                          Switch to Razorpay Online Payment
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <Truck className="h-5 w-5 text-earth-700 flex-shrink-0 mt-0.5" />
              </label>

              {/* Option 3: Pre-production Sandbox Authorization (Testing) */}
              <label
                onClick={() => setPaymentProvider('pp_system_default')}
                className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentProvider === 'pp_system_default'
                    ? 'border-botanical-600 bg-botanical-50/50 shadow-xs'
                    : 'border-border hover:border-earth-300 bg-background'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment_provider"
                    value="pp_system_default"
                    checked={paymentProvider === 'pp_system_default'}
                    onChange={() => setPaymentProvider('pp_system_default')}
                    className="mt-1 h-4 w-4 text-botanical-700 focus:ring-botanical-600 border-border"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-botanical-950">
                        Sandbox Test Authorization
                      </span>
                      <Badge className="bg-earth-200 text-earth-900 text-[10px] py-0 px-1.5 border-0">
                        Developer Mode
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Simulates order placement and inventory reservation without connecting to third-party payment gateways.
                    </p>
                  </div>
                </div>
                <ShieldCheck className="h-5 w-5 text-botanical-600 flex-shrink-0 mt-0.5" />
              </label>
            </div>
          </section>
        </div>

        {/* Right: Order Summary Breakdown (5 cols) */}
        <div className="lg:col-span-5">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm sticky top-24 space-y-6">
            <h2 className="text-lg font-bold text-botanical-950 border-b border-border pb-3">
              Order Review
            </h2>

            {/* Items Mini List */}
            <ul className="divide-y divide-border max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <li key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded border border-border overflow-hidden bg-earth-50 flex-shrink-0 relative">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title || 'Product'}
                          width={40}
                          height={40}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-botanical-400">
                          <Sprout className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-botanical-950 line-clamp-1">{item.title}</p>
                      <p className="text-muted-foreground text-[11px]">
                        Qty: {item.quantity} {item.variant_title ? `• ${item.variant_title}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-botanical-900 whitespace-nowrap">
                    {formatINR(item.subtotal || 0)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Route & Payment Overview */}
            <div className="space-y-2 text-xs border-t border-border pt-4">
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-botanical-700" />
                  <span>Shipping Route:</span>
                </span>
                <span className="font-semibold text-botanical-950 truncate max-w-[170px]">
                  {shippingOptions.find((o) => o.id === selectedOptionId)?.name || 'Standard Fulfillment'}
                </span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-botanical-700" />
                  <span>Payment Mode:</span>
                </span>
                <span className="font-semibold text-botanical-950">
                  {paymentProvider === 'pp_razorpay_razorpay'
                    ? 'Razorpay (Online)'
                    : paymentProvider === 'pp_cod_cod'
                    ? 'Cash on Delivery'
                    : 'Sandbox Mode'}
                </span>
              </div>
              {addressSaved && city && postalCode && (
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Delivering to:</span>
                  </span>
                  <span className="font-semibold text-botanical-950">
                    {city}, {postalCode}
                  </span>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 text-sm border-t border-border pt-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Items Subtotal</span>
                <span className="font-semibold text-botanical-950">{formatINR(subtotal)}</span>
              </div>

              {discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Botanical Discount</span>
                  <span className="font-semibold">-{formatINR(discountTotal)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Shipping Fee</span>
                <span className="font-semibold text-botanical-950">
                  {shippingTotal > 0 ? formatINR(shippingTotal) : 'Included / Pending'}
                </span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Agricultural GST (HSN 1209)</span>
                {taxTotal > 0 ? (
                  <span className="font-semibold text-botanical-950">{formatINR(taxTotal)}</span>
                ) : (
                  <span className="font-semibold text-emerald-700">₹0 (0% Exempt)</span>
                )}
              </div>

              <div className="border-t border-border pt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-base font-bold text-botanical-950">Total Payable</span>
                  <p className="text-[10px] text-muted-foreground">Currency: INR (₹)</p>
                </div>
                <span className="text-2xl font-black text-botanical-950">
                  {formatINR(grandTotal)}
                </span>
              </div>
            </div>

            {/* Place Order Action */}
            <Button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || isSavingAddress || (paymentProvider === 'pp_cod_cod' && grandTotal > 500000)}
              variant="botanical"
              size="lg"
              className="w-full rounded-xl py-6 font-bold text-base shadow-lg gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : paymentProvider === 'pp_razorpay_razorpay' ? (
                <>
                  <span>Pay {formatINR(grandTotal)} with Razorpay</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              ) : paymentProvider === 'pp_cod_cod' ? (
                <>
                  <span>Place COD Order ({formatINR(grandTotal)})</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              ) : (
                <>
                  <span>Authorize Order ({formatINR(grandTotal)})</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>

            {/* Trust and Compliance Badges */}
            <div className="pt-2 border-t border-earth-100 space-y-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-botanical-700 flex-shrink-0" />
                <span>Strict backend inventory reservation prevents overselling</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-botanical-700 flex-shrink-0" />
                <span>Transit damage guarantee on live botanical shipments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

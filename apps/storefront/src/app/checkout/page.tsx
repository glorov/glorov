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
  Info,
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

  // Shipping & flow states
  const [shippingOptions, setShippingOptions] = useState<StoreShippingOption[]>([])
  const [selectedOptionId, setSelectedOptionId] = useState<string>('')
  const [isOptionsLoading, setIsOptionsLoading] = useState<boolean>(false)
  const [isSavingAddress, setIsSavingAddress] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [addressSaved, setAddressSaved] = useState<boolean>(false)

  const applySavedAddress = (addr: StoreCustomerAddress) => {
    setFirstName(addr.first_name || '')
    setLastName(addr.last_name || '')
    setAddress1(addr.address_1 || '')
    setAddress2(addr.address_2 || '')
    setCity(addr.city || '')
    setProvince(addr.province || 'Maharashtra')
    setPostalCode(addr.postal_code || '')
    if (addr.phone) setPhone(addr.phone)
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

  // Handle saving customer details & address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Basic frontend format guards (also validated with Zod on server)
    if (!email || !email.includes('@')) {
      setFormError('Please enter a valid email address.')
      return
    }
    if (!firstName.trim() || !lastName.trim()) {
      setFormError('First and last name are required.')
      return
    }
    if (!address1.trim() || address1.trim().length < 5) {
      setFormError('Please enter a full delivery street address (at least 5 characters).')
      return
    }
    if (!/^[1-9][0-9]{5}$/.test(postalCode.trim())) {
      setFormError('Please enter a valid 6-digit Indian PIN code (e.g. 411001, 560001).')
      return
    }
    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    if (!/^[6-9][0-9]{9}$/.test(cleanPhone)) {
      setFormError('Please enter a valid 10-digit Indian mobile number.')
      return
    }

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
          postal_code: postalCode.trim(),
          phone: cleanPhone,
          country_code: 'in',
        },
      })

      if (res.success) {
        setAddressSaved(true)
        // Refresh available shipping options now that address is recorded
        const optionsRes = await getCartShippingOptionsAction()
        if (optionsRes.success && optionsRes.options.length > 0) {
          setShippingOptions(optionsRes.options)
          const targetOpt = selectedOptionId || optionsRes.options[0].id
          setSelectedOptionId(targetOpt)
          await selectShippingMethodAction(targetOpt)
        }
        await refreshCart()
      } else {
        setFormError(res.error || 'Failed to save address details')
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error saving address')
    } finally {
      setIsSavingAddress(false)
    }
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

  // Handle final order completion
  const handlePlaceOrder = async () => {
    setFormError(null)
    setIsSubmitting(true)

    // Ensure address is saved
    if (!cart?.shipping_address?.address_1) {
      setFormError('Please fill and save your delivery address first.')
      setIsSubmitting(false)
      return
    }

    // Ensure shipping method is applied
    if (!cart?.shipping_methods || cart.shipping_methods.length === 0) {
      if (selectedOptionId) {
        await selectShippingMethodAction(selectedOptionId)
      } else {
        setFormError('Please select a shipping method before placing order.')
        setIsSubmitting(false)
        return
      }
    }

    try {
      const res = await completeOrderAction('pp_system_default')
      if (res.success && res.orderId) {
        await clearCart()
        router.push(`/order/confirmed/${res.orderId}`)
      } else {
        setFormError(res.error || 'Order completion failed. Please verify your items.')
        setIsSubmitting(false)
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error placing order')
      setIsSubmitting(false)
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
            <span className="font-semibold">Checkout Validation Notice: </span>
            <span>{formError}</span>
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
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Address Saved
                </span>
              )}
            </div>

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

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1">
                  Email Address (for order tracking &amp; GST invoice) *
                </label>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. priya.sharma@example.com"
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-botanical-600 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-botanical-900 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-botanical-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-botanical-900 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-botanical-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1">
                  Flat / House No., Apartment &amp; Building Name *
                </label>
                <input
                  type="text"
                  required
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  placeholder="e.g. Flat 302, Palm Groves"
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-botanical-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1">
                  Street, Area, Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  placeholder="e.g. Near Rose Garden, MG Road"
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-botanical-600 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-botanical-900 mb-1">
                    PIN Code (6 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 411001"
                    className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-botanical-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-botanical-900 mb-1">
                    City / District *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Pune"
                    className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-botanical-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-botanical-900 mb-1">
                    State / UT *
                  </label>
                  <select
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

              <div>
                <label className="block text-xs font-bold text-botanical-900 mb-1">
                  10-Digit Mobile Phone (for courier delivery coordination) *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-border bg-earth-100 text-xs font-bold text-botanical-900">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="flex-1 h-10 px-3.5 rounded-r-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-botanical-600 transition"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
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

          {/* STEP 3: Payment Method Boundary & Architecture Notice */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-border mb-6">
              <div className="h-7 w-7 rounded-full bg-botanical-800 text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h2 className="text-lg font-bold text-botanical-950">
                Payment Method &amp; Order Finalization
              </h2>
            </div>

            <div className="space-y-4">
              {/* Active System Verification Provider */}
              <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-emerald-950">
                        Pre-production Order Authorization
                      </span>
                      <Badge className="bg-emerald-700 text-white text-[10px] py-0 px-1.5">
                        Active Sandbox Flow
                      </Badge>
                    </div>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      Native Medusa workflow will authorize this order and reserve seed &amp; plant inventory at the Pune Central Nursery Hub without charging live customer funds.
                    </p>
                  </div>
                </div>
              </div>

              {/* Architectural Notice: Future Indian Payment Providers */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <Info className="h-4 w-4 text-amber-700" />
                  <span>Future Indian Payment Boundaries Prepared</span>
                </div>
                <p className="leading-relaxed">
                  <strong>Razorpay Integration Point:</strong> Webhook-verified UPI, Cards, and Netbanking will trigger <code className="font-mono bg-amber-100 px-1 rounded">capturePaymentWorkflow</code> upon customer return. Orders will remain pending until trusted webhook receipt.
                </p>
                <p className="leading-relaxed">
                  <strong>Cash on Delivery (COD):</strong> Restricted to non-perishable seed batches for orders between ₹299–₹2500, marked as <code className="font-mono bg-amber-100 px-1 rounded">payment_status: unpaid</code> until cash collection by courier.
                </p>
              </div>
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
              disabled={isSubmitting || isSavingAddress}
              variant="botanical"
              size="lg"
              className="w-full rounded-xl py-6 font-bold text-base shadow-lg gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing Order Workflow...</span>
                </>
              ) : (
                <>
                  <span>Place Order ({formatINR(grandTotal)})</span>
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

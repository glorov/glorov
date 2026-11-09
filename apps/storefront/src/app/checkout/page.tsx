'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GlorovImage } from '../../components/ui/GlorovImage'
import { useCart, useCheckout, useToast } from '../../context/StorefrontContext'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { PageContainer } from '../../components/layout/PageContainer'
import { CheckoutAddressForm } from '../../components/checkout/CheckoutAddressForm'
import { ShippingMethodSelector } from '../../components/checkout/ShippingMethodSelector'
import { PaymentMethodSelector } from '../../components/checkout/PaymentMethodSelector'
import { CheckoutOrderSummary } from '../../components/checkout/CheckoutOrderSummary'
import { GlorovCustomIcons } from '../../components/common/GlorovIcons'
import { formatINR } from '../../components/product/ProductPrice'
import { useRazorpay } from '../../lib/hooks/useRazorpay'
import {
  RazorpayPaymentErrorAlert,
  RazorpayProcessingOverlay,
} from '../../components/checkout/RazorpayPaymentModal'
import {
  createMedusaCart,
  setMedusaShippingMethod,
  initMedusaPaymentSession,
  completeMedusaCart,
  transformMedusaOrderToReceipt,
} from '../../lib/api/checkout'
import { reportError } from '../../lib/error-reporter'
import { isCodAmountEligible } from '../../lib/constants'
import type { CartItem } from '../../types/cart'
import type { DeliveryAddress, PaymentMethodType } from '../../types/checkout'

/**
 * GLOROV Checkout & Payment Page
 * Connected directly to Medusa v2 Cart completion flow:
 * 1. POST /store/carts — creates real cart with botanical items & customer delivery address
 * 2. POST /store/carts/:id/shipping-methods — selects authoritative shipping option
 * 3. POST /store/payment-collections + /payment-sessions — initializes Razorpay or COD provider
 * 4. For Razorpay: opens Razorpay modal, verifies cryptographic signature via /store/payment/razorpay/verify
 * 5. For COD: validates <= ₹5,000 threshold and authorizes cash settlement
 * 6. POST /store/carts/:id/complete — finalizes order in PostgreSQL and deducts real inventory
 * 7. Redirects to order confirmation with real Medusa order ID
 */
export default function CheckoutPage(): React.ReactElement {
  const router = useRouter()
  const { showToast } = useToast()
  const { token: customerAuthToken, customer, addresses, addAddress, setDefaultAddress } = useCustomerAuth()
  const {
    cartId,
    cartItems,
    cartSubtotal,
    cartTotal,
    discountAmount,
    shippingAmount,
    appliedCoupon,
    selectedShippingOption,
    setSelectedShippingOption,
    clearCart,
  } = useCart()

  const { shippingAddress, setShippingAddress, setLatestOrder } = useCheckout()

  const [address, setAddress] = useState<DeliveryAddress | null>(shippingAddress)
  const [isAddressValid, setIsAddressValid] = useState<boolean>(false)
  const [showAddressErrors, setShowAddressErrors] = useState<boolean>(false)
  const [saveAddressOptions, setSaveAddressOptions] = useState<{
    saveToAccount: boolean
    setAsDefault: boolean
  }>({ saveToAccount: false, setAsDefault: false })
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [checkoutErrors, setCheckoutErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])
  const [backendConnected, setBackendConnected] = useState<boolean>(true)
  const [deliverabilityError, setDeliverabilityError] = useState<string | null>(null)

  // Automatically pre-select default saved address if no address is set yet
  React.useEffect(() => {
    if (!address && addresses && addresses.length > 0) {
      const def = addresses.find((a) => a.isDefault) || addresses[0]
      if (def) {
        const mapped: DeliveryAddress = {
          fullName: def.fullName,
          phoneNumber: def.phoneNumber,
          email: customer?.email || '',
          addressLine1: def.addressLine1,
          addressLine2: def.addressLine2,
          city: def.city,
          state: def.state,
          pincode: def.pincode,
          countryCode: def.countryCode || 'in',
        }
        setAddress(mapped)
        setShippingAddress(mapped)
        setIsAddressValid(true)
      }
    }
  }, [addresses, customer, address, setShippingAddress])

  // Verify backend / admin dashboard connectivity on mount
  React.useEffect(() => {
    let isMounted = true
    async function checkAdminBackendConnection() {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' })
        if (!isMounted) return
        if (!res.ok) {
          setBackendConnected(false)
          setDeliverabilityError(
            'Delivery is not available to this address. Fulfillment network is not connected to the store.'
          )
          return
        }
        const data = await res.json()
        if (!data.upstream_backend?.connected) {
          setBackendConnected(false)
          setDeliverabilityError(
            'Delivery is not available to this address. Fulfillment network is disconnected.'
          )
        } else {
          setBackendConnected(true)
          setDeliverabilityError(null)
        }
      } catch {
        if (!isMounted) return
        setBackendConnected(false)
        setDeliverabilityError(
          'Delivery is not available to this address. Fulfillment network is disconnected.'
        )
      }
    }
    checkAdminBackendConnection()
    return () => {
      isMounted = false
    }
  }, [])

  const {
    openRazorpayCheckout,
    isLoading: isRazorpayLoading,
    error: razorpayError,
    paymentFailed: razorpayPaymentFailed,
    isCancelled: isRazorpayCancelled,
    resetState: resetRazorpayState,
  } = useRazorpay()

  // Automatically switch away from COD if cart total exceeds the ₹5,000 security threshold (strictly compared in paise)
  React.useEffect(() => {
    if (!isCodAmountEligible(cartTotal, 'rupees') && selectedPayment === 'cod') {
      setSelectedPayment('razorpay')
      showToast(
        'info',
        'Cash on Delivery is limited to orders up to ₹5,000. Switched to Razorpay Online Payment.',
        { title: 'Payment Method Adjusted' }
      )
    }
  }, [cartTotal, selectedPayment, showToast])

  const handleAddressChange = (addr: DeliveryAddress, valid: boolean): void => {
    setAddress(addr)
    setIsAddressValid(valid)
    if (valid) {
      setShippingAddress(addr)
      setShowAddressErrors(false)
    }
  }

  const handlePlaceOrder = async (): Promise<void> => {
    if (!backendConnected) {
      showToast(
        'error',
        'Delivery is not available to this address. Fulfillment network is not connected to the store.',
        { title: 'Delivery Unavailable' }
      )
      setCheckoutErrors([
        'Delivery is not available to this address: Fulfillment network is currently disconnected.',
      ])
      return
    }

    if (!address || !isAddressValid) {
      setShowAddressErrors(true)
      showToast('error', 'Please complete all required delivery address fields.', {
        title: 'Incomplete Address',
      })
      return
    }

    if (!selectedPayment) {
      showToast('error', 'Please choose a payment method before completing your order.', {
        title: 'Payment Method Required',
      })
      return
    }

    if (cartItems.length === 0) {
      showToast('error', 'Your cart is empty. Add botanical items before checkout.', {
        title: 'Empty Bag',
      })
      return
    }

    setIsSubmitting(true)
    setCheckoutErrors([])
    setValidationWarnings([])
    resetRazorpayState()

    try {
      // 1. Create or reuse real Medusa cart with line items, address, and coupon
      const medusaCart = await createMedusaCart({
        items: cartItems,
        address,
        couponCode: appliedCoupon,
        authToken: customerAuthToken,
        existingCartId: cartId,
      })

      // If patron opted to save address to their account, persist with default preference
      if (saveAddressOptions.saveToAccount && customerAuthToken && address) {
        addAddress({
          name: 'Home',
          fullName: address.fullName,
          phoneNumber: address.phoneNumber,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          countryCode: address.countryCode || 'in',
          isDefault: saveAddressOptions.setAsDefault,
        }).catch(() => {})
      }

      // 2. Shipping Step (Step 3a): POST /store/carts/:id/shipping-methods
      await setMedusaShippingMethod(
        medusaCart.id,
        selectedShippingOption.isExpress,
        customerAuthToken
      )

      // 3. Payment Step (Step 3b): Initialize payment session via Medusa payment API
      const isCod = selectedPayment === 'cod'
      const providerId = isCod ? 'pp_cod_cod' : 'pp_razorpay_razorpay'

      const paymentSessionResult = await initMedusaPaymentSession(
        medusaCart.id,
        providerId,
        customerAuthToken
      )

      // 4. Branch A: COD Flow (Step 3d & 3e)
      if (isCod) {
        if (!isCodAmountEligible(cartTotal, 'rupees')) {
          throw new Error('Cash on Delivery is restricted to orders up to ₹5,000. Please choose Razorpay for higher value orders.')
        }

        // Finalize order via POST /store/carts/:id/complete
        const completeData = await completeMedusaCart(medusaCart.id, customerAuthToken)
        const confirmedOrder = transformMedusaOrderToReceipt(completeData.order, {
          customerName: address.fullName,
          shippingAddress: address,
          shippingMethodName: selectedShippingOption.name,
          paymentMethodTitle: 'Cash on Delivery (COD)',
          items: cartItems,
          subtotal: cartSubtotal,
          discountAmount,
          shippingAmount,
          totalAmount: cartTotal,
        })

        setLatestOrder(confirmedOrder)
        clearCart()
        setIsSubmitting(false)

        showToast('success', `Order ${confirmedOrder.displayId} placed successfully via COD!`, {
          title: 'Order Confirmed',
          duration: 4000,
        })

        router.push(`/order/confirmation?id=${confirmedOrder.id}`)
        return
      }

      // 4. Branch B: Razorpay Flow (Step 3c & 3e)
      await openRazorpayCheckout({
        cartId: medusaCart.id,
        sessionData: paymentSessionResult.session,
        amount: cartTotal,
        customer: {
          name: address.fullName,
          email: address.email,
          contact: address.phoneNumber,
        },
        onSuccess: ({ order }) => {
          const confirmedOrder = transformMedusaOrderToReceipt(order, {
            customerName: address.fullName,
            shippingAddress: address,
            shippingMethodName: selectedShippingOption.name,
            paymentMethodTitle: 'Razorpay Online (UPI, Cards & NetBanking)',
            items: cartItems,
            subtotal: cartSubtotal,
            discountAmount,
            shippingAmount,
            totalAmount: cartTotal,
          })

          setLatestOrder(confirmedOrder)
          clearCart()
          setIsSubmitting(false)

          showToast('success', `Payment verified! Order ${confirmedOrder.displayId} confirmed.`, {
            title: 'Order Confirmed',
            duration: 4000,
          })

          router.push(`/order/confirmation?id=${confirmedOrder.id}`)
        },
        onFailure: (err) => {
          setIsSubmitting(false)
          setCheckoutErrors([err.message])
          showToast('error', err.message, { title: 'Payment Incomplete' })
          reportError(err, {
            page: '/checkout',
            action: 'razorpay-verification-failure',
            paymentMethod: 'razorpay',
          })
        },
        onDismiss: () => {
          setIsSubmitting(false)
          showToast('info', 'Payment was cancelled. You can retry anytime.', {
            title: 'Payment Dismissed',
          })
        },
        onPaymentFailed: (err) => {
          setIsSubmitting(false)
          setCheckoutErrors([err.description || 'Payment was declined by payment gateway.'])
          showToast('error', err.description || 'Payment Failed', { title: 'Payment Failed' })
          reportError(new Error(err.description || 'Payment declined by gateway'), {
            page: '/checkout',
            action: 'razorpay-payment-failed',
            extra: {
              code: err.code,
              reason: err.reason,
              order_id: err.metadata?.order_id,
            },
          })
        },
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while placing your order.'
      setCheckoutErrors([msg])
      showToast('error', msg, { title: 'Order Placement Error' })
      setIsSubmitting(false)
      reportError(err, {
        page: '/checkout',
        action: 'place-order-failure',
        paymentMethod: selectedPayment,
      })
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#F9FAF8] pb-20">
      {/* Breadcrumbs matching Flutter `_buildBreadcrumbs` */}
      <div className="w-full bg-white border-b border-[#E5ECE8] py-2.5 px-4 sm:px-6">
        <div className="max-w-[1280px] mx-auto flex items-center gap-2 text-[12.5px]">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 font-semibold text-[#0A4C36] hover:opacity-80 transition-opacity"
          >
            <GlorovCustomIcons.chevronLeft size={14} className="text-[#0A4C36]" />
            <span>Back</span>
          </button>

          <span className="text-[#D1D5DB]">|</span>

          <Link href="/" className="text-[#6B7280] hover:text-[#111827] transition-colors">
            Home
          </Link>

          <GlorovCustomIcons.chevronRight size={12} className="text-[#9CA3AF]" />

          <Link href="/cart" className="text-[#6B7280] hover:text-[#111827] transition-colors">
            Shopping Bag
          </Link>

          <GlorovCustomIcons.chevronRight size={12} className="text-[#9CA3AF]" />

          <span className="font-bold text-[#0A4C36]">Checkout</span>
        </div>
      </div>

      <PageContainer className="pt-5 sm:pt-7">
        {cartItems.length === 0 ? (
          <div className="p-10 sm:p-14 text-center rounded-[20px] bg-white border border-[#E5ECE8] max-w-md mx-auto my-8">
            <div className="w-14 h-14 rounded-full bg-[#EBF5F0] text-[#0A4C36] flex items-center justify-center mx-auto mb-4">
              <GlorovCustomIcons.spa size={28} />
            </div>
            <h2 className="font-serif text-[18px] font-bold text-[#111827] mb-1.5">
              No Items in Checkout
            </h2>
            <p className="text-[12.5px] text-[#6B7280] mb-6">
              Your bag is currently empty. Please select botanical seeds, indoor plants, or planters to continue.
            </p>
            <Link
              href="/categories/seeds"
              className="px-7 py-3 rounded-full bg-[#0A4C36] hover:bg-[#135841] text-white font-extrabold text-[12.5px] uppercase tracking-wider inline-flex items-center gap-2 transition-all"
            >
              <span>Explore Catalog</span>
              <GlorovCustomIcons.arrowForward size={14} />
            </Link>
          </div>
        ) : (
          <div className="w-full">
            {/* Page Header */}
            <div className="pb-4 mb-6 border-b border-[#E5ECE8] flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <div>
                <h1 className="font-serif text-[22px] sm:text-[26px] font-extrabold text-[#0A4C36] tracking-tight">
                  Checkout & Payment
                </h1>
                <p className="text-[12.5px] text-[#6B7280] mt-0.5">
                  Complete shipping destination and choose payment method to finalize your order
                </p>
              </div>
              <span className="text-[12px] font-bold text-[#059669] flex items-center gap-1">
                <GlorovCustomIcons.shieldCheck size={14} />
                <span>100% Encrypted & Secure</span>
              </span>
            </div>

            {/* Deliverability Disconnected Alert Banner */}
            {!backendConnected && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-900 flex items-start gap-3 shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 flex-shrink-0 mt-0.5">
                  <GlorovCustomIcons.info size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif font-bold text-[14.5px] text-red-950">
                    Delivery is not available to this address
                  </h3>
                  <p className="text-[12.5px] text-red-800 mt-0.5 leading-relaxed">
                    Our fulfillment network is currently not connected to the store admin dashboard. Doorstep courier dispatch cannot be scheduled at this time. Please check back later.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              {/* Left Column: Multi-Step Forms matching Flutter (Flex 13 / 60%) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Razorpay Online Payment Failure / Cancellation Banner */}
                <RazorpayPaymentErrorAlert
                  error={razorpayError}
                  paymentFailed={razorpayPaymentFailed}
                  isCancelled={isRazorpayCancelled}
                  onRetry={() => handlePlaceOrder()}
                  onSwitchToCod={() => {
                    setSelectedPayment('cod')
                    resetRazorpayState()
                  }}
                  onDismiss={() => resetRazorpayState()}
                  canSwitchToCod={cartTotal <= 5000}
                />

                {/* Authoritative Checkout Validation Banner */}
                {checkoutErrors.length > 0 && (
                  <div
                    role="alert"
                    className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[13px] flex flex-col gap-2"
                  >
                    <div className="font-bold flex items-center gap-1.5 text-red-900">
                      <GlorovCustomIcons.info size={16} className="text-red-600" />
                      <span>Order Processing Notice</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-[12px] text-red-700">
                      {checkoutErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationWarnings.length > 0 && (
                  <div
                    role="status"
                    className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[12.5px] flex flex-col gap-1"
                  >
                    <div className="font-bold flex items-center gap-1.5 text-amber-950">
                      <GlorovCustomIcons.info size={15} className="text-amber-700" />
                      <span>Notice</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-0.5 text-[11.5px] text-amber-800">
                      {validationWarnings.map((warn, i) => (
                        <li key={i}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 1. Address Form with Medusa saved addresses */}
                <CheckoutAddressForm
                  initialAddress={shippingAddress}
                  onChange={handleAddressChange}
                  savedAddresses={addresses}
                  customerEmail={customer?.email}
                  customerName={customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : ''}
                  customerPhone={customer?.phone}
                  onSaveNewAddress={addAddress}
                  onSetDefaultAddress={setDefaultAddress}
                  onSaveOptionsChange={setSaveAddressOptions}
                  deliverabilityError={deliverabilityError}
                  isDeliverable={backendConnected}
                  showAllErrors={showAddressErrors}
                />

                {/* 2. Shipping Speed */}
                <ShippingMethodSelector
                  selectedOptionId={selectedShippingOption.id}
                  onSelectOption={(opt) => setSelectedShippingOption(opt)}
                  subtotal={cartSubtotal}
                />

                {/* 3. Payment Method */}
                <PaymentMethodSelector
                  selectedMethod={selectedPayment}
                  onSelectMethod={(method) => setSelectedPayment(method)}
                  totalAmount={cartTotal}
                  totalAmountPaise={Math.round(cartTotal * 100)}
                />

                {/* 4. Review Items in Bag matching Flutter `_buildOrderItemsReview` */}
                <div className="w-full p-4 sm:p-6 rounded-[18px] bg-white border border-[#E5ECE8] flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#EBF5F0] flex items-center justify-center text-[#0A4C36] flex-shrink-0">
                        <GlorovCustomIcons.box size={15} />
                      </div>
                      <h2 className="text-[13.5px] font-bold text-[#111827] uppercase tracking-wider">
                        4. Review Items in Bag ({cartItems.length})
                      </h2>
                    </div>

                    <Link
                      href="/cart"
                      className="text-[12px] font-bold text-[#0A4C36] hover:underline flex items-center gap-1"
                    >
                      <span>Modify Bag</span>
                      <GlorovCustomIcons.arrowForward size={12} />
                    </Link>
                  </div>

                  <div className="divide-y divide-[#F3F4F6]">
                    {cartItems.map((item) => (
                      <ReviewBagItemRow key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Sticky Order Summary & Pay matching Flutter (Flex 8 / 40%) */}
              <div className="lg:col-span-5 lg:sticky lg:top-20">
                <CheckoutOrderSummary
                  items={cartItems}
                  subtotal={cartSubtotal}
                  discountAmount={discountAmount}
                  shippingAmount={shippingAmount}
                  total={cartTotal}
                  appliedCoupon={appliedCoupon}
                  isSubmitting={isSubmitting}
                  isAddressValid={isAddressValid}
                  isDeliverable={backendConnected}
                  deliverabilityError={deliverabilityError}
                  hasSelectedPayment={Boolean(selectedPayment)}
                  onPlaceOrder={handlePlaceOrder}
                />
              </div>
            </div>
          </div>
        )}
      </PageContainer>

      {/* Razorpay Processing & Verification Modal Overlay */}
      <RazorpayProcessingOverlay isOpen={isRazorpayLoading} />
    </div>
  )
}

const ReviewBagItemRow: React.FC<{ item: CartItem }> = ({ item }) => {
  return (
    <div className="py-3 flex items-center gap-3 first:pt-1 last:pb-1">
      <div className="relative w-12 h-12 rounded-[10px] overflow-hidden border border-[#EFEFEF] bg-[#F9FAF8] flex-shrink-0">
        {item.image ? (
          <GlorovImage
            src={item.image}
            alt={item.title}
            fill
            sizes="48px"
            className="object-cover"
            containerClassName="w-full h-full"
            fallbackTitle={item.title}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#16A34A] bg-[#F3F7F5]">
            <GlorovCustomIcons.spa size={20} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-serif text-[13px] font-bold text-[#111827] truncate">
          {item.title}
        </p>
        <p className="text-[11px] text-[#6B7280] font-medium mt-0.5">
          {item.variantName || 'Standard Pack'} • Qty: {item.quantity}
        </p>
      </div>

      <span className="text-[13px] font-extrabold text-[#0A4C36] flex-shrink-0">
        {formatINR(item.price * item.quantity)}
      </span>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GlorovImage } from '../../components/ui/GlorovImage'
import { useCart, useCheckout, useToast } from '../../context/StorefrontContext'
import { PageContainer } from '../../components/layout/PageContainer'
import { CheckoutAddressForm } from '../../components/checkout/CheckoutAddressForm'
import { ShippingMethodSelector } from '../../components/checkout/ShippingMethodSelector'
import { PaymentMethodSelector } from '../../components/checkout/PaymentMethodSelector'
import { CheckoutOrderSummary } from '../../components/checkout/CheckoutOrderSummary'
import { GlorovCustomIcons } from '../../components/common/GlorovIcons'
import { formatINR } from '../../components/product/ProductPrice'
import type { CartItem } from '../../types/cart'
import type { DeliveryAddress, PaymentMethodType } from '../../types/checkout'

/**
 * GLOROV Checkout & Payment Page
 * 100% matched with Flutter `GlorovCheckoutScreen`:
 * - Breadcrumbs with Back button, separator, and botanical trail
 * - 1. Delivery Address form with real-time Indian PIN serviceability check
 * - 2. Delivery Speed & Packaging with Eco vs Live Plant Express
 * - 3. Demonstration Payment Selector (COD, UPI Instant, Card Preview)
 * - 4. Review Items in Bag with thumbnail, variant, and modify bag link
 * - Sticky Order Summary with coupon code input and signature Forest Green confirmation CTA
 */
export default function CheckoutPage(): React.ReactElement {
  const router = useRouter()
  const { showToast } = useToast()
  const {
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
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType>('cod')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [checkoutErrors, setCheckoutErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])

  // Automatically switch away from COD if cart total exceeds the ₹5,000 security threshold
  React.useEffect(() => {
    if (cartTotal > 5000 && selectedPayment === 'cod') {
      setSelectedPayment('upi')
      showToast(
        'info',
        'Cash on Delivery is limited to orders up to ₹5,000. Switched to UPI Instant Transfer.',
        { title: 'Payment Method Adjusted' }
      )
    }
  }, [cartTotal, selectedPayment, showToast])

  const handleAddressChange = (addr: DeliveryAddress, valid: boolean): void => {
    setAddress(addr)
    setIsAddressValid(valid)
    if (valid) {
      setShippingAddress(addr)
    }
  }

  const handlePlaceOrder = async (): Promise<void> => {
    if (!address || !isAddressValid) {
      showToast('error', 'Please complete all required delivery address fields.', {
        title: 'Incomplete Address',
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

    try {
      const payload = {
        items: cartItems.map((it) => ({
          productId: it.productId,
          variantId: it.variantId,
          title: it.title,
          category: it.category,
          quantity: it.quantity,
          clientPrice: it.price,
        })),
        couponCode: appliedCoupon,
        shippingOptionId: selectedShippingOption.id,
        paymentMethod: selectedPayment,
        deliveryAddress: address,
        clientGrandTotal: cartTotal,
      }

      const res = await fetch('/api/checkout/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data.success) {
        const errList = data.errors || [data.error || 'Failed to complete order. Please check inputs.']
        setCheckoutErrors(errList)
        showToast('error', errList[0], { title: 'Order Verification Failed' })
        setIsSubmitting(false)
        return
      }

      if (data.warnings && data.warnings.length > 0) {
        setValidationWarnings(data.warnings)
      }

      setLatestOrder(data.order)
      clearCart()
      setIsSubmitting(false)

      showToast('success', `Order ${data.order.displayId} placed successfully!`, {
        title: 'Order Confirmed',
        duration: 4000,
      })

      router.push(`/order/confirmation?id=${data.order.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error placing order'
      setCheckoutErrors([msg])
      showToast('error', msg, { title: 'Network Error' })
      setIsSubmitting(false)
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
          <div className="p-10 sm:p-14 text-center rounded-[20px] bg-white border border-[#E5ECE8] shadow-[0_2px_8px_rgba(0,0,0,0.04)] max-w-md mx-auto my-8">
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
              className="px-7 py-3 rounded-full bg-[#0A4C36] hover:bg-[#135841] text-white font-extrabold text-[12.5px] uppercase tracking-wider inline-flex items-center gap-2 shadow-[0_4px_10px_rgba(10,76,54,0.18)] transition-all"
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
                  Complete shipping destination and select demonstration payment to finalize your order
                </p>
              </div>
              <span className="text-[12px] font-bold text-[#059669] flex items-center gap-1">
                <GlorovCustomIcons.shieldCheck size={14} />
                <span>Simulated Secure Order</span>
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              {/* Left Column: Multi-Step Forms matching Flutter (Flex 13 / 60%) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Authoritative Checkout Validation Banner */}
                {checkoutErrors.length > 0 && (
                  <div
                    role="alert"
                    className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[13px] flex flex-col gap-2 shadow-sm"
                  >
                    <div className="font-bold flex items-center gap-1.5 text-red-900">
                      <GlorovCustomIcons.info size={16} className="text-red-600" />
                      <span>Order Validation Failed</span>
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
                    className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[12.5px] flex flex-col gap-1 shadow-sm"
                  >
                    <div className="font-bold flex items-center gap-1.5 text-amber-950">
                      <GlorovCustomIcons.info size={15} className="text-amber-700" />
                      <span>Security & Pricing Notice</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-0.5 text-[11.5px] text-amber-800">
                      {validationWarnings.map((warn, i) => (
                        <li key={i}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 1. Address Form */}
                <CheckoutAddressForm
                  initialAddress={shippingAddress}
                  onChange={handleAddressChange}
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
                />

                {/* 4. Review Items in Bag matching Flutter `_buildOrderItemsReview` */}
                <div className="w-full p-4 sm:p-6 rounded-[18px] bg-white border border-[#E5ECE8] shadow-[0_1.5px_6px_rgba(0,0,0,0.03)] flex flex-col gap-3">
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
                  onPlaceOrder={handlePlaceOrder}
                />
              </div>
            </div>
          </div>
        )}
      </PageContainer>
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

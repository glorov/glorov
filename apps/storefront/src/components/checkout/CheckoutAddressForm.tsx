'use client'

import React, { useState, useEffect } from 'react'
import type { DeliveryAddress } from '../../types/checkout'
import type { CustomerAddress } from '../../types/account'
import { GlorovCustomIcons } from '../common/GlorovIcons'
import {
  INDIAN_STATES,
  isValidPinCode,
  isValidIndianPhone,
  isValidIndianState,
} from '../../lib/validation/address'

export interface CheckoutAddressFormProps {
  initialAddress: DeliveryAddress | null
  onChange: (address: DeliveryAddress, isValid: boolean) => void
  savedAddresses?: CustomerAddress[]
  customerEmail?: string
  customerName?: string
  customerPhone?: string
  onSaveNewAddress?: (address: Omit<CustomerAddress, 'id'>) => Promise<boolean>
  onSetDefaultAddress?: (addressId: string) => Promise<boolean>
  onSaveOptionsChange?: (options: { saveToAccount: boolean; setAsDefault: boolean }) => void
  deliverabilityError?: string | null
  isDeliverable?: boolean
  showAllErrors?: boolean
}

function createEmptyAddress(email = '', name = '', phone = ''): DeliveryAddress {
  return {
    fullName: name,
    phoneNumber: phone,
    email: email,
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    countryCode: 'in',
  }
}

function customerAddressToDeliveryAddress(
  addr: CustomerAddress,
  email: string = ''
): DeliveryAddress {
  return {
    fullName: addr.fullName,
    phoneNumber: addr.phoneNumber,
    email: email,
    addressLine1: addr.addressLine1,
    addressLine2: addr.addressLine2,
    city: addr.city,
    state: addr.state,
    pincode: addr.pincode,
    countryCode: addr.countryCode || 'in',
  }
}

export const CheckoutAddressForm: React.FC<CheckoutAddressFormProps> = ({
  initialAddress,
  onChange,
  savedAddresses = [],
  customerEmail = '',
  customerName = '',
  customerPhone = '',
  onSaveNewAddress,
  onSetDefaultAddress,
  onSaveOptionsChange,
  deliverabilityError = null,
  isDeliverable = true,
  showAllErrors = false,
}) => {
  const hasSavedAddresses = savedAddresses.length > 0

  // Find default or first address if available
  const defaultSavedAddress =
    savedAddresses.find((a) => a.isDefault) || savedAddresses[0] || null

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaultSavedAddress ? defaultSavedAddress.id : null
  )
  const [isEnteringNew, setIsEnteringNew] = useState<boolean>(!hasSavedAddresses)
  const [saveToAccount, setSaveToAccount] = useState<boolean>(false)
  const [saveAsDefault, setSaveAsDefault] = useState<boolean>(!hasSavedAddresses)
  const [isUpdatingDefault, setIsUpdatingDefault] = useState<string | null>(null)

  const [address, setAddress] = useState<DeliveryAddress>(() => {
    if (initialAddress && (initialAddress.fullName || initialAddress.addressLine1)) {
      return initialAddress
    }
    if (defaultSavedAddress) {
      return customerAddressToDeliveryAddress(defaultSavedAddress, customerEmail)
    }
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
      try {
        const stored = localStorage.getItem('glorov_last_delivery_address')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed && (parsed.addressLine1 || parsed.pincode)) {
            return {
              ...parsed,
              email: customerEmail || parsed.email || '',
              fullName: customerName || parsed.fullName || '',
              phoneNumber: customerPhone || parsed.phoneNumber || '',
            }
          }
        }
      } catch {}
    }
    return createEmptyAddress(customerEmail, customerName, customerPhone)
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isServiceable, setIsServiceable] = useState<boolean>(true)

  const getVisibleError = (field: string): string | undefined => {
    if (touched[field] || showAllErrors) {
      return errors[field]
    }
    return undefined
  }

  const handleBlur = (field: keyof DeliveryAddress): void => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const validate = (current: DeliveryAddress): boolean => {
    const errs: Record<string, string> = {}

    if (!current.fullName.trim() || current.fullName.trim().length < 2) {
      errs.fullName = 'Enter recipient full name (min 2 chars)'
    }

    const cleanPhone = current.phoneNumber.trim().replace(/\D/g, '')
    if (!cleanPhone || !isValidIndianPhone(cleanPhone)) {
      errs.phoneNumber = 'Must be a 10-digit Indian mobile number'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(current.email.trim())) {
      errs.email = 'Enter a valid email for order receipt'
    }

    if (!current.addressLine1.trim() || current.addressLine1.trim().length < 5) {
      errs.addressLine1 = 'Enter house/flat no. and street address (min 5 chars)'
    }

    if (!current.city.trim() || current.city.trim().length < 2) {
      errs.city = 'Enter city or district'
    }

    if (!current.state || !isValidIndianState(current.state)) {
      errs.state = 'Select a valid Indian State or Union Territory'
    }

    const cleanPin = current.pincode.trim().replace(/\D/g, '')
    if (!cleanPin || !isValidPinCode(cleanPin)) {
      errs.pincode = 'Must be a valid 6-digit PIN (cannot start with 0)'
    }

    setErrors(errs)
    const valid = Object.keys(errs).length === 0
    setIsServiceable(isValidPinCode(cleanPin))
    return valid
  }

  const handleSetDefault = async (addressId: string) => {
    if (!onSetDefaultAddress) return
    setIsUpdatingDefault(addressId)
    try {
      await onSetDefaultAddress(addressId)
    } finally {
      setIsUpdatingDefault(null)
    }
  }

  const handleChange = (field: keyof DeliveryAddress, value: string): void => {
    const next = { ...address, [field]: value }
    setAddress(next)
    setTouched((prev) => ({ ...prev, [field]: true }))
    const valid = validate(next)
    try {
      localStorage.setItem('glorov_last_delivery_address', JSON.stringify(next))
    } catch {}
    onChange(next, valid)
  }

  const handleSelectSavedAddress = (saved: CustomerAddress) => {
    setSelectedAddressId(saved.id)
    setIsEnteringNew(false)
    setTouched({})
    const next = customerAddressToDeliveryAddress(
      saved,
      address.email || customerEmail
    )
    setAddress(next)
    const valid = validate(next)
    onChange(next, valid)
  }

  const handleSwitchToNewAddress = () => {
    setSelectedAddressId(null)
    setIsEnteringNew(true)
    setTouched({})
    const newEmptyAddr: DeliveryAddress = {
      fullName: customerName || '',
      phoneNumber: customerPhone || '',
      email: customerEmail || address.email || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      countryCode: 'in',
    }
    setAddress(newEmptyAddr)
    const valid = validate(newEmptyAddr)
    onChange(newEmptyAddr, valid)
  }

  // Synchronize on mount or when savedAddresses initially load
  useEffect(() => {
    if (hasSavedAddresses && !initialAddress && defaultSavedAddress && !selectedAddressId) {
      handleSelectSavedAddress(defaultSavedAddress)
    } else {
      const valid = validate(address)
      onChange(address, valid)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full p-4 sm:p-6 rounded-[18px] bg-white border border-[#E5ECE8] flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-3 border-b border-[#F0F4F2]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#EBF5F0] flex items-center justify-center text-[#0A4C36] flex-shrink-0">
            <GlorovCustomIcons.mapPin size={15} />
          </div>
          <div>
            <h2 className="text-[13.5px] font-bold text-[#111827] uppercase tracking-wider">
              1. Delivery Address
            </h2>
            <p className="text-[11px] text-[#6B7280]">
              Fast doorstep courier transit for live seeds and plants
            </p>
          </div>
        </div>
      </div>

      {/* Deliverability / Admin Disconnected Alert */}
      {(deliverabilityError || isDeliverable === false) && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[12.5px] flex items-start gap-2.5"
        >
          <GlorovCustomIcons.info size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-red-900 leading-tight">Delivery is not available to this address</p>
            <p className="text-[11.5px] text-red-700 mt-0.5">
              {deliverabilityError || 'The store admin and fulfillment network are currently disconnected. Orders cannot be shipped to this location.'}
            </p>
          </div>
        </div>
      )}

      {/* Step 1.A: Saved Address Selection Step (for authenticated customers with Medusa addresses) */}
      {hasSavedAddresses && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
              Select Delivery Location
            </span>
            <button
              type="button"
              onClick={isEnteringNew ? () => defaultSavedAddress && handleSelectSavedAddress(defaultSavedAddress) : handleSwitchToNewAddress}
              className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
            >
              {isEnteringNew ? '← Choose Saved Address' : '+ Deliver to a New Address'}
            </button>
          </div>

          {!isEnteringNew && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedAddresses.map((saved) => {
                const isSelected = selectedAddressId === saved.id
                return (
                  <div
                    key={saved.id}
                    onClick={() => handleSelectSavedAddress(saved)}
                    role="radio"
                    aria-checked={isSelected}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 text-xs ${
                      isSelected
                        ? 'border-[#0A4C36] bg-[#E8F5E9]/30 ring-1 ring-[#0A4C36]'
                        : 'border-stone-200 hover:border-stone-400 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="selectedAddress"
                            checked={isSelected}
                            onChange={() => handleSelectSavedAddress(saved)}
                            className="text-[#0A4C36] focus:ring-[#0A4C36]"
                          />
                          <span className="font-bold text-stone-900">{saved.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {saved.isDefault ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-900 flex items-center gap-0.5">
                              ★ Default
                            </span>
                          ) : onSetDefaultAddress ? (
                            <button
                              type="button"
                              disabled={isUpdatingDefault === saved.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSetDefault(saved.id)
                              }}
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold text-[#0A4C36] bg-[#EBF5F0] hover:bg-[#D8EFE4] border border-[#BCE3D0] transition-colors"
                              title="Set this address as your default delivery location"
                            >
                              {isUpdatingDefault === saved.id ? 'Setting...' : 'Set as Default'}
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <p className="font-semibold text-stone-800">{saved.fullName}</p>
                      <p className="text-stone-600 leading-snug">{saved.addressLine1}</p>
                      {saved.addressLine2 && <p className="text-stone-500">{saved.addressLine2}</p>}
                      <p className="text-stone-700 mt-0.5">
                        {saved.city}, {saved.state} — <span className="font-mono font-semibold">{saved.pincode}</span>
                      </p>
                      <p className="text-stone-500 mt-0.5">Phone: +91 {saved.phoneNumber}</p>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#0A4C36] pt-1">
                        <GlorovCustomIcons.check size={13} />
                        <span>Deliver to this address</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 1.B: Address Input Form (shown for guest or when entering new address) */}
      {(!hasSavedAddresses || isEnteringNew) && (
        <div className="flex flex-col gap-3.5 pt-1">
          {hasSavedAddresses && (
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
              <span>Entering a new shipping destination for this order</span>
              <button
                type="button"
                onClick={() => defaultSavedAddress && handleSelectSavedAddress(defaultSavedAddress)}
                className="text-xs font-bold text-brand-primary hover:underline"
              >
                Use Saved Address
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {/* Full Name */}
            <div>
              <label htmlFor="checkout-addr-fullname" className="block text-[12px] font-bold text-[#374151] mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="checkout-addr-fullname"
                type="text"
                value={address.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                placeholder="Recipient full name"
                className={`w-full px-3.5 py-2.5 rounded-[10px] border ${
                  getVisibleError('fullName') ? 'border-rose-500' : 'border-[#D1D5DB]'
                } focus:outline-none focus:border-[#0A4C36] focus:ring-1 focus:ring-[#0A4C36] text-[13px] text-[#111827] placeholder:text-[#9CA3AF] transition-colors`}
              />
              {getVisibleError('fullName') && <p className="mt-1 text-[11px] text-rose-500">{getVisibleError('fullName')}</p>}
            </div>

            {/* Mobile Phone */}
            <div>
              <label htmlFor="checkout-addr-phone" className="block text-[12px] font-bold text-[#374151] mb-1">
                10-Digit Mobile Phone <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-[#6B7280] font-semibold select-none text-[12px]">+91</span>
                <input
                  id="checkout-addr-phone"
                  type="tel"
                  maxLength={10}
                  value={address.phoneNumber}
                  onChange={(e) => handleChange('phoneNumber', e.target.value.replace(/\D/g, ''))}
                  onBlur={() => handleBlur('phoneNumber')}
                  placeholder="9876543210"
                  className={`w-full pl-11 pr-3.5 py-2.5 rounded-[10px] border ${
                    getVisibleError('phoneNumber') ? 'border-rose-500' : 'border-[#D1D5DB]'
                  } focus:outline-none focus:border-[#0A4C36] focus:ring-1 focus:ring-[#0A4C36] text-[13px] text-[#111827] placeholder:text-[#9CA3AF] font-mono transition-colors`}
                />
              </div>
              {getVisibleError('phoneNumber') && <p className="mt-1 text-[11px] text-rose-500">{getVisibleError('phoneNumber')}</p>}
            </div>

            {/* Email */}
            <div className="sm:col-span-2">
              <label htmlFor="checkout-addr-email" className="block text-[12px] font-bold text-[#374151] mb-1">
                Email for Order Receipt & Updates <span className="text-rose-500">*</span>
              </label>
              <input
                id="checkout-addr-email"
                type="email"
                value={address.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="name@example.com"
                className={`w-full px-3.5 py-2.5 rounded-[10px] border ${
                  getVisibleError('email') ? 'border-rose-500' : 'border-[#D1D5DB]'
                } focus:outline-none focus:border-[#0A4C36] focus:ring-1 focus:ring-[#0A4C36] text-[13px] text-[#111827] placeholder:text-[#9CA3AF] transition-colors`}
              />
              {getVisibleError('email') && <p className="mt-1 text-[11px] text-rose-500">{getVisibleError('email')}</p>}
            </div>

            {/* Street Address */}
            <div className="sm:col-span-2">
              <label htmlFor="checkout-addr-line1" className="block text-[12px] font-bold text-[#374151] mb-1">
                Flat, House No., Building, Street <span className="text-rose-500">*</span>
              </label>
              <input
                id="checkout-addr-line1"
                type="text"
                value={address.addressLine1}
                onChange={(e) => handleChange('addressLine1', e.target.value)}
                onBlur={() => handleBlur('addressLine1')}
                placeholder="Flat 402, Green Meadows, Orchid Lane"
                className={`w-full px-3.5 py-2.5 rounded-[10px] border ${
                  getVisibleError('addressLine1') ? 'border-rose-500' : 'border-[#D1D5DB]'
                } focus:outline-none focus:border-[#0A4C36] focus:ring-1 focus:ring-[#0A4C36] text-[13px] text-[#111827] placeholder:text-[#9CA3AF] transition-colors`}
              />
              {getVisibleError('addressLine1') && <p className="mt-1 text-[11px] text-rose-500">{getVisibleError('addressLine1')}</p>}
            </div>

            {/* PIN Code & City */}
            <div className="grid grid-cols-2 gap-2 sm:col-span-1">
              <div>
                <label htmlFor="checkout-addr-pincode" className="block text-[12px] font-bold text-[#374151] mb-1">
                  PIN Code <span className="text-rose-500">*</span>
                </label>
                <input
                  id="checkout-addr-pincode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={address.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, ''))}
                  onBlur={() => handleBlur('pincode')}
                  placeholder="560001"
                  className={`w-full px-3 py-2.5 rounded-[10px] border ${
                    getVisibleError('pincode') ? 'border-rose-500' : 'border-[#D1D5DB]'
                  } focus:outline-none focus:border-[#0A4C36] focus:ring-1 focus:ring-[#0A4C36] text-[13px] text-[#111827] font-mono transition-colors`}
                />
                {getVisibleError('pincode') && <p className="mt-1 text-[11px] text-rose-500">{getVisibleError('pincode')}</p>}
              </div>

              <div>
                <label htmlFor="checkout-addr-city" className="block text-[12px] font-bold text-[#374151] mb-1">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  id="checkout-addr-city"
                  type="text"
                  value={address.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  onBlur={() => handleBlur('city')}
                  placeholder="Bengaluru"
                  className={`w-full px-3 py-2.5 rounded-[10px] border ${
                    getVisibleError('city') ? 'border-rose-500' : 'border-[#D1D5DB]'
                  } focus:outline-none focus:border-[#0A4C36] focus:ring-1 focus:ring-[#0A4C36] text-[13px] text-[#111827] transition-colors`}
                />
                {getVisibleError('city') && <p className="mt-1 text-[11px] text-rose-500">{getVisibleError('city')}</p>}
              </div>
            </div>

            {/* State & Landmark */}
            <div className="grid grid-cols-2 gap-2 sm:col-span-1">
              <div>
                <label htmlFor="checkout-addr-state" className="block text-[12px] font-bold text-[#374151] mb-1">
                  State <span className="text-rose-500">*</span>
                </label>
                <select
                  id="checkout-addr-state"
                  value={address.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  onBlur={() => handleBlur('state')}
                  className={`w-full px-2.5 py-2.5 rounded-[10px] border ${
                    getVisibleError('state') ? 'border-rose-500' : 'border-[#D1D5DB]'
                  } bg-white focus:outline-none focus:border-[#0A4C36] focus:ring-1 focus:ring-[#0A4C36] text-[12.5px] text-[#111827] cursor-pointer`}
                >
                  <option value="">Select State / UT</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                {getVisibleError('state') && <p className="mt-1 text-[11px] text-rose-500">{getVisibleError('state')}</p>}
              </div>

              <div>
                <label htmlFor="checkout-addr-landmark" className="block text-[12px] font-bold text-[#374151] mb-1">
                  Landmark <span className="text-[#9CA3AF] text-[10px] font-normal">(Optional)</span>
                </label>
                <input
                  id="checkout-addr-landmark"
                  type="text"
                  value={address.landmark || ''}
                  onChange={(e) => handleChange('landmark', e.target.value)}
                  onBlur={() => handleBlur('landmark')}
                  placeholder="Near Garden"
                  className="w-full px-3 py-2.5 rounded-[10px] border border-[#D1D5DB] focus:outline-none focus:border-[#0A4C36] focus:ring-1 focus:ring-[#0A4C36] text-[12.5px] text-[#111827] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Option to save new address to account for authenticated patrons */}
          {customerEmail && (
            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-stone-100">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-stone-700">
                <input
                  type="checkbox"
                  checked={saveToAccount}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setSaveToAccount(checked)
                    onSaveOptionsChange?.({ saveToAccount: checked, setAsDefault: saveAsDefault })
                    if (checked && onSaveNewAddress && validate(address)) {
                      onSaveNewAddress({
                        name: 'Home',
                        fullName: address.fullName,
                        phoneNumber: address.phoneNumber,
                        addressLine1: address.addressLine1,
                        addressLine2: address.addressLine2,
                        city: address.city,
                        state: address.state,
                        pincode: address.pincode,
                        countryCode: 'in',
                        isDefault: saveAsDefault,
                      }).catch(() => {})
                    }
                  }}
                  className="rounded text-[#0A4C36] focus:ring-[#0A4C36]"
                />
                <span className="font-semibold text-stone-800">Save this address to my GLOROV account for future orders</span>
              </label>

              {saveToAccount && (
                <label className="flex items-center gap-2 pl-5 cursor-pointer select-none text-xs text-stone-600 animate-fade-in">
                  <input
                    type="checkbox"
                    checked={saveAsDefault}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setSaveAsDefault(checked)
                      onSaveOptionsChange?.({ saveToAccount: true, setAsDefault: checked })
                    }}
                    className="rounded text-[#0A4C36] focus:ring-[#0A4C36]"
                  />
                  <span>Set as my default delivery address</span>
                </label>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pincode Serviceability Live Badge (Only when backend is connected and no deliverability error) */}
      {!deliverabilityError && isDeliverable !== false && isServiceable && address.pincode.length === 6 && (
        <div className="mt-1 px-3 py-2 rounded-[10px] bg-[#E8F5E9] border border-[#A7F3D0] flex items-center gap-2 text-[#047857]">
          <GlorovCustomIcons.check size={14} className="text-[#059669] flex-shrink-0" />
          <p className="text-[11.5px] font-semibold leading-tight">
            Express botanical transit active for PIN <span className="font-mono font-bold">{address.pincode}</span> ({address.city || 'City'}, {address.state}). Delivery in 2–3 business days.
          </p>
        </div>
      )}
    </div>
  )
}

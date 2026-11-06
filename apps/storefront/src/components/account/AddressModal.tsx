'use client'

import React, { useState } from 'react'
import type { CustomerAddress } from '../../types/account'
import {
  INDIAN_STATES,
  isValidPinCode,
  isValidIndianPhone,
  isValidIndianState,
} from '../../lib/validation/address'

export interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (address: Omit<CustomerAddress, 'id'>) => Promise<boolean>
  initialData?: CustomerAddress | null
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name || 'Home')
  const [fullName, setFullName] = useState(initialData?.fullName || '')
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '')
  const [addressLine1, setAddressLine1] = useState(initialData?.addressLine1 || '')
  const [addressLine2, setAddressLine2] = useState(initialData?.addressLine2 || '')
  const [city, setCity] = useState(initialData?.city || '')
  const [state, setState] = useState(initialData?.state || 'Karnataka')
  const [pincode, setPincode] = useState(initialData?.pincode || '')
  const [isDefault, setIsDefault] = useState(initialData?.isDefault ?? false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {}

    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = 'Full name is required (minimum 2 characters)'
    }

    const cleanPhone = phoneNumber.trim().replace(/\D/g, '')
    if (!cleanPhone || !isValidIndianPhone(cleanPhone)) {
      errs.phoneNumber = 'Must be a valid 10-digit Indian mobile number'
    }

    if (!addressLine1.trim() || addressLine1.trim().length < 5) {
      errs.addressLine1 = 'Enter house/flat no., building and street address (min 5 characters)'
    }

    if (!city.trim() || city.trim().length < 2) {
      errs.city = 'Enter city or district'
    }

    if (!state || !isValidIndianState(state)) {
      errs.state = 'Please select a valid Indian State or Union Territory'
    }

    const cleanPin = pincode.trim().replace(/\D/g, '')
    if (!cleanPin || !isValidPinCode(cleanPin)) {
      errs.pincode = 'Must be a 6-digit Indian PIN code (cannot start with 0)'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSaving(true)
    const success = await onSave({
      name: name.trim() || 'Home',
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim().replace(/\D/g, ''),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || undefined,
      city: city.trim(),
      state,
      pincode: pincode.trim().replace(/\D/g, ''),
      countryCode: 'in',
      isDefault,
    })
    setIsSaving(false)
    if (success) {
      onClose()
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-xl max-h-[90vh] overflow-y-auto scrollbar-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            {initialData ? 'Edit Delivery Address' : 'Add New Delivery Address'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          <div>
            <label htmlFor="modal-addr-name" className="block font-semibold text-stone-700 mb-1">
              Address Label
            </label>
            <input
              id="modal-addr-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Home, Terrace Garden, Farmhouse"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="modal-addr-fullname" className="block font-semibold text-stone-700 mb-1">
                Full Name *
              </label>
              <input
                id="modal-addr-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }))
                }}
                placeholder="Full Name"
                className={`w-full px-3.5 py-2 rounded-xl border ${
                  errors.fullName ? 'border-rose-500' : 'border-stone-300'
                } focus:outline-none focus:border-brand-primary`}
              />
              {errors.fullName && <p className="mt-1 text-[11px] text-rose-500">{errors.fullName}</p>}
            </div>
            <div>
              <label htmlFor="modal-addr-phone" className="block font-semibold text-stone-700 mb-1">
                Mobile Number *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-stone-400 font-semibold select-none text-[11px]">+91</span>
                <input
                  id="modal-addr-phone"
                  type="tel"
                  required
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value.replace(/\D/g, ''))
                    if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: '' }))
                  }}
                  placeholder="9876543210"
                  className={`w-full pl-10 pr-3.5 py-2 rounded-xl border ${
                    errors.phoneNumber ? 'border-rose-500' : 'border-stone-300'
                  } focus:outline-none focus:border-brand-primary font-mono`}
                />
              </div>
              {errors.phoneNumber && <p className="mt-1 text-[11px] text-rose-500">{errors.phoneNumber}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="modal-addr-line1" className="block font-semibold text-stone-700 mb-1">
              Address Line 1 *
            </label>
            <input
              id="modal-addr-line1"
              type="text"
              required
              value={addressLine1}
              onChange={(e) => {
                setAddressLine1(e.target.value)
                if (errors.addressLine1) setErrors((prev) => ({ ...prev, addressLine1: '' }))
              }}
              placeholder="Flat, House no., Building, Street"
              className={`w-full px-3.5 py-2 rounded-xl border ${
                errors.addressLine1 ? 'border-rose-500' : 'border-stone-300'
              } focus:outline-none focus:border-brand-primary`}
            />
            {errors.addressLine1 && <p className="mt-1 text-[11px] text-rose-500">{errors.addressLine1}</p>}
          </div>

          <div>
            <label htmlFor="modal-addr-line2" className="block font-semibold text-stone-700 mb-1">
              Address Line 2 (Optional)
            </label>
            <input
              id="modal-addr-line2"
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Area, Sector, Landmark"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="modal-addr-city" className="block font-semibold text-stone-700 mb-1">
                City *
              </label>
              <input
                id="modal-addr-city"
                type="text"
                required
                value={city}
                onChange={(e) => {
                  setCity(e.target.value)
                  if (errors.city) setErrors((prev) => ({ ...prev, city: '' }))
                }}
                placeholder="Bengaluru"
                className={`w-full px-3.5 py-2 rounded-xl border ${
                  errors.city ? 'border-rose-500' : 'border-stone-300'
                } focus:outline-none focus:border-brand-primary`}
              />
              {errors.city && <p className="mt-1 text-[11px] text-rose-500">{errors.city}</p>}
            </div>
            <div>
              <label htmlFor="modal-addr-state" className="block font-semibold text-stone-700 mb-1">
                State *
              </label>
              <select
                id="modal-addr-state"
                value={state}
                onChange={(e) => {
                  setState(e.target.value)
                  if (errors.state) setErrors((prev) => ({ ...prev, state: '' }))
                }}
                className={`w-full px-3.5 py-2 rounded-xl border ${
                  errors.state ? 'border-rose-500' : 'border-stone-300'
                } bg-white focus:outline-none focus:border-brand-primary cursor-pointer`}
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              {errors.state && <p className="mt-1 text-[11px] text-rose-500">{errors.state}</p>}
            </div>
            <div>
              <label htmlFor="modal-addr-pincode" className="block font-semibold text-stone-700 mb-1">
                Pincode *
              </label>
              <input
                id="modal-addr-pincode"
                type="text"
                required
                maxLength={6}
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/g, ''))
                  if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: '' }))
                }}
                placeholder="560038"
                className={`w-full px-3.5 py-2 rounded-xl border ${
                  errors.pincode ? 'border-rose-500' : 'border-stone-300'
                } focus:outline-none focus:border-brand-primary font-mono`}
              />
              {errors.pincode && <p className="mt-1 text-[11px] text-rose-500">{errors.pincode}</p>}
            </div>
          </div>

          <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded text-brand-primary border-stone-300"
            />
            <span className="font-semibold text-stone-700 text-xs">Set as default delivery address</span>
          </label>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-primary text-white hover:bg-brand-primary/95 transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

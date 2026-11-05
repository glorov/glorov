'use client'

import React, { useState } from 'react'
import type { CustomerAddress } from '../../types/account'

export interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (address: Omit<CustomerAddress, 'id'>) => Promise<boolean>
  initialData?: CustomerAddress | null
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
]

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

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!fullName || !phoneNumber || !addressLine1 || !city || !pincode) return

    setIsSaving(true)
    await onSave({
      name,
      fullName,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      countryCode: 'in',
      isDefault,
    })
    setIsSaving(false)
    onClose()
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
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          <div>
            <label htmlFor="modal-addr-name" className="block font-semibold text-stone-700 mb-1">Address Label</label>
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
              <label htmlFor="modal-addr-fullname" className="block font-semibold text-stone-700 mb-1">Full Name *</label>
              <input
                id="modal-addr-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label htmlFor="modal-addr-phone" className="block font-semibold text-stone-700 mb-1">Mobile Number *</label>
              <input
                id="modal-addr-phone"
                type="tel"
                required
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-primary font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor="modal-addr-line1" className="block font-semibold text-stone-700 mb-1">Address Line 1 *</label>
            <input
              id="modal-addr-line1"
              type="text"
              required
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="Flat, House no., Building, Street"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label htmlFor="modal-addr-line2" className="block font-semibold text-stone-700 mb-1">Address Line 2 (Optional)</label>
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
              <label htmlFor="modal-addr-city" className="block font-semibold text-stone-700 mb-1">City *</label>
              <input
                id="modal-addr-city"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bengaluru"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label htmlFor="modal-addr-state" className="block font-semibold text-stone-700 mb-1">State *</label>
              <select
                id="modal-addr-state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-brand-primary cursor-pointer"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="modal-addr-pincode" className="block font-semibold text-stone-700 mb-1">Pincode *</label>
              <input
                id="modal-addr-pincode"
                type="text"
                required
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="560038"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-primary font-mono"
              />
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
              className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-primary text-white hover:bg-brand-primary/95 transition shadow-xs"
            >
              {isSaving ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

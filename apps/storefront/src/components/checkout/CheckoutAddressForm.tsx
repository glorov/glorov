'use client'

import React, { useState, useEffect } from 'react'
import type { DeliveryAddress } from '../../types/checkout'
import { GlorovCustomIcons } from '../common/GlorovIcons'

export interface CheckoutAddressFormProps {
  initialAddress: DeliveryAddress | null
  onChange: (address: DeliveryAddress, isValid: boolean) => void
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]

const DEMO_ADDRESS_PRESETS: Array<{ label: string; address: DeliveryAddress }> = [
  {
    label: 'Home (Pune - 411001)',
    address: {
      fullName: 'Priya Nair',
      phoneNumber: '9876543210',
      email: 'priya.nair@example.com',
      addressLine1: 'Flat 402, Green Meadows, Koregaon Park',
      addressLine2: 'Lane 5, Near Botanical Garden Gate 2',
      landmark: 'Next to Blossom Orchid Cafe',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      countryCode: 'in',
    },
  },
  {
    label: 'Office (Bengaluru - 560001)',
    address: {
      fullName: 'Arjun Mehta',
      phoneNumber: '9123456789',
      email: 'arjun.m@example.com',
      addressLine1: 'Level 4, Flora Tech Park, MG Road',
      addressLine2: 'Indiranagar Central',
      landmark: 'Opposite Metro Station',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      countryCode: 'in',
    },
  },
]

export const CheckoutAddressForm: React.FC<CheckoutAddressFormProps> = ({
  initialAddress,
  onChange,
}) => {
  const [address, setAddress] = useState<DeliveryAddress>(
    initialAddress || DEMO_ADDRESS_PRESETS[0].address
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isServiceable, setIsServiceable] = useState<boolean>(true)

  const validate = (current: DeliveryAddress): boolean => {
    const errs: Record<string, string> = {}

    if (!current.fullName.trim() || current.fullName.trim().length < 3) {
      errs.fullName = 'Enter recipient full name (min 3 chars)'
    }

    const cleanPhone = current.phoneNumber.trim().replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      errs.phoneNumber = 'Must be a 10-digit Indian mobile number'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(current.email.trim())) {
      errs.email = 'Enter a valid email for order receipt'
    }

    if (!current.addressLine1.trim() || current.addressLine1.trim().length < 5) {
      errs.addressLine1 = 'Enter house/flat no. and street address'
    }

    if (!current.city.trim()) {
      errs.city = 'Enter city or district'
    }

    const cleanPin = current.pincode.trim().replace(/\D/g, '')
    if (cleanPin.length !== 6) {
      errs.pincode = 'Must be 6 digits'
    }

    setErrors(errs)
    const valid = Object.keys(errs).length === 0
    setIsServiceable(cleanPin.length === 6)
    return valid
  }

  const handleChange = (field: keyof DeliveryAddress, value: string): void => {
    const next = { ...address, [field]: value }
    setAddress(next)
    const valid = validate(next)
    onChange(next, valid)
  }

  const applyPreset = (preset: DeliveryAddress): void => {
    setAddress(preset)
    const valid = validate(preset)
    onChange(preset, valid)
  }

  useEffect(() => {
    const valid = validate(address)
    onChange(address, valid)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full p-4 sm:p-6 rounded-[18px] bg-white border border-[#E5ECE8] shadow-[0_1.5px_6px_rgba(0,0,0,0.03)] flex flex-col gap-4">
      {/* Header with Quick Preset Selectors */}
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

        {/* Saved Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10.5px] font-semibold text-[#6B7280] hidden sm:inline">Presets:</span>
          {DEMO_ADDRESS_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.address)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                address.pincode === preset.address.pincode
                  ? 'bg-[#0A4C36] text-white border-[#0A4C36]'
                  : 'bg-[#F9FAF8] text-[#4B5563] border-[#E5ECE8] hover:border-[#0A4C36]'
              }`}
            >
              {preset.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Form Fields: Ergonomic Responsive Grid matching Flutter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        {/* Full Name */}
        <div>
          <label className="block text-[12px] font-bold text-[#374151] mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={address.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="Recipient full name"
            className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#D1D5DB] focus:outline-none focus:border-[#0A4C36] focus:ring-1 focus:ring-[#0A4C36] text-[13px] text-[#111827] placeholder:text-[#9CA3AF] transition-colors"
          />
          {errors.fullName && <p className="mt-1 text-[11px] text-rose-500">{errors.fullName}</p>}
        </div>

        {/* Mobile Phone */}
        <div>
          <label className="block text-[12px] font-bold text-[#374151] mb-1">
            10-Digit Mobile Phone <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-[#6B7280] font-semibold select-none text-[12px]">+91</span>
            <input
              type="tel"
              maxLength={10}
              value={address.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value.replace(/\D/g, ''))}
              placeholder="9876543210"
              className="w-full pl-11 pr-3.5 py-2.5 rounded-[10px] border border-[#D1D5DB] focus:outline-none focus:border-[#0A4C36] focus:ring-1 focus:ring-[#0A4C36] text-[13px] text-[#111827] placeholder:text-[#9CA3AF] font-mono transition-colors"
            />
          </div>
          {errors.phoneNumber && <p className="mt-1 text-[11px] text-rose-500">{errors.phoneNumber}</p>}
        </div>

        {/* Email */}
        <div className="sm:col-span-2">
          <label className="block text-[12px] font-bold text-[#374151] mb-1">
            Email for Order Receipt & Updates <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            value={address.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="name@example.com"
            className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#D1D5DB] focus:outline-none focus:border-[#0A4C36] focus:ring-1 focus:ring-[#0A4C36] text-[13px] text-[#111827] placeholder:text-[#9CA3AF] transition-colors"
          />
          {errors.email && <p className="mt-1 text-[11px] text-rose-500">{errors.email}</p>}
        </div>

        {/* Street Address */}
        <div className="sm:col-span-2">
          <label className="block text-[12px] font-bold text-[#374151] mb-1">
            Flat, House No., Building, Street <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={address.addressLine1}
            onChange={(e) => handleChange('addressLine1', e.target.value)}
            placeholder="Flat 402, Green Meadows, Orchid Lane"
            className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#D1D5DB] focus:outline-none focus:border-[#0A4C36] focus:ring-1 focus:ring-[#0A4C36] text-[13px] text-[#111827] placeholder:text-[#9CA3AF] transition-colors"
          />
          {errors.addressLine1 && <p className="mt-1 text-[11px] text-rose-500">{errors.addressLine1}</p>}
        </div>

        {/* PIN Code & City (Compact Row on Mobile) */}
        <div className="grid grid-cols-2 gap-2 sm:col-span-1">
          <div>
            <label className="block text-[12px] font-bold text-[#374151] mb-1">
              PIN Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={address.pincode}
              onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, ''))}
              placeholder="411001"
              className="w-full px-3 py-2.5 rounded-[10px] border border-[#D1D5DB] focus:outline-none focus:border-[#0A4C36] focus:ring-1 focus:ring-[#0A4C36] text-[13px] text-[#111827] font-mono transition-colors"
            />
            {errors.pincode && <p className="mt-1 text-[11px] text-rose-500">{errors.pincode}</p>}
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#374151] mb-1">
              City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={address.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Pune"
              className="w-full px-3 py-2.5 rounded-[10px] border border-[#D1D5DB] focus:outline-none focus:border-[#0A4C36] focus:ring-1 focus:ring-[#0A4C36] text-[13px] text-[#111827] transition-colors"
            />
            {errors.city && <p className="mt-1 text-[11px] text-rose-500">{errors.city}</p>}
          </div>
        </div>

        {/* State & Landmark (Compact Row on Mobile) */}
        <div className="grid grid-cols-2 gap-2 sm:col-span-1">
          <div>
            <label className="block text-[12px] font-bold text-[#374151] mb-1">
              State <span className="text-rose-500">*</span>
            </label>
            <select
              value={address.state}
              onChange={(e) => handleChange('state', e.target.value)}
              className="w-full px-2.5 py-2.5 rounded-[10px] border border-[#D1D5DB] bg-white focus:outline-none focus:border-[#0A4C36] focus:ring-1 focus:ring-[#0A4C36] text-[12.5px] text-[#111827] cursor-pointer"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#374151] mb-1">
              Landmark <span className="text-[#9CA3AF] text-[10px] font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={address.landmark || ''}
              onChange={(e) => handleChange('landmark', e.target.value)}
              placeholder="Near Garden"
              className="w-full px-3 py-2.5 rounded-[10px] border border-[#D1D5DB] focus:outline-none focus:border-[#0A4C36] focus:ring-1 focus:ring-[#0A4C36] text-[12.5px] text-[#111827] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Pincode Serviceability Live Badge matching Flutter `GlorovDeliveryAvailabilityAlert` */}
      {isServiceable && address.pincode.length === 6 && (
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

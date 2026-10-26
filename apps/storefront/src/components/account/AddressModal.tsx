'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  addCustomerAddressAction,
  updateCustomerAddressAction,
} from '@/lib/customer-actions'
import type { StoreCustomerAddress, StoreCustomer } from '@/lib/customer'
import { Loader2 } from 'lucide-react'

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

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedCustomer: StoreCustomer) => void
  addressToEdit?: StoreCustomerAddress | null
}

export function AddressModal({
  isOpen,
  onClose,
  onSuccess,
  addressToEdit,
}: AddressModalProps) {
  const isEditing = Boolean(addressToEdit)

  const [addressName, setAddressName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('Maharashtra')
  const [postalCode, setPostalCode] = useState('')
  const [phone, setPhone] = useState('')
  const [isDefaultShipping, setIsDefaultShipping] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (addressToEdit) {
      setAddressName(addressToEdit.address_name || '')
      setFirstName(addressToEdit.first_name || '')
      setLastName(addressToEdit.last_name || '')
      setAddress1(addressToEdit.address_1 || '')
      setAddress2(addressToEdit.address_2 || '')
      setCity(addressToEdit.city || '')
      setProvince(addressToEdit.province || 'Maharashtra')
      setPostalCode(addressToEdit.postal_code || '')
      setPhone(addressToEdit.phone || '')
      setIsDefaultShipping(Boolean(addressToEdit.is_default_shipping))
    } else {
      setAddressName('')
      setFirstName('')
      setLastName('')
      setAddress1('')
      setAddress2('')
      setCity('')
      setProvince('Maharashtra')
      setPostalCode('')
      setPhone('')
      setIsDefaultShipping(false)
    }
    setErrorMessage(null)
  }, [addressToEdit, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Quick client-side validations
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('First and last names are required')
      return
    }
    if (!address1.trim() || address1.trim().length < 5) {
      setErrorMessage('Enter complete house/street address (at least 5 characters)')
      return
    }
    if (!city.trim() || !province) {
      setErrorMessage('City and State are required')
      return
    }
    if (!/^[1-9][0-9]{5}$/.test(postalCode.trim())) {
      setErrorMessage('Enter a valid 6-digit Indian PIN code (e.g. 560001, 411001)')
      return
    }
    if (!/^[6-9][0-9]{9}$/.test(phone.trim())) {
      setErrorMessage('Enter a valid 10-digit Indian mobile number')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        address_name: addressName.trim() || undefined,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        address_1: address1.trim(),
        address_2: address2.trim() || undefined,
        city: city.trim(),
        province: province.trim(),
        postal_code: postalCode.trim(),
        phone: phone.trim(),
        country_code: 'in' as const,
        is_default_shipping: isDefaultShipping,
      }

      if (isEditing && addressToEdit) {
        const res = await updateCustomerAddressAction(addressToEdit.id, payload)
        if (!res.success || !res.customer) {
          setErrorMessage(res.error || 'Failed to update address')
          return
        }
        onSuccess(res.customer)
        onClose()
      } else {
        const res = await addCustomerAddressAction(payload)
        if (!res.success || !res.customer) {
          setErrorMessage(res.error || 'Failed to add address')
          return
        }
        onSuccess(res.customer)
        onClose()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving address'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Delivery Address' : 'Add New Delivery Address'}
          </DialogTitle>
          <DialogDescription>
            Addresses are saved to your customer account for faster checkout across India.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Address Label (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. Home, Office, Nursery"
              value={addressName}
              onChange={(e) => setAddressName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                First Name *
              </label>
              <Input
                required
                type="text"
                placeholder="Aarav"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Last Name *
              </label>
              <Input
                required
                type="text"
                placeholder="Sharma"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Flat, House No., Building, Street *
            </label>
            <Input
              required
              type="text"
              placeholder="Flat 402, Green Meadows, MG Road"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Area, Landmark, Sector (Optional)
            </label>
            <Input
              type="text"
              placeholder="Near Botanical Garden"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                City *
              </label>
              <Input
                required
                type="text"
                placeholder="Bengaluru"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                State / UT *
              </label>
              <select
                required
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                PIN Code * (6 digits)
              </label>
              <Input
                required
                type="text"
                maxLength={6}
                placeholder="560001"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Mobile Number * (10 digits)
              </label>
              <Input
                required
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefaultShipping"
              checked={isDefaultShipping}
              onChange={(e) => setIsDefaultShipping(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-botanical-700 focus:ring-botanical-600"
            />
            <label
              htmlFor="isDefaultShipping"
              className="text-xs text-foreground cursor-pointer select-none"
            >
              Set as default shipping address
            </label>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-botanical-700 hover:bg-botanical-800 text-white"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add Address'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  addCustomerAddressAction,
  updateCustomerAddressAction,
} from '@/lib/customer-actions'
import type { StoreCustomerAddress, StoreCustomer } from '@/lib/customer'
import { Loader2 } from 'lucide-react'
import styles from './AddressModal.module.css'

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
      <DialogContent className={styles.modalContent}>
        <DialogHeader className={styles.modalHeader}>
          <DialogTitle className={styles.modalTitle}>
            {isEditing ? 'Edit Delivery Address' : 'Add New Delivery Address'}
          </DialogTitle>
          <DialogDescription className={styles.modalDescription}>
            Addresses are saved to your customer account for faster checkout across India.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div role="alert" aria-live="polite" className={styles.alertError}>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} aria-label="Customer address form">
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="modal-address-name">
              Address Label (Optional)
            </label>
            <input
              id="modal-address-name"
              type="text"
              placeholder="e.g. Home, Office, Farmhouse"
              value={addressName}
              onChange={(e) => setAddressName(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="modal-first-name">
                First Name *
              </label>
              <input
                id="modal-first-name"
                required
                aria-required="true"
                autoComplete="given-name"
                type="text"
                placeholder="Aarav"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="modal-last-name">
                Last Name *
              </label>
              <input
                id="modal-last-name"
                required
                aria-required="true"
                autoComplete="family-name"
                type="text"
                placeholder="Sharma"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="modal-address1">
              Flat, House No., Building, Street *
            </label>
            <input
              id="modal-address1"
              required
              aria-required="true"
              autoComplete="street-address"
              type="text"
              placeholder="Flat 402, Green Meadows, MG Road"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="modal-address2">
              Area, Landmark, Sector (Optional)
            </label>
            <input
              id="modal-address2"
              type="text"
              placeholder="Near Botanical Garden / Metro Pillar 42"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="modal-city">
                City / District *
              </label>
              <input
                id="modal-city"
                required
                aria-required="true"
                autoComplete="address-level2"
                type="text"
                placeholder="Bengaluru"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="modal-province">
                State / UT *
              </label>
              <select
                id="modal-province"
                required
                aria-required="true"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className={styles.select}
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="modal-postal-code">
                PIN Code * (6 digits)
              </label>
              <input
                id="modal-postal-code"
                required
                aria-required="true"
                autoComplete="postal-code"
                type="text"
                maxLength={6}
                placeholder="560001"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="modal-phone">
                Mobile Number * (10 digits)
              </label>
              <input
                id="modal-phone"
                required
                aria-required="true"
                autoComplete="tel"
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.checkboxRow}>
            <input
              type="checkbox"
              id="isDefaultShipping"
              checked={isDefaultShipping}
              onChange={(e) => setIsDefaultShipping(e.target.checked)}
              className={styles.checkboxInput}
            />
            <label htmlFor="isDefaultShipping" className={styles.checkboxLabel}>
              Set as default shipping address
            </label>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.saveBtn}
            >
              {isSubmitting && <Loader2 size={16} className={styles.spinner} aria-hidden="true" />}
              <span>{isEditing ? 'Save Changes' : 'Add Address'}</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin,
  PlusCircle,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react'

import {
  getCurrentCustomerAction,
  deleteCustomerAddressAction,
} from '@/lib/customer-actions'
import type { StoreCustomer, StoreCustomerAddress } from '@/lib/customer'
import { AccountNav } from '@/components/account/AccountNav'
import { AddressModal } from '@/components/account/AddressModal'
import styles from './CustomerAddresses.module.css'

export default function AddressesPage() {
  const router = useRouter()
  const [customer, setCustomer] = useState<StoreCustomer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [addressToEdit, setAddressToEdit] = useState<StoreCustomerAddress | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadCustomer = async () => {
    setIsLoading(true)
    try {
      const res = await getCurrentCustomerAction()
      if (!res.success || !res.customer) {
        router.push('/account/login')
        return
      }
      setCustomer(res.customer)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCustomer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleOpenAdd = () => {
    setAddressToEdit(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (addr: StoreCustomerAddress) => {
    setAddressToEdit(addr)
    setModalOpen(true)
  }

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to remove this delivery address?')) {
      return
    }

    setDeletingId(addressId)
    setStatusMessage(null)
    try {
      const res = await deleteCustomerAddressAction(addressId)
      if (!res.success) {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to delete address' })
        return
      }
      setStatusMessage({ type: 'success', text: 'Address was removed successfully' })
      await loadCustomer()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error removing address'
      setStatusMessage({ type: 'error', text: msg })
    } finally {
      setDeletingId(null)
    }
  }

  const handleSuccess = (updatedCustomer: StoreCustomer) => {
    setCustomer(updatedCustomer)
    setStatusMessage({
      type: 'success',
      text: addressToEdit ? 'Address updated successfully' : 'New address added successfully',
    })
  }

  if (isLoading) {
    return (
      <div className={styles.spinnerContainer} aria-label="Loading saved addresses">
        <Loader2 size={32} color="#0a4c36" className={styles.spinner} />
      </div>
    )
  }

  const addresses = customer?.addresses || []

  return (
    <div className={styles.container}>
      {/* Mobile Back Bar */}
      <div className={styles.mobileTopBar}>
        <Link href="/account" className={styles.mobileBackBtn} aria-label="Back to Account Dashboard">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Account</span>
        </Link>
      </div>

      <header className={styles.headerArea}>
        <div>
          <h1 className={styles.title}>Saved Addresses</h1>
          <p className={styles.subtitle}>
            Manage multiple delivery destinations for botanical nursery direct shipping across India.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className={styles.addBtn}
          aria-label="Add new delivery address"
        >
          <PlusCircle size={16} aria-hidden="true" />
          <span>Add New Address</span>
        </button>
      </header>

      <div className={styles.addressesLayout}>
        <AccountNav />

        <main className={styles.mainContent} aria-label="Customer saved addresses list">
          {statusMessage && (
            <div
              role="alert"
              aria-live="polite"
              className={statusMessage.type === 'success' ? styles.statusAlertSuccess : styles.statusAlertError}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 size={16} aria-hidden="true" />
              ) : (
                <AlertCircle size={16} aria-hidden="true" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {addresses.length === 0 ? (
            <div className={styles.emptyStateCard}>
              <MapPin className={styles.emptyIcon} aria-hidden="true" />
              <h2 className={styles.emptyTitle}>No saved addresses</h2>
              <p className={styles.emptyDesc}>
                Add your home or office address to speed up checkout for fresh plant and seed deliveries.
              </p>
              <button
                type="button"
                onClick={handleOpenAdd}
                className={styles.addBtn}
                style={{ margin: '0 auto', display: 'inline-flex' }}
              >
                <PlusCircle size={16} aria-hidden="true" />
                <span>Add Your First Address</span>
              </button>
            </div>
          ) : (
            <div className={styles.addressesGrid}>
              {addresses.map((addr) => {
                const isDefault = addr.is_default_shipping || addr.is_default_billing

                return (
                  <article
                    key={addr.id}
                    className={`${styles.addressCard} ${isDefault ? styles.addressCardDefault : ''}`}
                  >
                    <div className={styles.cardTop}>
                      {isDefault && (
                        <div className={styles.badgesGroup}>
                          {addr.is_default_shipping && (
                            <span className={styles.badgeDefault}>Default Shipping</span>
                          )}
                          {addr.is_default_billing && (
                            <span className={styles.badgeDefault} style={{ backgroundColor: '#1e293b' }}>
                              Default Billing
                            </span>
                          )}
                        </div>
                      )}

                      <h2 className={styles.recipientName}>
                        {addr.first_name} {addr.last_name}
                      </h2>

                      <p className={styles.addressLines}>
                        {addr.address_1}
                        {addr.address_2 && `, ${addr.address_2}`}
                        <br />
                        {addr.city}, {addr.province} — <strong>{addr.postal_code}</strong>
                        <br />
                        India
                      </p>

                      <p className={styles.phoneLine}>
                        Mobile: +91 {addr.phone || 'None provided'}
                      </p>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(addr)}
                        className={styles.actionBtn}
                        aria-label={`Edit address for ${addr.first_name} ${addr.last_name}`}
                      >
                        <Pencil size={13} aria-hidden="true" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === addr.id}
                        onClick={() => handleDelete(addr.id)}
                        className={styles.deleteBtn}
                        aria-label={`Delete address for ${addr.first_name} ${addr.last_name}`}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                        <span>{deletingId === addr.id ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </main>
      </div>

      <AddressModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        addressToEdit={addressToEdit}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

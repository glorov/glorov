'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCustomerAuth } from '../../../context/CustomerAuthContext'
import { useToast } from '../../../context/StorefrontContext'
import { Modal } from '../../../components/ui/Modal'
import { AddressCard } from '../../../components/account/AddressCard'
import { AddressModal } from '../../../components/account/AddressModal'
import { reportError } from '../../../lib/error-reporter'
import type { CustomerAddress } from '../../../types/account'

export default function AddressesPage() {
  const { customer, addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } =
    useCustomerAuth()
  const { showToast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!customer) {
    return (
      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-stone-200/90 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#E8F5E9] border-1.5 border-[#86EFAC] text-[#1B4332] flex items-center justify-center">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-900 font-serif">Sign In to Manage Addresses</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
            Please sign in to save verified shipping locations for botanical delivery routes.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/auth/login?redirect=/account/addresses"
            className="px-5 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#163829] transition"
          >
            Sign In to GLOROV
          </Link>
          <Link
            href="/auth/signup?redirect=/account/addresses"
            className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
          >
            Create Account
          </Link>
        </div>
      </div>
    )
  }

  const handleOpenAdd = () => {
    setEditingAddress(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (addr: CustomerAddress) => {
    setEditingAddress(addr)
    setIsModalOpen(true)
  }

  const handleSaveAddress = async (data: Omit<CustomerAddress, 'id'>): Promise<boolean> => {
    try {
      if (editingAddress) {
        const ok = await updateAddress(editingAddress.id, data)
        if (ok) {
          showToast('success', 'Delivery address updated successfully.', {
            title: 'Address Updated',
          })
        } else {
          showToast('error', 'Unable to update address. Please verify the information.', {
            title: 'Update Failed',
          })
        }
        return ok
      } else {
        const ok = await addAddress(data)
        if (ok) {
          showToast('success', 'New delivery address saved to your account.', {
            title: 'Address Saved',
          })
        } else {
          showToast('error', 'Unable to save address. Please verify the information.', {
            title: 'Save Failed',
          })
        }
        return ok
      }
    } catch (err: unknown) {
      reportError(err, {
        page: '/account/addresses',
        action: editingAddress ? 'update-address' : 'add-address',
      })
      showToast('error', 'Unable to process address request. Please try again.')
      return false
    }
  }

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const ok = await setDefaultAddress(id)
      if (ok) {
        showToast('success', 'Default shipping address has been updated.', {
          title: 'Default Address Set',
        })
      } else {
        showToast('error', 'Unable to set default address. Please try again.', {
          title: 'Update Failed',
        })
      }
    } catch (err: unknown) {
      reportError(err, { page: '/account/addresses', action: 'set-default-address', addressId: id })
      showToast('error', 'Unable to set default address. Please try again.')
    }
  }

  const handleDeleteAddress = (id: string) => {
    setDeleteTargetId(id)
  }

  const targetAddress = addresses.find((a) => a.id === deleteTargetId)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-stone-900 font-serif">Delivery Addresses</h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your verified shipping locations for botanical delivery routes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address Grid */}
      {addresses.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-stone-200/90 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <p className="text-xs font-bold text-stone-700">No delivery addresses saved</p>
          <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
            Add your residential or workplace address for smooth, climate-safe plant deliveries.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold"
          >
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteAddress}
              onSetDefault={handleSetDefaultAddress}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <AddressModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveAddress}
          initialData={editingAddress}
        />
      )}

      {/* Themed Confirmation Modal for Address Removal */}
      <Modal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        title="Remove Delivery Address"
        maxWidth="sm"
      >
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50/70 border border-rose-200/60 text-xs">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-stone-900">
                Remove {targetAddress?.name || 'this address'}?
              </p>
              <p className="text-[11px] text-stone-500">
                {targetAddress?.fullName} &bull; {targetAddress?.city}, {targetAddress?.state}
              </p>
            </div>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Are you sure you want to remove this delivery location? Any future plant and seed orders shipped here will require re-entering these details.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDeleteTargetId(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
            >
              Keep Address
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={async () => {
                if (!deleteTargetId) return
                setIsDeleting(true)
                try {
                  const ok = await deleteAddress(deleteTargetId)
                  if (ok) {
                    showToast('info', 'Delivery address removed successfully.', {
                      title: 'Address Removed',
                    })
                  } else {
                    showToast('error', 'Unable to remove address.', { title: 'Delete Failed' })
                  }
                } catch (err: unknown) {
                  reportError(err, { page: '/account/addresses', action: 'delete-address', addressId: deleteTargetId })
                  showToast('error', 'Unable to remove address.')
                } finally {
                  setIsDeleting(false)
                  setDeleteTargetId(null)
                }
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {isDeleting ? 'Removing...' : 'Delete Address'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

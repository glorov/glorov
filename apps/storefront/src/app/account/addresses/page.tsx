'use client'

import React, { useState } from 'react'
import { useCustomerAuth } from '../../../context/CustomerAuthContext'
import { AddressCard } from '../../../components/account/AddressCard'
import { AddressModal } from '../../../components/account/AddressModal'
import type { CustomerAddress } from '../../../types/account'

export default function AddressesPage() {
  const { addresses, addAddress, updateAddress, deleteAddress } = useCustomerAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null)

  const handleOpenAdd = () => {
    setEditingAddress(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (addr: CustomerAddress) => {
    setEditingAddress(addr)
    setIsModalOpen(true)
  }

  const handleSaveAddress = async (data: Omit<CustomerAddress, 'id'>): Promise<boolean> => {
    if (editingAddress) {
      return await updateAddress(editingAddress.id, data)
    } else {
      return await addAddress(data)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (confirm('Are you sure you want to remove this delivery address?')) {
      await deleteAddress(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-stone-900 font-serif">Delivery Addresses</h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your verified shipping locations for botanical delivery routes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-auto"
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
    </div>
  )
}

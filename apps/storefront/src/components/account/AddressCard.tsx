'use client'

import React from 'react'
import type { CustomerAddress } from '../../types/account'

export interface AddressCardProps {
  address: CustomerAddress
  onEdit: (address: CustomerAddress) => void
  onDelete: (id: string) => void
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between gap-3 text-xs">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="font-bold text-stone-900 text-xs truncate">{address.name}</span>
          {address.isDefault && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-900">
              Default
            </span>
          )}
        </div>

        <p className="font-semibold text-stone-800">{address.fullName}</p>
        <p className="text-stone-600 mt-0.5 leading-snug">{address.addressLine1}</p>
        {address.addressLine2 && <p className="text-stone-500 leading-snug">{address.addressLine2}</p>}
        <p className="text-stone-700 mt-1">
          {address.city}, {address.state} — <span className="font-mono font-semibold">{address.pincode}</span>
        </p>
        <p className="text-stone-500 mt-0.5">Phone: +91 {address.phoneNumber}</p>
      </div>

      <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => onEdit(address)}
          className="px-3 py-1 rounded-lg text-xs font-semibold text-stone-600 hover:text-brand-primary hover:bg-stone-50 transition"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(address.id)}
          className="px-3 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

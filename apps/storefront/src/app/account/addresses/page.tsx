'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin,
  PlusCircle,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'

import {
  getCurrentCustomerAction,
  deleteCustomerAddressAction,
} from '@/lib/customer-actions'
import type { StoreCustomer, StoreCustomerAddress } from '@/lib/customer'
import { AccountNav } from '@/components/account/AccountNav'
import { AddressModal } from '@/components/account/AddressModal'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-botanical-700" />
      </div>
    )
  }

  const addresses = customer?.addresses || []

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 max-w-6xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Saved Delivery Addresses
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your Indian delivery addresses for fast 1-click checkout.
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-botanical-700 hover:bg-botanical-800 text-white shrink-0"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Address
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <AccountNav />

        <div className="flex-1 w-full space-y-6">
          {statusMessage && (
            <div
              className={`p-3 text-xs rounded-lg border flex items-start gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-destructive/10 text-destructive border-destructive/20'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {addresses.length === 0 ? (
            <Card className="text-center py-12 px-4">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <h3 className="text-base font-semibold text-foreground mb-1">
                No delivery addresses saved yet
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                Add your home or garden nursery address for quick and accurate postal delivery.
              </p>
              <Button
                onClick={handleOpenAdd}
                className="bg-botanical-700 hover:bg-botanical-800 text-white"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Address
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => {
                const isDefault = Boolean(addr.is_default_shipping)

                return (
                  <Card
                    key={addr.id}
                    className={`flex flex-col justify-between transition-all ${
                      isDefault ? 'border-botanical-400 bg-earth-50/40 shadow-sm' : ''
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-botanical-700 shrink-0" />
                          <CardTitle className="text-sm font-bold">
                            {addr.address_name || `${addr.first_name}'s Address`}
                          </CardTitle>
                        </div>
                        {isDefault && (
                          <Badge
                            variant="secondary"
                            className="bg-botanical-100 text-botanical-800 border-botanical-200 text-[10px]"
                          >
                            Default Shipping
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="text-xs text-muted-foreground space-y-1 pb-4">
                      <p className="font-semibold text-foreground text-sm">
                        {addr.first_name} {addr.last_name}
                      </p>
                      <p>{addr.address_1}</p>
                      {addr.address_2 && <p>{addr.address_2}</p>}
                      <p>
                        {addr.city}, {addr.province} -{' '}
                        <span className="font-semibold text-foreground">{addr.postal_code}</span>
                      </p>
                      <p className="text-muted-foreground font-mono">
                        Phone: {addr.phone || 'None provided'}
                      </p>
                    </CardContent>

                    <CardFooter className="pt-2 border-t flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(addr)}
                        className="h-8 text-xs text-foreground/80 hover:text-botanical-700"
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deletingId === addr.id}
                        onClick={() => handleDelete(addr.id)}
                        className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        {deletingId === addr.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Delete
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <AddressModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        addressToEdit={addressToEdit}
      />
    </div>
  )
}

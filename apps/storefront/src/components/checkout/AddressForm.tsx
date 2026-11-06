'use client'

import React from 'react'
import {
  CheckoutAddressForm,
  CheckoutAddressFormProps,
} from './CheckoutAddressForm'

export const AddressForm: React.FC<CheckoutAddressFormProps> = (props) => {
  return <CheckoutAddressForm {...props} />
}

export type AddressFormProps = CheckoutAddressFormProps
export default AddressForm

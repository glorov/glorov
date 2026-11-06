'use client'

import React from 'react'
import {
  CheckoutOrderSummary,
  CheckoutOrderSummaryProps,
} from './CheckoutOrderSummary'

export const CheckoutSummary: React.FC<CheckoutOrderSummaryProps> = (props) => {
  return <CheckoutOrderSummary {...props} />
}

export type CheckoutSummaryProps = CheckoutOrderSummaryProps
export default CheckoutSummary

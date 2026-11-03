import React from 'react'
import { BotanicalLoadingState } from '../components/feedback/BotanicalLoadingState'

/**
 * Global root loading boundary for Next.js App Router streaming.
 * Matches Flutter Web's botanical loading state.
 */
export default function Loading() {
  return <BotanicalLoadingState fullScreen />
}

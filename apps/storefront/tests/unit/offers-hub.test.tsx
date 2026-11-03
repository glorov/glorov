import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { OffersHubClient } from '../../src/components/offers/OffersHubClient'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/offers',
}))

describe('OffersHubClient', () => {
  it('renders without throwing', () => {
    const { container } = render(<OffersHubClient initialOffers={[]} />)
    expect(container).toBeDefined()
  })
})

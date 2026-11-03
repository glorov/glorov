import type { Metadata } from 'next'
import { OffersHubClient } from '../../components/offers/OffersHubClient'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from '../../lib/constants'
import { RawOfferLike } from '../../lib/roadmap-utils'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Botanical Offers & Milestones | GLOROV',
  description:
    'Explore active GLOROV discount codes, garden milestone rewards, and seasonal botanical offers.',
  alternates: {
    canonical: '/offers',
  },
}

async function getInitialOffers(): Promise<RawOfferLike[]> {
  try {
    const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
    const res = await fetch(`${baseUrl}/store/offers`, {
      headers: {
        'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.offers)) {
        return data.offers
      }
    }
    return []
  } catch {
    return []
  }
}

export default async function OffersPage() {
  try {
    const initialOffers = await getInitialOffers()
    return <OffersHubClient initialOffers={initialOffers} />
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('CRITICAL OFFERS PAGE ERROR:', message)
    return <div style={{ padding: 40, color: 'red' }}>Error: {message}</div>
  }
}

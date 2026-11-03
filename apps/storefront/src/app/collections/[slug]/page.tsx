import { redirect } from 'next/navigation'

interface CollectionPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return [
    { slug: 'seeds' },
    { slug: 'live-plants' },
    { slug: 'planters' },
    { slug: 'plant-care' },
    { slug: 'flowering' },
    { slug: 'vegetables' },
  ]
}

export default async function CollectionRedirectPage({ params }: CollectionPageProps) {
  const { slug } = await params
  redirect(`/categories/${slug}`)
}

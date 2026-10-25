export * from './botanical'
export * from './pincode'

export interface GlorovProductPreview {
  id: string
  title: string
  handle: string
  thumbnail?: string
  description?: string
  priceINR: number
  isPerishable: boolean
  category: 'seeds' | 'plants' | 'planters' | 'care'
  botanicalName?: string
  tag?: string
}

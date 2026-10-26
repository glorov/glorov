export * from './botanical'
export * from './catalog'
export * from './pincode'
export * from './validations'

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

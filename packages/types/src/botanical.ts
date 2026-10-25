export type PlantSunlight = 'full_sun' | 'partial_shade' | 'low_light'
export type PlantWatering = 'daily' | 'alternate_days' | 'weekly' | 'dry'
export type SowingSeason = 'kharif' | 'rabi' | 'zaid' | 'all_season'
export type PlantDifficulty = 'beginner' | 'intermediate' | 'expert'
export type BotanicalCategoryType = 'seed' | 'live_plant' | 'potting_mix' | 'planter' | 'tool'

export interface BotanicalAttributes {
  id?: string
  product_id?: string
  botanical_name?: string
  category_type: BotanicalCategoryType
  sunlight?: PlantSunlight
  watering?: PlantWatering
  season?: SowingSeason
  difficulty?: PlantDifficulty
  germination_days?: number
  is_perishable: boolean
}

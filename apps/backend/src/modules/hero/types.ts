export interface HeroTrustPill {
  icon: string;
  text: string;
}

export interface HeroConfig {
  id: string;
  tag: string;
  headline: string;
  description: string;
  cta_text: string;
  cta_route: string;
  secondary_cta_text: string;
  secondary_cta_route: string;
  desktop_image_url: string;
  mobile_image_url: string;
  plant_tag: string;
  plant_name: string;
  plant_route?: string;
  trust_pills: HeroTrustPill[];
  is_active: boolean;
  updated_at: string;
}

export interface UpdateHeroConfigInput {
  tag?: string;
  headline?: string;
  description?: string;
  cta_text?: string;
  cta_route?: string;
  secondary_cta_text?: string;
  secondary_cta_route?: string;
  desktop_image_url?: string;
  mobile_image_url?: string;
  plant_tag?: string;
  plant_name?: string;
  plant_route?: string;
  trust_pills?: HeroTrustPill[];
  is_active?: boolean;
}

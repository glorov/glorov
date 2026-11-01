export type TrustBadgeIconKey =
  | "fertilized-soil"
  | "potted-plant"
  | "replacement-arrows"
  | "support-chat"
  | "support-hand"
  | "organic-shield"
  | "transit-truck"
  | "eco-leaf"
  | "water-drop"
  | "custom";

export interface TrustBadgeItem {
  id: string;
  title: string;
  subtitle?: string;
  icon_key: TrustBadgeIconKey;
  custom_icon_svg?: string;
  cta_route?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrustSectionSettings {
  bg_color: string;
  text_color: string;
  icon_bg_color: string;
  icon_color: string;
  divider_color: string;
  border_radius: number;
  is_visible: boolean;
  section_title?: string;
  section_subtitle?: string;
  updated_at: string;
}

export interface CreateTrustBadgeInput {
  title: string;
  subtitle?: string;
  icon_key?: TrustBadgeIconKey;
  custom_icon_svg?: string;
  cta_route?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateTrustBadgeInput {
  title?: string;
  subtitle?: string;
  icon_key?: TrustBadgeIconKey;
  custom_icon_svg?: string;
  cta_route?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateTrustSectionSettingsInput {
  bg_color?: string;
  text_color?: string;
  icon_bg_color?: string;
  icon_color?: string;
  divider_color?: string;
  border_radius?: number;
  is_visible?: boolean;
  section_title?: string;
  section_subtitle?: string;
}

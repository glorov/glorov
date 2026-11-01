export interface AnnouncementItem {
  id: string;
  text: string;
  highlight_text?: string;
  icon?: string; // e.g. "local_shipping" | "bolt" | "spa" | "percent" | "verified" | "shield"
  link_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementBarConfig {
  is_enabled: boolean;
  speed_seconds: number; // Duration in seconds for a complete scroll pass (e.g. 25-45s)
  bg_color: string; // e.g. "#1B4332" (Forest Green) or "#7A1C2E" (Festive Wine)
  text_color: string; // e.g. "#FFFFFF" or "#D8F3DC"
  highlight_color: string; // e.g. "#FFD51F" (Gold badge)
  pause_on_hover: boolean;
  updated_at: string;
}

export interface AnnouncementStoreResponse {
  config: AnnouncementBarConfig;
  items: AnnouncementItem[];
}

export interface CreateAnnouncementInput {
  text: string;
  highlight_text?: string;
  icon?: string;
  link_url?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateAnnouncementInput {
  text?: string;
  highlight_text?: string;
  icon?: string;
  link_url?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateAnnouncementConfigInput {
  is_enabled?: boolean;
  speed_seconds?: number;
  bg_color?: string;
  text_color?: string;
  highlight_color?: string;
  pause_on_hover?: boolean;
}

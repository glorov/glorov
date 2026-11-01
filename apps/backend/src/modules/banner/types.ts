export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  desktop_image_url: string;
  mobile_image_url: string;
  cta_text: string;
  cta_route: string;
  cta_arguments?: Record<string, unknown>;
  display_order: number;
  is_active: boolean;
  bg_color?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBannerInput {
  title: string;
  subtitle?: string;
  tag?: string;
  desktop_image_url: string;
  mobile_image_url?: string;
  cta_text?: string;
  cta_route?: string;
  cta_arguments?: Record<string, unknown>;
  display_order?: number;
  is_active?: boolean;
  bg_color?: string;
}

export interface UpdateBannerInput {
  title?: string;
  subtitle?: string;
  tag?: string;
  desktop_image_url?: string;
  mobile_image_url?: string;
  cta_text?: string;
  cta_route?: string;
  cta_arguments?: Record<string, unknown>;
  display_order?: number;
  is_active?: boolean;
  bg_color?: string;
}

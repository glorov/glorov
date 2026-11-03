export type OfferCategory =
  | "welcome"
  | "sitewide"
  | "seeds"
  | "plants"
  | "live-plants"
  | "planters"
  | "plant-care"
  | "bank"
  | string;
export type DiscountType = "percentage" | "fixed" | "free_shipping";
export type OfferIconType =
  | "card_giftcard"
  | "local_offer"
  | "percent"
  | "spa"
  | "local_shipping"
  | "auto_awesome";

export interface ValidateCouponCartItem {
  productId?: string;
  variantId?: string;
  title?: string;
  category?: string;
  price: number; // Unit price in INR
  quantity: number;
}

export interface Offer {
  id: string;
  code: string;
  title: string;
  tag: string;
  description: string;
  discount_badge: string;
  discount_type: DiscountType;
  discount_value: number;
  min_spend?: number;
  min_spend_text?: string;
  expiry_text?: string;
  terms?: string;
  category: OfferCategory;
  applicable_categories?: string[]; // Specific category restrictions (e.g. ['seeds'], ['live-plants'])
  max_discount?: number; // Optional cap on total discount in INR
  bg_color?: string;
  text_color?: string;
  accent_color?: string;
  icon: OfferIconType;
  is_highlighted: boolean; // Displayed as primary homepage welcome offer banner
  is_active: boolean; // Published and active on storefront
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOfferInput {
  code: string;
  title: string;
  tag?: string;
  description: string;
  discount_badge?: string;
  discount_type?: DiscountType;
  discount_value?: number;
  min_spend?: number;
  min_spend_text?: string;
  expiry_text?: string;
  terms?: string;
  category?: OfferCategory;
  applicable_categories?: string[];
  max_discount?: number;
  bg_color?: string;
  text_color?: string;
  accent_color?: string;
  icon?: OfferIconType;
  is_highlighted?: boolean;
  is_active?: boolean;
  display_order?: number;
}

export interface UpdateOfferInput {
  code?: string;
  title?: string;
  tag?: string;
  description?: string;
  discount_badge?: string;
  discount_type?: DiscountType;
  discount_value?: number;
  min_spend?: number;
  min_spend_text?: string;
  expiry_text?: string;
  terms?: string;
  category?: OfferCategory;
  applicable_categories?: string[];
  max_discount?: number;
  bg_color?: string;
  text_color?: string;
  accent_color?: string;
  icon?: OfferIconType;
  is_highlighted?: boolean;
  is_active?: boolean;
  display_order?: number;
}

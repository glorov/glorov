import fs from "node:fs";
import path from "node:path";
import { Offer, CreateOfferInput, UpdateOfferInput } from "./types";

const DATA_DIR = path.resolve(process.cwd(), "data");
const OFFERS_FILE = path.join(DATA_DIR, "offers.json");

export interface ValidateCouponResult {
  valid: boolean;
  offer?: Offer;
  discount_amount: number;
  discount_percent?: number;
  error?: string;
  min_spend?: number;
  needed?: number;
  next_tier?: {
    needed: number;
    code: string;
    discount_text: string;
    target_spend: number;
  };
}

export const DEFAULT_OFFERS: Offer[] = [
  {
    id: "offer_winter_sale_20",
    code: "WINTER20",
    title: "Winter Sowing & Planting Fest",
    tag: "WINTER BOTANICAL SALE",
    description: "Enjoy Flat 20% OFF on all cold-hardy winter seeds, flowering blooms, and indoor greenery. Use code WINTER20 at checkout.",
    discount_badge: "20% OFF",
    discount_type: "percentage",
    discount_value: 20,
    min_spend: 799,
    min_spend_text: "Min Order: ₹799",
    expiry_text: "Winter Planting Special (November Event)",
    terms: "Applicable on all seeds, indoor plants, and winter care supplies",
    category: "sitewide",
    bg_color: "#EAF2F8",
    text_color: "#143528",
    accent_color: "#1B5E20",
    icon: "spa",
    is_highlighted: true,
    is_active: true,
    display_order: 1,
    created_at: new Date("2026-11-01T00:00:00Z").toISOString(),
    updated_at: new Date("2026-11-01T00:00:00Z").toISOString(),
  },
  {
    id: "offer_welcome_glorov10",
    code: "GLOROV10",
    title: "Special Welcome Offer",
    tag: "SPECIAL WELCOME OFFER",
    description: "Use code GLOROV10 at checkout for an extra 10% off your entire botanical order.",
    discount_badge: "10% OFF",
    discount_type: "percentage",
    discount_value: 10,
    min_spend: 499,
    min_spend_text: "Min Order: ₹499",
    expiry_text: "Valid on first botanical order",
    terms: "Applicable on seeds and live plants",
    category: "welcome",
    bg_color: "#EAF4EE",
    text_color: "#1B3B2B",
    accent_color: "#1E3D2F",
    icon: "card_giftcard",
    is_highlighted: false,
    is_active: true,
    display_order: 2,
    created_at: new Date("2026-10-30T00:00:00Z").toISOString(),
    updated_at: new Date("2026-10-30T00:00:00Z").toISOString(),
  },
  {
    id: "offer_diwali_10",
    code: "DIWALI10",
    title: "10% OFF",
    tag: "FESTIVE BOTANICAL OFFER",
    description: "10% OFF On orders above ₹999",
    discount_badge: "10% OFF",
    discount_type: "percentage",
    discount_value: 10,
    min_spend: 999,
    min_spend_text: "On orders above ₹999",
    terms: "Not applicable on hamper products",
    expiry_text: "Festive limited offer",
    category: "sitewide",
    bg_color: "#EAF4EE",
    text_color: "#1B3B2B",
    accent_color: "#93113A",
    icon: "percent",
    is_highlighted: false,
    is_active: true,
    display_order: 2,
    created_at: new Date("2026-10-30T00:00:00Z").toISOString(),
    updated_at: new Date("2026-10-30T00:00:00Z").toISOString(),
  },
  {
    id: "offer_diwali_15",
    code: "DIWALI15",
    title: "15% OFF",
    tag: "FESTIVE BOTANICAL OFFER",
    description: "15% OFF On orders above ₹1,599",
    discount_badge: "15% OFF",
    discount_type: "percentage",
    discount_value: 15,
    min_spend: 1599,
    min_spend_text: "On orders above ₹1,599",
    terms: "Not applicable on hamper products",
    expiry_text: "Festive limited offer",
    category: "sitewide",
    bg_color: "#EAF4EE",
    text_color: "#1B3B2B",
    accent_color: "#93113A",
    icon: "percent",
    is_highlighted: false,
    is_active: true,
    display_order: 3,
    created_at: new Date("2026-10-30T00:00:00Z").toISOString(),
    updated_at: new Date("2026-10-30T00:00:00Z").toISOString(),
  },
  {
    id: "offer_diwali_20",
    code: "DIWALI20",
    title: "20% OFF",
    tag: "FESTIVE BOTANICAL OFFER",
    description: "20% OFF On orders above ₹2,299",
    discount_badge: "20% OFF",
    discount_type: "percentage",
    discount_value: 20,
    min_spend: 2299,
    min_spend_text: "On orders above ₹2,299",
    terms: "Not applicable on hamper products",
    expiry_text: "Festive limited offer",
    category: "sitewide",
    bg_color: "#EAF4EE",
    text_color: "#1B3B2B",
    accent_color: "#93113A",
    icon: "percent",
    is_highlighted: false,
    is_active: true,
    display_order: 4,
    created_at: new Date("2026-10-30T00:00:00Z").toISOString(),
    updated_at: new Date("2026-10-30T00:00:00Z").toISOString(),
  },
  {
    id: "offer_monsoon_thunder15",
    code: "THUNDER15",
    title: "Monsoon Thunder Sale",
    tag: "LIMITED TIME OFFER",
    description: "Flat 15% discount across all conditioned indoor plants and heirloom seed collections.",
    discount_badge: "15% OFF",
    discount_type: "percentage",
    discount_value: 15,
    min_spend: 1199,
    min_spend_text: "Min Order: ₹1,199",
    terms: "Excludes heavy garden tools",
    expiry_text: "Expires in 4 days",
    category: "sitewide",
    bg_color: "#E8F5E9",
    text_color: "#1B3B2B",
    accent_color: "#2E7D32",
    icon: "auto_awesome",
    is_highlighted: false,
    is_active: true,
    display_order: 5,
    created_at: new Date("2026-10-30T00:00:00Z").toISOString(),
    updated_at: new Date("2026-10-30T00:00:00Z").toISOString(),
  },
  {
    id: "offer_seeds_heirloom20",
    code: "HEIRLOOM20",
    title: "Desi Heirloom Seed Fest",
    tag: "0% GST SEED SPECIAL",
    description: "Extra 20% savings on pure desi vegetable, culinary herb, and festive flower seed packets.",
    discount_badge: "20% OFF",
    discount_type: "percentage",
    discount_value: 20,
    min_spend: 499,
    min_spend_text: "Min Order: ₹499",
    terms: "Valid on all 0% GST seed collections",
    expiry_text: "Seasonal planting special",
    category: "seeds",
    bg_color: "#FFF8E1",
    text_color: "#5D4037",
    accent_color: "#F57F17",
    icon: "spa",
    is_highlighted: false,
    is_active: true,
    display_order: 6,
    created_at: new Date("2026-10-30T00:00:00Z").toISOString(),
    updated_at: new Date("2026-10-30T00:00:00Z").toISOString(),
  },
  {
    id: "offer_shipping_freeship",
    code: "FREESHIP",
    title: "Free Express Botanical Courier",
    tag: "FREE DELIVERY",
    description: "Free moisture-conditioned nursery express courier across India on orders over ₹499.",
    discount_badge: "FREE DELIVERY",
    discount_type: "free_shipping",
    discount_value: 0,
    min_spend: 499,
    min_spend_text: "Min Order: ₹499",
    terms: "Pan-India express nursery dispatch",
    expiry_text: "Pan-India delivery",
    category: "sitewide",
    bg_color: "#E1F5FE",
    text_color: "#01579B",
    accent_color: "#0288D1",
    icon: "local_shipping",
    is_highlighted: false,
    is_active: true,
    display_order: 7,
    created_at: new Date("2026-10-30T00:00:00Z").toISOString(),
    updated_at: new Date("2026-10-30T00:00:00Z").toISOString(),
  },
];

export class OfferService {
  private static initStore(): Offer[] {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(OFFERS_FILE)) {
        fs.writeFileSync(OFFERS_FILE, JSON.stringify(DEFAULT_OFFERS, null, 2), "utf8");
        return [...DEFAULT_OFFERS];
      }
      const raw = fs.readFileSync(OFFERS_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        fs.writeFileSync(OFFERS_FILE, JSON.stringify(DEFAULT_OFFERS, null, 2), "utf8");
        return [...DEFAULT_OFFERS];
      }
      return parsed;
    } catch {
      return [...DEFAULT_OFFERS];
    }
  }

  private static persist(offers: Offer[]): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(OFFERS_FILE, JSON.stringify(offers, null, 2), "utf8");
    } catch (err) {
      console.error("[OfferService] Failed to persist offers to disk:", err);
    }
  }

  public static async listOffers(activeOnly = false): Promise<Offer[]> {
    const offers = this.initStore();
    const filtered = activeOnly ? offers.filter((o) => o.is_active) : offers;
    return filtered.sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  public static async getOfferById(id: string): Promise<Offer | null> {
    const offers = this.initStore();
    return offers.find((o) => o.id === id) || null;
  }

  public static async getHighlightedOffer(): Promise<Offer | null> {
    const activeOffers = await this.listOffers(true);
    // Find active offer explicitly marked as highlighted
    const highlighted = activeOffers.find((o) => o.is_highlighted);
    if (highlighted) return highlighted;
    // Fallback to first active offer
    return activeOffers[0] || null;
  }

  public static async createOffer(input: CreateOfferInput): Promise<Offer> {
    const offers = this.initStore();
    const now = new Date().toISOString();
    const cleanCode = input.code.trim().toUpperCase();

    // If marked as highlighted, unmark any existing highlighted offers to keep single banner focus
    if (input.is_highlighted) {
      offers.forEach((o) => {
        o.is_highlighted = false;
      });
    }

    const newOffer: Offer = {
      id: `offer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      code: cleanCode,
      title: input.title.trim(),
      tag: input.tag?.trim() || "SPECIAL OFFER",
      description: input.description.trim(),
      discount_badge: input.discount_badge?.trim() || "SPECIAL DEAL",
      discount_type: input.discount_type || "percentage",
      discount_value: Number(input.discount_value ?? 10),
      min_spend: input.min_spend !== undefined ? Number(input.min_spend) : 499,
      min_spend_text: input.min_spend_text?.trim() || (input.min_spend ? `Min Order: ₹${input.min_spend}` : undefined),
      expiry_text: input.expiry_text?.trim() || "Limited time offer",
      terms: input.terms?.trim(),
      category: input.category || "welcome",
      bg_color: input.bg_color || "#EAF4EE",
      text_color: input.text_color || "#1B3B2B",
      accent_color: input.accent_color || "#1E3D2F",
      icon: input.icon || "card_giftcard",
      is_highlighted: input.is_highlighted !== undefined ? Boolean(input.is_highlighted) : false,
      is_active: input.is_active !== undefined ? Boolean(input.is_active) : true,
      display_order: input.display_order !== undefined ? Number(input.display_order) : offers.length + 1,
      created_at: now,
      updated_at: now,
    };

    offers.push(newOffer);
    this.persist(offers);
    return newOffer;
  }

  public static async updateOffer(id: string, input: UpdateOfferInput): Promise<Offer | null> {
    const offers = this.initStore();
    const index = offers.findIndex((o) => o.id === id);
    if (index === -1) return null;

    const existing = offers[index];

    // If toggling or setting highlighted to true, ensure exclusivity
    if (input.is_highlighted === true) {
      offers.forEach((o) => {
        if (o.id !== id) {
          o.is_highlighted = false;
        }
      });
    }

    const updated: Offer = {
      ...existing,
      code: input.code !== undefined ? input.code.trim().toUpperCase() : existing.code,
      title: input.title !== undefined ? input.title.trim() : existing.title,
      tag: input.tag !== undefined ? input.tag.trim() : existing.tag,
      description: input.description !== undefined ? input.description.trim() : existing.description,
      discount_badge: input.discount_badge !== undefined ? input.discount_badge.trim() : existing.discount_badge,
      discount_type: input.discount_type !== undefined ? input.discount_type : existing.discount_type,
      discount_value: input.discount_value !== undefined ? Number(input.discount_value) : existing.discount_value,
      min_spend: input.min_spend !== undefined ? Number(input.min_spend) : existing.min_spend,
      min_spend_text: input.min_spend_text !== undefined ? input.min_spend_text.trim() : existing.min_spend_text,
      expiry_text: input.expiry_text !== undefined ? input.expiry_text.trim() : existing.expiry_text,
      terms: input.terms !== undefined ? input.terms.trim() : existing.terms,
      category: input.category !== undefined ? input.category : existing.category,
      bg_color: input.bg_color !== undefined ? input.bg_color : existing.bg_color,
      text_color: input.text_color !== undefined ? input.text_color : existing.text_color,
      accent_color: input.accent_color !== undefined ? input.accent_color : existing.accent_color,
      icon: input.icon !== undefined ? input.icon : existing.icon,
      is_highlighted: input.is_highlighted !== undefined ? Boolean(input.is_highlighted) : existing.is_highlighted,
      is_active: input.is_active !== undefined ? Boolean(input.is_active) : existing.is_active,
      display_order: input.display_order !== undefined ? Number(input.display_order) : existing.display_order,
      updated_at: new Date().toISOString(),
    };

    offers[index] = updated;
    this.persist(offers);
    return updated;
  }

  public static async deleteOffer(id: string): Promise<boolean> {
    const offers = this.initStore();
    const index = offers.findIndex((o) => o.id === id);
    if (index === -1) return false;

    offers.splice(index, 1);
    this.persist(offers);
    return true;
  }

  public static async validateCoupon(
    code: string,
    cartSubtotalINR: number
  ): Promise<ValidateCouponResult> {
    if (!code || typeof code !== "string" || !code.trim()) {
      return { valid: false, discount_amount: 0, error: "Please enter a valid coupon code" };
    }
    const cleanCode = code.trim().toUpperCase();
    const activeOffers = await this.listOffers(true);
    const offer = activeOffers.find((o) => o.code.toUpperCase() === cleanCode);

    if (!offer) {
      return {
        valid: false,
        discount_amount: 0,
        error: `Coupon "${cleanCode}" is invalid or expired`,
      };
    }

    const minSpend = offer.min_spend || 0;
    if (cartSubtotalINR < minSpend) {
      const needed = minSpend - cartSubtotalINR;
      return {
        valid: false,
        offer,
        discount_amount: 0,
        min_spend: minSpend,
        needed,
        error: `Add ₹${needed.toLocaleString("en-IN")} more to unlock this ${offer.discount_badge} offer`,
      };
    }

    let discountAmount = 0;
    let discountPercent: number | undefined;

    if (offer.discount_type === "percentage") {
      discountPercent = offer.discount_value;
      discountAmount = Math.round((cartSubtotalINR * offer.discount_value) / 100);
    } else if (offer.discount_type === "fixed") {
      discountAmount = Math.min(cartSubtotalINR, offer.discount_value);
    } else if (offer.discount_type === "free_shipping") {
      discountAmount = 0; // Handled via shipping waiver
    }

    // Determine next higher discount tier if applicable
    let nextTier: ValidateCouponResult["next_tier"] | undefined;
    const samePrefix = offer.code.replace(/[0-9]+$/, "");
    const higherOffers = activeOffers
      .filter((o) => (o.min_spend || 0) > minSpend && (o.discount_value || 0) > (offer.discount_value || 0))
      .sort((a, b) => {
        const aPrefix = a.code.startsWith(samePrefix) ? 0 : 1;
        const bPrefix = b.code.startsWith(samePrefix) ? 0 : 1;
        if (aPrefix !== bPrefix) return aPrefix - bPrefix;
        return (a.min_spend || 0) - (b.min_spend || 0);
      });

    if (higherOffers.length > 0) {
      const nextOffer = higherOffers[0];
      const nextNeeded = Math.max(0, (nextOffer.min_spend || 0) - cartSubtotalINR);
      nextTier = {
        needed: nextNeeded,
        code: nextOffer.code,
        discount_text: nextOffer.discount_badge,
        target_spend: nextOffer.min_spend || 0,
      };
    }

    return {
      valid: true,
      offer,
      discount_amount: discountAmount,
      discount_percent: discountPercent,
      next_tier: nextTier,
    };
  }

  public static async seedDefaults(force = false): Promise<Offer[]> {
    if (force || !fs.existsSync(OFFERS_FILE)) {
      this.persist(DEFAULT_OFFERS);
      return [...DEFAULT_OFFERS];
    }
    return this.listOffers(false);
  }
}

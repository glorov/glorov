import fs from "node:fs";
import path from "node:path";
import {
  TrustBadgeItem,
  TrustSectionSettings,
  CreateTrustBadgeInput,
  UpdateTrustBadgeInput,
  UpdateTrustSectionSettingsInput,
} from "./types";

const DATA_DIR = path.resolve(process.cwd(), "data");
const BADGES_FILE = path.join(DATA_DIR, "trust-badges.json");
const SETTINGS_FILE = path.join(DATA_DIR, "trust-settings.json");

export const DEFAULT_TRUST_BADGES: TrustBadgeItem[] = [
  {
    id: "badge_organic_nongmo",
    title: "100% Organic & Non-GMO",
    subtitle: "Open-pollinated, chemical-free heirloom seeds tested for 98%+ germination vigor.",
    icon_key: "organic-shield",
    cta_route: "/categories/seeds",
    display_order: 1,
    is_active: true,
    created_at: new Date("2026-10-30T00:00:00Z").toISOString(),
    updated_at: new Date("2026-10-30T00:00:00Z").toISOString(),
  },
  {
    id: "badge_safe_transit",
    title: "Safe Transit Guarantee",
    subtitle: "Custom ventilated botanical packaging ensures live houseplants arrive lush and shock-free.",
    icon_key: "transit-truck",
    cta_route: "/policies/shipping-policy",
    display_order: 2,
    is_active: true,
    created_at: new Date("2026-10-30T00:00:00Z").toISOString(),
    updated_at: new Date("2026-10-30T00:00:00Z").toISOString(),
  },
  {
    id: "badge_lifetime_support",
    title: "Lifetime Plant Support",
    subtitle: "Our in-house botanists guide your potting, watering, and harvesting every step of the way.",
    icon_key: "support-hand",
    cta_route: "/plant-doctor",
    display_order: 3,
    is_active: true,
    created_at: new Date("2026-10-30T00:00:00Z").toISOString(),
    updated_at: new Date("2026-10-30T00:00:00Z").toISOString(),
  },
  {
    id: "badge_eco_friendly",
    title: "Eco-Friendly Philosophy",
    subtitle: "Biodegradable seed sleeves, plastic-free shipping containers, and sustainable coco-coir.",
    icon_key: "eco-leaf",
    cta_route: "/about",
    display_order: 4,
    is_active: true,
    created_at: new Date("2026-10-30T00:00:00Z").toISOString(),
    updated_at: new Date("2026-10-30T00:00:00Z").toISOString(),
  },
];

export const DEFAULT_TRUST_SETTINGS: TrustSectionSettings = {
  bg_color: "#1B4332",
  text_color: "#FFFFFF",
  icon_bg_color: "#FFFFFF",
  icon_color: "#1B4332",
  divider_color: "rgba(255, 255, 255, 0.22)",
  border_radius: 20,
  is_visible: true,
  section_title: "The GLOROV Botanical Guarantee",
  section_subtitle: "Dispatched direct from our Pune nursery hub across India",
  updated_at: new Date("2026-10-30T00:00:00Z").toISOString(),
};

export class TrustBadgeService {
  private static initBadgesStore(): TrustBadgeItem[] {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(BADGES_FILE)) {
        fs.writeFileSync(BADGES_FILE, JSON.stringify(DEFAULT_TRUST_BADGES, null, 2), "utf8");
        return [...DEFAULT_TRUST_BADGES];
      }
      const raw = fs.readFileSync(BADGES_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        fs.writeFileSync(BADGES_FILE, JSON.stringify(DEFAULT_TRUST_BADGES, null, 2), "utf8");
        return [...DEFAULT_TRUST_BADGES];
      }
      return parsed;
    } catch {
      return [...DEFAULT_TRUST_BADGES];
    }
  }

  private static initSettingsStore(): TrustSectionSettings {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(SETTINGS_FILE)) {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_TRUST_SETTINGS, null, 2), "utf8");
        return { ...DEFAULT_TRUST_SETTINGS };
      }
      const raw = fs.readFileSync(SETTINGS_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_TRUST_SETTINGS, null, 2), "utf8");
        return { ...DEFAULT_TRUST_SETTINGS };
      }
      return { ...DEFAULT_TRUST_SETTINGS, ...parsed };
    } catch {
      return { ...DEFAULT_TRUST_SETTINGS };
    }
  }

  private static persistBadges(badges: TrustBadgeItem[]): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(BADGES_FILE, JSON.stringify(badges, null, 2), "utf8");
    } catch (err) {
      console.error("[TrustBadgeService] Failed to persist trust badges:", err);
    }
  }

  private static persistSettings(settings: TrustSectionSettings): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf8");
    } catch (err) {
      console.error("[TrustBadgeService] Failed to persist trust settings:", err);
    }
  }

  /**
   * List trust badges, sorted by display_order ascending.
   */
  public static async listBadges(activeOnly = false): Promise<TrustBadgeItem[]> {
    const badges = this.initBadgesStore();
    const filtered = activeOnly ? badges.filter((b) => b.is_active) : badges;
    return filtered.sort((a, b) => a.display_order - b.display_order);
  }

  /**
   * Get single trust badge by ID.
   */
  public static async getBadge(id: string): Promise<TrustBadgeItem | null> {
    const badges = this.initBadgesStore();
    return badges.find((b) => b.id === id) || null;
  }

  /**
   * Create a new trust badge.
   */
  public static async createBadge(input: CreateTrustBadgeInput): Promise<TrustBadgeItem> {
    const badges = this.initBadgesStore();
    const now = new Date().toISOString();
    const id = `badge_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const maxOrder = badges.reduce((max, b) => Math.max(max, b.display_order), 0);

    const newBadge: TrustBadgeItem = {
      id,
      title: input.title.trim(),
      subtitle: input.subtitle?.trim(),
      icon_key: input.icon_key || "fertilized-soil",
      custom_icon_svg: input.custom_icon_svg?.trim(),
      cta_route: input.cta_route?.trim(),
      display_order: input.display_order !== undefined ? Number(input.display_order) : maxOrder + 1,
      is_active: input.is_active !== undefined ? Boolean(input.is_active) : true,
      created_at: now,
      updated_at: now,
    };

    badges.push(newBadge);
    this.persistBadges(badges);
    return newBadge;
  }

  /**
   * Update an existing trust badge.
   */
  public static async updateBadge(
    id: string,
    input: UpdateTrustBadgeInput
  ): Promise<TrustBadgeItem | null> {
    const badges = this.initBadgesStore();
    const index = badges.findIndex((b) => b.id === id);
    if (index === -1) {
      return null;
    }

    const existing = badges[index];
    const updated: TrustBadgeItem = {
      ...existing,
      title: input.title !== undefined ? input.title.trim() : existing.title,
      subtitle: input.subtitle !== undefined ? input.subtitle.trim() : existing.subtitle,
      icon_key: input.icon_key !== undefined ? input.icon_key : existing.icon_key,
      custom_icon_svg:
        input.custom_icon_svg !== undefined ? input.custom_icon_svg.trim() : existing.custom_icon_svg,
      cta_route: input.cta_route !== undefined ? input.cta_route.trim() : existing.cta_route,
      display_order:
        input.display_order !== undefined ? Number(input.display_order) : existing.display_order,
      is_active: input.is_active !== undefined ? Boolean(input.is_active) : existing.is_active,
      updated_at: new Date().toISOString(),
    };

    badges[index] = updated;
    this.persistBadges(badges);
    return updated;
  }

  /**
   * Delete a trust badge by ID.
   */
  public static async deleteBadge(id: string): Promise<boolean> {
    const badges = this.initBadgesStore();
    const filtered = badges.filter((b) => b.id !== id);
    if (filtered.length === badges.length) {
      return false;
    }
    this.persistBadges(filtered);
    return true;
  }

  /**
   * Reorder trust badges by passing array of IDs in requested order.
   */
  public static async reorderBadges(orderedIds: string[]): Promise<TrustBadgeItem[]> {
    const badges = this.initBadgesStore();
    const now = new Date().toISOString();

    orderedIds.forEach((id, index) => {
      const b = badges.find((item) => item.id === id);
      if (b) {
        b.display_order = index + 1;
        b.updated_at = now;
      }
    });

    this.persistBadges(badges);
    return badges.sort((a, b) => a.display_order - b.display_order);
  }

  /**
   * Get current section appearance settings.
   */
  public static async getSettings(): Promise<TrustSectionSettings> {
    return this.initSettingsStore();
  }

  /**
   * Update section appearance settings (theme color, text color, visibility, etc.)
   */
  public static async updateSettings(
    input: UpdateTrustSectionSettingsInput
  ): Promise<TrustSectionSettings> {
    const current = this.initSettingsStore();
    const updated: TrustSectionSettings = {
      ...current,
      bg_color: input.bg_color || current.bg_color,
      text_color: input.text_color || current.text_color,
      icon_bg_color: input.icon_bg_color || current.icon_bg_color,
      icon_color: input.icon_color || current.icon_color,
      divider_color: input.divider_color || current.divider_color,
      border_radius:
        input.border_radius !== undefined ? Number(input.border_radius) : current.border_radius,
      is_visible: input.is_visible !== undefined ? Boolean(input.is_visible) : current.is_visible,
      section_title: input.section_title !== undefined ? input.section_title : current.section_title,
      section_subtitle:
        input.section_subtitle !== undefined ? input.section_subtitle : current.section_subtitle,
      updated_at: new Date().toISOString(),
    };

    this.persistSettings(updated);
    return updated;
  }

  /**
   * Seed / reset defaults.
   */
  public static async seedDefaults(force = false): Promise<{
    badges: TrustBadgeItem[];
    settings: TrustSectionSettings;
  }> {
    if (force || !fs.existsSync(BADGES_FILE)) {
      this.persistBadges([...DEFAULT_TRUST_BADGES]);
    }
    if (force || !fs.existsSync(SETTINGS_FILE)) {
      this.persistSettings({ ...DEFAULT_TRUST_SETTINGS });
    }
    return {
      badges: await this.listBadges(false),
      settings: await this.getSettings(),
    };
  }
}

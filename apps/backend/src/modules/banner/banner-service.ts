import fs from "node:fs";
import path from "node:path";
import { Banner, CreateBannerInput, UpdateBannerInput } from "./types";

const DATA_DIR = path.resolve(process.cwd(), "data");
const BANNERS_FILE = path.join(DATA_DIR, "banners.json");

export const DEFAULT_BANNERS: Banner[] = [
  {
    id: "banner_garden_begins",
    title: "Every Great Garden Begins with a Seed.",
    subtitle: "Discover the joy of growing something beautiful.",
    tag: "GROW WITH GLOROV",
    desktop_image_url: "/banners/banner_garden_begins_desktop.png",
    mobile_image_url: "/banners/banner_garden_begins_mobile.jpg",
    cta_text: "EXPLORE SEEDS & PLANTS",
    cta_route: "/categories/seeds",
    cta_arguments: { category: "seeds", title: "Seeds & Live Plants" },
    display_order: 1,
    is_active: true,
    bg_color: "#1E3D2F",
    created_at: new Date("2026-10-30T00:00:00Z").toISOString(),
    updated_at: new Date("2026-10-30T00:00:00Z").toISOString(),
  },
  {
    id: "banner_plant_seed",
    title: "Plant a Seed. Grow a Dream.",
    subtitle: "A greener tomorrow begins with what you plant today.",
    tag: "START SOMETHING BEAUTIFUL",
    desktop_image_url: "/banners/banner_plant_seed_desktop.png",
    mobile_image_url: "/banners/banner_plant_seed_mobile.jpg",
    cta_text: "START YOUR GARDEN",
    cta_route: "/categories/live-plants",
    cta_arguments: { category: "live-plants", title: "Live Houseplants" },
    display_order: 2,
    is_active: true,
    bg_color: "#2D5A27",
    created_at: new Date("2026-10-30T00:00:00Z").toISOString(),
    updated_at: new Date("2026-10-30T00:00:00Z").toISOString(),
  },
  {
    id: "banner_garden_bloom",
    title: "Let Your Garden Bloom.",
    subtitle: "Bring home the colors, calm, and beauty of nature.",
    tag: "A LITTLE MORE NATURE",
    desktop_image_url: "/banners/banner_garden_bloom_desktop.png",
    mobile_image_url: "/banners/banner_garden_bloom_mobile.jpg",
    cta_text: "DISCOVER FLOWER SEEDS",
    cta_route: "/categories/flowering",
    cta_arguments: { category: "flowering", title: "Flowering Plants & Seeds" },
    display_order: 3,
    is_active: true,
    bg_color: "#7C1034",
    created_at: new Date("2026-10-30T00:00:00Z").toISOString(),
    updated_at: new Date("2026-10-30T00:00:00Z").toISOString(),
  },
  {
    id: "banner_grow_fresh",
    title: "Grow Fresh. Live Green.",
    subtitle: "Turn your little space into a garden full of life.",
    tag: "GROW YOUR OWN",
    desktop_image_url: "/banners/banner_grow_fresh_desktop.png",
    mobile_image_url: "/banners/banner_grow_fresh_mobile.jpg",
    cta_text: "SHOP VEGETABLE SEEDS",
    cta_route: "/categories/vegetables",
    cta_arguments: { category: "vegetables", title: "Kitchen Garden Seeds" },
    display_order: 4,
    is_active: true,
    bg_color: "#183B28",
    created_at: new Date("2026-10-30T00:00:00Z").toISOString(),
    updated_at: new Date("2026-10-30T00:00:00Z").toISOString(),
  },
];

export class BannerService {
  private static initStore(): Banner[] {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(BANNERS_FILE)) {
        fs.writeFileSync(BANNERS_FILE, JSON.stringify(DEFAULT_BANNERS, null, 2), "utf8");
        return [...DEFAULT_BANNERS];
      }
      const raw = fs.readFileSync(BANNERS_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        fs.writeFileSync(BANNERS_FILE, JSON.stringify(DEFAULT_BANNERS, null, 2), "utf8");
        return [...DEFAULT_BANNERS];
      }
      return parsed;
    } catch {
      return [...DEFAULT_BANNERS];
    }
  }

  private static persist(banners: Banner[]): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(BANNERS_FILE, JSON.stringify(banners, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to persist banners:", err);
    }
  }

  static async listBanners(activeOnly = false): Promise<Banner[]> {
    const banners = this.initStore();
    const filtered = activeOnly ? banners.filter((b) => b.is_active) : banners;
    return filtered.sort((a, b) => a.display_order - b.display_order);
  }

  static async getBannerById(id: string): Promise<Banner | null> {
    const banners = this.initStore();
    return banners.find((b) => b.id === id) || null;
  }

  static async createBanner(input: CreateBannerInput): Promise<Banner> {
    const banners = this.initStore();
    const newId = `banner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const maxOrder = banners.reduce((max, b) => Math.max(max, b.display_order || 0), 0);

    const newBanner: Banner = {
      id: newId,
      title: input.title,
      subtitle: input.subtitle || "",
      tag: input.tag || "FEATURED CAMPAIGN",
      desktop_image_url: input.desktop_image_url,
      mobile_image_url: input.mobile_image_url || input.desktop_image_url,
      cta_text: input.cta_text || "SHOP NOW",
      cta_route: input.cta_route || "/categories/seeds",
      cta_arguments: input.cta_arguments || {},
      display_order: input.display_order ?? maxOrder + 1,
      is_active: input.is_active ?? true,
      bg_color: input.bg_color || "#1E3D2F",
      created_at: now,
      updated_at: now,
    };

    banners.push(newBanner);
    this.persist(banners);
    return newBanner;
  }

  static async updateBanner(id: string, input: UpdateBannerInput): Promise<Banner | null> {
    const banners = this.initStore();
    const idx = banners.findIndex((b) => b.id === id);
    if (idx === -1) return null;

    const current = banners[idx];
    const updated: Banner = {
      ...current,
      title: input.title !== undefined ? input.title : current.title,
      subtitle: input.subtitle !== undefined ? input.subtitle : current.subtitle,
      tag: input.tag !== undefined ? input.tag : current.tag,
      desktop_image_url: input.desktop_image_url !== undefined ? input.desktop_image_url : current.desktop_image_url,
      mobile_image_url: input.mobile_image_url !== undefined ? input.mobile_image_url : current.mobile_image_url,
      cta_text: input.cta_text !== undefined ? input.cta_text : current.cta_text,
      cta_route: input.cta_route !== undefined ? input.cta_route : current.cta_route,
      cta_arguments: input.cta_arguments !== undefined ? input.cta_arguments : current.cta_arguments,
      display_order: input.display_order !== undefined ? input.display_order : current.display_order,
      is_active: input.is_active !== undefined ? input.is_active : current.is_active,
      bg_color: input.bg_color !== undefined ? input.bg_color : current.bg_color,
      updated_at: new Date().toISOString(),
    };

    banners[idx] = updated;
    this.persist(banners);
    return updated;
  }

  static async deleteBanner(id: string): Promise<boolean> {
    const banners = this.initStore();
    const filtered = banners.filter((b) => b.id !== id);
    if (filtered.length === banners.length) return false;

    this.persist(filtered);
    return true;
  }

  static async reorderBanners(orderedIds: string[]): Promise<Banner[]> {
    const banners = this.initStore();
    const idMap = new Map(orderedIds.map((id, index) => [id, index + 1]));

    for (const b of banners) {
      if (idMap.has(b.id)) {
        b.display_order = idMap.get(b.id)!;
        b.updated_at = new Date().toISOString();
      }
    }

    this.persist(banners);
    return banners.sort((a, b) => a.display_order - b.display_order);
  }

  static async seedDefaults(force = false): Promise<Banner[]> {
    if (force || !fs.existsSync(BANNERS_FILE)) {
      this.persist([...DEFAULT_BANNERS]);
      return [...DEFAULT_BANNERS];
    }
    return this.initStore();
  }
}

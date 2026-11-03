import fs from "node:fs";
import path from "node:path";
import { HeroConfig, UpdateHeroConfigInput } from "./types";

const DATA_DIR = path.resolve(process.cwd(), "data");
const HERO_FILE = path.join(DATA_DIR, "hero.json");

export const DEFAULT_HERO_CONFIG: HeroConfig = {
  id: "hero_organic_botanical",
  tag: "ORGANIC BOTANICAL COLLECTION 2026",
  headline: "Grow Something\nBeautiful.",
  description:
    "Certified non-GMO heirloom seeds, nursery-acclimatized houseplants, and breathable terracotta planters. Cultivate a greener sanctuary at home with verified germination and transit protection.",
  cta_text: "Shop Seeds & Plants",
  cta_route: "/categories/seeds",
  secondary_cta_text: "Explore Care Guides",
  secondary_cta_route: "/plant-doctor",
  desktop_image_url: "assets/images/monstera_deliciosa_hero.jpg",
  mobile_image_url: "assets/images/monstera_deliciosa_hero.jpg",
  plant_tag: "PLANT OF THE SEASON",
  plant_name: "Monstera Deliciosa • Swiss Cheese",
  plant_route: "/categories/live-plants",
  trust_pills: [
    {
      icon: "ac_unit_rounded",
      text: "Winter Botanical Special",
    },
    {
      icon: "local_shipping_outlined",
      text: "Free Shipping for $4.99",
    },
    {
      icon: "eco_outlined",
      text: "Safe Transit Guarantee",
    },
  ],
  is_active: true,
  updated_at: new Date("2026-11-01T00:00:00Z").toISOString(),
};

export class HeroService {
  private static initStore(): HeroConfig {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(HERO_FILE)) {
        fs.writeFileSync(
          HERO_FILE,
          JSON.stringify(DEFAULT_HERO_CONFIG, null, 2),
          "utf8"
        );
        return { ...DEFAULT_HERO_CONFIG };
      }
      const raw = fs.readFileSync(HERO_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || !parsed.id) {
        fs.writeFileSync(
          HERO_FILE,
          JSON.stringify(DEFAULT_HERO_CONFIG, null, 2),
          "utf8"
        );
        return { ...DEFAULT_HERO_CONFIG };
      }
      return parsed as HeroConfig;
    } catch {
      return { ...DEFAULT_HERO_CONFIG };
    }
  }

  private static persist(config: HeroConfig): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(HERO_FILE, JSON.stringify(config, null, 2), "utf8");
    } catch (err) {
      console.error("[HeroService] Persistence failure:", err);
    }
  }

  public static async getHeroConfig(): Promise<HeroConfig> {
    return this.initStore();
  }

  public static async updateHeroConfig(
    input: UpdateHeroConfigInput
  ): Promise<HeroConfig> {
    const current = this.initStore();
    const updated: HeroConfig = {
      ...current,
      ...input,
      updated_at: new Date().toISOString(),
    };
    this.persist(updated);
    return updated;
  }
}

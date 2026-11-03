import fs from "node:fs";
import path from "node:path";
import {
  HeroService,
  DEFAULT_HERO_CONFIG,
} from "../modules/hero/hero-service";
import { HeroConfig } from "../modules/hero/types";

const DATA_DIR = path.resolve(process.cwd(), "data");
const HERO_FILE = path.join(DATA_DIR, "hero.json");

describe("Hero Showcase Operations & Backend Dynamic Configuration", () => {
  let originalHeroJson: string | null = null;

  beforeAll(() => {
    if (fs.existsSync(HERO_FILE)) {
      originalHeroJson = fs.readFileSync(HERO_FILE, "utf8");
    }
    fs.writeFileSync(HERO_FILE, JSON.stringify(DEFAULT_HERO_CONFIG, null, 2), "utf8");
  });

  afterAll(() => {
    if (originalHeroJson !== null) {
      fs.writeFileSync(HERO_FILE, originalHeroJson, "utf8");
    }
  });

  describe("1. Default Hero Configuration Invariants", () => {
    it("has dynamic trust pills with Free Shipping for $4.99 by default", async () => {
      const config = await HeroService.getHeroConfig();
      expect(config).toBeDefined();
      expect(Array.isArray(config.trust_pills)).toBe(true);
      expect(config.trust_pills.length).toBeGreaterThanOrEqual(3);

      const shippingPill = config.trust_pills.find((p) =>
        p.text.toLowerCase().includes("free shipping")
      );
      expect(shippingPill).toBeDefined();
      expect(shippingPill?.text).toBe("Free Shipping for $4.99");
      expect(shippingPill?.icon).toBe("local_shipping_outlined");
    });

    it("includes winter botanical special and safe transit guarantee pills", async () => {
      const config = await HeroService.getHeroConfig();
      const winterPill = config.trust_pills.find((p) =>
        p.text.includes("Winter")
      );
      expect(winterPill).toBeDefined();
      expect(winterPill?.text).toBe("Winter Botanical Special");

      const transitPill = config.trust_pills.find((p) =>
        p.text.includes("Transit")
      );
      expect(transitPill).toBeDefined();
      expect(transitPill?.text).toBe("Safe Transit Guarantee");
    });

    it("has full editorial copy and CTA navigation routes", async () => {
      const config = await HeroService.getHeroConfig();
      expect(config.tag).toBe("ORGANIC BOTANICAL COLLECTION 2026");
      expect(config.headline).toContain("Grow Something");
      expect(config.cta_text).toBe("Shop Seeds & Plants");
      expect(config.cta_route).toBe("/categories/seeds");
      expect(config.secondary_cta_text).toBe("Explore Care Guides");
      expect(config.secondary_cta_route).toBe("/plant-doctor");
    });
  });

  describe("2. Hero Configuration Dynamic Updates", () => {
    it("updates trust pills dynamically and persists to data/hero.json", async () => {
      const updatedPills = [
        { icon: "ac_unit_rounded", text: "Winter Web Special" },
        { icon: "local_shipping_outlined", text: "Free Shipping for $4.99" },
        { icon: "eco_outlined", text: "100% Germination Verified" },
      ];

      const updated = await HeroService.updateHeroConfig({
        trust_pills: updatedPills,
      });

      expect(updated.trust_pills).toEqual(updatedPills);

      // Verify persistence by reloading from disk
      const fetched = await HeroService.getHeroConfig();
      expect(fetched.trust_pills).toEqual(updatedPills);
    });

    it("updates headline, cta, and botanical plant showcase", async () => {
      const updated = await HeroService.updateHeroConfig({
        headline: "Cultivate Your Living Forest.",
        plant_name: "Fiddle Leaf Fig • Premium Specimen",
      });

      expect(updated.headline).toBe("Cultivate Your Living Forest.");
      expect(updated.plant_name).toBe("Fiddle Leaf Fig • Premium Specimen");

      // Verify timestamp is updated
      expect(new Date(updated.updated_at).getTime()).toBeGreaterThan(0);
    });

    it("resets back to canonical defaults with Free Shipping for $4.99", async () => {
      const reset = await HeroService.updateHeroConfig(DEFAULT_HERO_CONFIG);
      expect(reset.headline).toBe("Grow Something\nBeautiful.");
      expect(reset.trust_pills[1].text).toBe("Free Shipping for $4.99");
    });
  });
});

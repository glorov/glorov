import {
  TrustBadgeService,
  DEFAULT_TRUST_BADGES,
  DEFAULT_TRUST_SETTINGS,
} from "../modules/trust-badge/trust-badge-service";

describe("Trust Badges & Value Propositions Operations Invariants", () => {
  beforeEach(async () => {
    // Reset defaults before each test
    await TrustBadgeService.seedDefaults(true);
  });

  describe("1. Default Trust Badges & Settings Seeding", () => {
    it("seeds 4 distinct botanical trust guarantees matching User Content", async () => {
      const badges = await TrustBadgeService.listBadges(false);
      expect(badges.length).toBe(4);

      expect(badges[0].title).toBe("100% Organic & Non-GMO");
      expect(badges[0].icon_key).toBe("organic-shield");

      expect(badges[1].title).toBe("Safe Transit Guarantee");
      expect(badges[1].icon_key).toBe("transit-truck");

      expect(badges[2].title).toBe("Lifetime Plant Support");
      expect(badges[2].icon_key).toBe("support-hand");

      expect(badges[3].title).toBe("Eco-Friendly Philosophy");
      expect(badges[3].icon_key).toBe("eco-leaf");
    });

    it("seeds default botanical forest green theme settings", async () => {
      const settings = await TrustBadgeService.getSettings();
      expect(settings.bg_color).toBe("#1B4332");
      expect(settings.text_color).toBe("#FFFFFF");
      expect(settings.icon_bg_color).toBe("#FFFFFF");
      expect(settings.icon_color).toBe("#1B4332");
      expect(settings.is_visible).toBe(true);
      expect(settings.border_radius).toBe(20);
    });

    it("orders trust badges strictly ascending by display_order", async () => {
      const badges = await TrustBadgeService.listBadges(false);
      for (let i = 0; i < badges.length - 1; i++) {
        expect(badges[i].display_order).toBeLessThanOrEqual(badges[i + 1].display_order);
      }
    });

    it("filters inactive badges when activeOnly is requested", async () => {
      const all = await TrustBadgeService.listBadges(false);
      await TrustBadgeService.updateBadge(all[0].id, { is_active: false });

      const activeOnly = await TrustBadgeService.listBadges(true);
      expect(activeOnly.length).toBe(3);
      expect(activeOnly.some((b) => b.id === all[0].id)).toBe(false);
    });
  });

  describe("2. Trust Badge CRUD Operations", () => {
    it("creates a new trust badge with auto-generated ID, timestamp, and order", async () => {
      const created = await TrustBadgeService.createBadge({
        title: "100% Desi Heirloom Seeds",
        subtitle: "Lab tested for 98% germination vigor",
        icon_key: "organic-shield",
        cta_route: "/categories/seeds",
      });

      expect(created.id).toBeDefined();
      expect(created.title).toBe("100% Desi Heirloom Seeds");
      expect(created.display_order).toBe(5);
      expect(created.is_active).toBe(true);
    });

    it("updates existing badge details", async () => {
      const all = await TrustBadgeService.listBadges(false);
      const target = all[0];

      const updated = await TrustBadgeService.updateBadge(target.id, {
        title: "100% Organic & Non-GMO (Verified)",
        icon_key: "organic-shield",
      });

      expect(updated).not.toBeNull();
      expect(updated!.title).toBe("100% Organic & Non-GMO (Verified)");

      const retrieved = await TrustBadgeService.getBadge(target.id);
      expect(retrieved?.title).toBe("100% Organic & Non-GMO (Verified)");
    });

    it("deletes a trust badge by ID", async () => {
      const all = await TrustBadgeService.listBadges(false);
      const toDelete = all[all.length - 1];

      const success = await TrustBadgeService.deleteBadge(toDelete.id);
      expect(success).toBe(true);

      const after = await TrustBadgeService.listBadges(false);
      expect(after.length).toBe(all.length - 1);
      expect(after.find((b) => b.id === toDelete.id)).toBeUndefined();
    });

    it("reorders badges correctly", async () => {
      const all = await TrustBadgeService.listBadges(false);
      const reversedIds = all.map((b) => b.id).reverse();

      const reordered = await TrustBadgeService.reorderBadges(reversedIds);
      expect(reordered[0].id).toBe(reversedIds[0]);
      expect(reordered[0].display_order).toBe(1);
      expect(reordered[reordered.length - 1].id).toBe(reversedIds[reversedIds.length - 1]);
    });
  });

  describe("3. Section Theme & Settings Updates", () => {
    it("updates green theme colors and border radius", async () => {
      const updated = await TrustBadgeService.updateSettings({
        bg_color: "#2D6A4F",
        border_radius: 24,
        section_title: "Certified Nursery Guarantees",
      });

      expect(updated.bg_color).toBe("#2D6A4F");
      expect(updated.border_radius).toBe(24);
      expect(updated.section_title).toBe("Certified Nursery Guarantees");

      const fetched = await TrustBadgeService.getSettings();
      expect(fetched.bg_color).toBe("#2D6A4F");
    });
  });
});

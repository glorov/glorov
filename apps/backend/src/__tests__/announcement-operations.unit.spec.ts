import { AnnouncementService, DEFAULT_ANNOUNCEMENT_CONFIG } from "../modules/announcement/announcement-service";
import fs from "node:fs";
import path from "node:path";

describe("Announcement Bar & Marquee Ticker Operations", () => {
  const dataDir = path.resolve(process.cwd(), "data");
  const announcementsFile = path.join(dataDir, "announcements.json");

  beforeEach(async () => {
    // Reset seed data
    await AnnouncementService.seedDefaults(true);
  });

  afterAll(async () => {
    // Restore default state
    await AnnouncementService.seedDefaults(true);
  });

  describe("Storefront Announcement Retrieval", () => {
    it("should retrieve active announcements and bar configuration", async () => {
      const response = await AnnouncementService.getStoreAnnouncements();

      expect(response).toBeDefined();
      expect(response.config).toBeDefined();
      expect(response.config.is_enabled).toBe(true);
      expect(response.config.bg_color).toBe("#1B4332");
      expect(response.items).toBeInstanceOf(Array);
      expect(response.items.length).toBeGreaterThanOrEqual(1);

      // Verify all returned items are active
      response.items.forEach((item) => {
        expect(item.is_active).toBe(true);
      });

      // Verify ₹499 free delivery message exists
      const freeShipping = response.items.find((i) => i.text.includes("₹499"));
      expect(freeShipping).toBeDefined();
      expect(freeShipping?.highlight_text).toContain("499");
    });

    it("should sort active items in ascending display_order", async () => {
      const response = await AnnouncementService.getStoreAnnouncements();

      for (let i = 0; i < response.items.length - 1; i++) {
        expect(response.items[i].display_order).toBeLessThanOrEqual(
          response.items[i + 1].display_order
        );
      }
    });
  });

  describe("Announcement Bar Global Configuration", () => {
    it("should update scroll speed, background color, and status", async () => {
      const updated = await AnnouncementService.updateConfig({
        speed_seconds: 45,
        bg_color: "#7A1C2E", // Festive Crimson Red
        highlight_color: "#FFD51F",
        is_enabled: false,
      });

      expect(updated.speed_seconds).toBe(45);
      expect(updated.bg_color).toBe("#7A1C2E");
      expect(updated.highlight_color).toBe("#FFD51F");
      expect(updated.is_enabled).toBe(false);

      // Verify persistence
      const storeRes = await AnnouncementService.getStoreAnnouncements();
      expect(storeRes.config.speed_seconds).toBe(45);
      expect(storeRes.config.bg_color).toBe("#7A1C2E");
      expect(storeRes.config.is_enabled).toBe(false);
    });

    it("should clamp scroll speed within safe bounds [10, 120]", async () => {
      const minUpdated = await AnnouncementService.updateConfig({ speed_seconds: 2 });
      expect(minUpdated.speed_seconds).toBe(10);

      const maxUpdated = await AnnouncementService.updateConfig({ speed_seconds: 500 });
      expect(maxUpdated.speed_seconds).toBe(120);
    });
  });

  describe("Announcement Item CRUD", () => {
    it("should create a new announcement item", async () => {
      const created = await AnnouncementService.createAnnouncement({
        text: "Limited Time: Free Botanical Gardening Masterclass with any planter purchase!",
        highlight_text: "FREE MASTERCLASS",
        icon: "spa",
        link_url: "/guide",
        display_order: 10,
        is_active: true,
      });

      expect(created.id).toBeDefined();
      expect(created.text).toContain("Free Botanical Gardening Masterclass");
      expect(created.highlight_text).toBe("FREE MASTERCLASS");
      expect(created.display_order).toBe(10);

      const found = await AnnouncementService.getAnnouncementById(created.id);
      expect(found).not.toBeNull();
      expect(found?.text).toBe(created.text);
    });

    it("should update an existing announcement item", async () => {
      const created = await AnnouncementService.createAnnouncement({
        text: "Seasonal Harvest Discount",
        highlight_text: "SALE",
        is_active: true,
      });

      const updated = await AnnouncementService.updateAnnouncement(created.id, {
        text: "Updated: Seasonal Harvest 20% Discount",
        is_active: false,
      });

      expect(updated.text).toBe("Updated: Seasonal Harvest 20% Discount");
      expect(updated.is_active).toBe(false);

      // Inactive item should not appear in storefront list
      const storeRes = await AnnouncementService.getStoreAnnouncements();
      expect(storeRes.items.some((i) => i.id === created.id)).toBe(false);
    });

    it("should delete an announcement item", async () => {
      const created = await AnnouncementService.createAnnouncement({
        text: "Temporary flash announcement",
        is_active: true,
      });

      const deleted = await AnnouncementService.deleteAnnouncement(created.id);
      expect(deleted).toBe(true);

      const found = await AnnouncementService.getAnnouncementById(created.id);
      expect(found).toBeNull();
    });

    it("should return false when deleting non-existent id", async () => {
      const deleted = await AnnouncementService.deleteAnnouncement("non_existent_id");
      expect(deleted).toBe(false);
    });
  });
});

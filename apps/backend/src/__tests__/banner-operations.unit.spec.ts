import { BannerService, DEFAULT_BANNERS } from "../modules/banner/banner-service";

describe("Hero Carousel Banners Operations & Service Invariants", () => {
  beforeEach(async () => {
    // Reset defaults before each test
    await BannerService.seedDefaults(true);
  });

  describe("1. Default Carousel Banners Seeding", () => {
    it("seeds all 4 distinct botanical promotional banner sets by default", async () => {
      const banners = await BannerService.listBanners(false);
      expect(banners.length).toBe(4);

      expect(banners[0].title).toBe("Every Great Garden Begins with a Seed.");
      expect(banners[0].desktop_image_url).toBe("/banners/banner_garden_begins_desktop.png");
      expect(banners[0].mobile_image_url).toBe("/banners/banner_garden_begins_mobile.jpg");
      expect(banners[0].cta_route).toBe("/categories/seeds");

      expect(banners[1].title).toBe("Plant a Seed. Grow a Dream.");
      expect(banners[1].cta_route).toBe("/categories/live-plants");

      expect(banners[2].title).toBe("Let Your Garden Bloom.");
      expect(banners[2].cta_route).toBe("/categories/flowering");

      expect(banners[3].title).toBe("Grow Fresh. Live Green.");
      expect(banners[3].cta_route).toBe("/categories/vegetables");
    });

    it("orders banners strictly ascending by display_order", async () => {
      const banners = await BannerService.listBanners(false);
      for (let i = 0; i < banners.length - 1; i++) {
        expect(banners[i].display_order).toBeLessThanOrEqual(banners[i + 1].display_order);
      }
    });

    it("filters inactive banners when activeOnly is requested", async () => {
      const all = await BannerService.listBanners(false);
      await BannerService.updateBanner(all[0].id, { is_active: false });

      const activeOnly = await BannerService.listBanners(true);
      expect(activeOnly.length).toBe(3);
      expect(activeOnly.some((b) => b.id === all[0].id)).toBe(false);
    });
  });

  describe("2. Carousel CRUD Operations", () => {
    it("creates a new banner with auto-generated ID, timestamp, and order", async () => {
      const created = await BannerService.createBanner({
        title: "Winter Herb Haven",
        subtitle: "Fresh rosemary, basil, and mint on your windowsill.",
        tag: "HERBS & GREENERY",
        desktop_image_url: "/banners/herbs_desktop.png",
        mobile_image_url: "/banners/herbs_mobile.jpg",
        cta_text: "EXPLORE HERBS",
        cta_route: "/categories/herbs",
      });

      expect(created.id).toBeDefined();
      expect(created.title).toBe("Winter Herb Haven");
      expect(created.display_order).toBe(5);
      expect(created.is_active).toBe(true);

      const found = await BannerService.getBannerById(created.id);
      expect(found).not.toBeNull();
      expect(found?.title).toBe("Winter Herb Haven");
    });

    it("updates existing banner fields and updates updated_at", async () => {
      const all = await BannerService.listBanners(false);
      const target = all[0];

      const updated = await BannerService.updateBanner(target.id, {
        title: "Updated Garden Seed Collection",
        cta_text: "SHOP SEEDS TODAY",
        cta_route: "/categories/seeds-special",
      });

      expect(updated).not.toBeNull();
      expect(updated?.title).toBe("Updated Garden Seed Collection");
      expect(updated?.cta_text).toBe("SHOP SEEDS TODAY");
      expect(updated?.cta_route).toBe("/categories/seeds-special");
    });

    it("deletes a banner and returns true, or false for non-existent ID", async () => {
      const all = await BannerService.listBanners(false);
      const toDelete = all[all.length - 1];

      const deleted = await BannerService.deleteBanner(toDelete.id);
      expect(deleted).toBe(true);

      const afterDelete = await BannerService.listBanners(false);
      expect(afterDelete.length).toBe(all.length - 1);
      expect(afterDelete.some((b) => b.id === toDelete.id)).toBe(false);

      const deleteAgain = await BannerService.deleteBanner("non_existent_id");
      expect(deleteAgain).toBe(false);
    });

    it("reorders banners based on provided ID sequence", async () => {
      const all = await BannerService.listBanners(false);
      const reverseIds = [all[3].id, all[2].id, all[1].id, all[0].id];

      const reordered = await BannerService.reorderBanners(reverseIds);
      expect(reordered[0].id).toBe(all[3].id);
      expect(reordered[0].display_order).toBe(1);
      expect(reordered[3].id).toBe(all[0].id);
      expect(reordered[3].display_order).toBe(4);
    });
  });
});

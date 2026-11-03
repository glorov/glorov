import { OfferService, DEFAULT_OFFERS } from "../modules/offer/offer-service";
import { config as offersAdminRouteConfig } from "../admin/routes/offers/page";

describe("Promotional Offers Operations & Service Invariants", () => {
  beforeEach(async () => {
    // Reset defaults before each test
    await OfferService.seedDefaults(true);
  });

  describe("0. Medusa Admin Route Registration", () => {
    it("registers OffersAdminPage with label 'Offers & Promos' and valid icon", () => {
      expect(offersAdminRouteConfig).toBeDefined();
      expect(offersAdminRouteConfig.label).toBe("Offers & Promos");
      expect(offersAdminRouteConfig.icon).toBeDefined();
    });
  });

  describe("1. Default Offers Seeding & Structure", () => {
    it("seeds default botanical promotional offers with welcome offer highlighted", async () => {
      const offers = await OfferService.listOffers(false);
      expect(offers.length).toBe(5);

      // Welcome offer invariant check (matches user's screenshot exactly)
      const welcome = offers.find((o) => o.code === "GLOROV10");
      expect(welcome).toBeDefined();
      expect(welcome?.tag).toBe("SPECIAL WELCOME OFFER");
      expect(welcome?.description).toBe(
        "Flat 10% Off on your first order of heirloom seeds, indoor plants & glazed planters."
      );
      expect(welcome?.discount_badge).toBe("10% OFF");
      expect(welcome?.discount_value).toBe(10);
      expect(welcome?.is_active).toBe(true);
      expect(welcome?.icon).toBe("card_giftcard");
    });

    it("orders offers strictly ascending by display_order", async () => {
      const offers = await OfferService.listOffers(false);
      for (let i = 0; i < offers.length - 1; i++) {
        expect(offers[i].display_order).toBeLessThanOrEqual(offers[i + 1].display_order);
      }
    });

    it("filters inactive offers when activeOnly is requested", async () => {
      const all = await OfferService.listOffers(false);
      await OfferService.updateOffer(all[0].id, { is_active: false });

      const activeOnly = await OfferService.listOffers(true);
      expect(activeOnly.length).toBe(4);
      expect(activeOnly.some((o) => o.id === all[0].id)).toBe(false);
    });

    it("retrieves the active highlighted welcome offer correctly", async () => {
      const highlighted = await OfferService.getHighlightedOffer();
      expect(highlighted).not.toBeNull();
      expect(highlighted?.code).toBe("GLOROV10");
      expect(highlighted?.is_highlighted).toBe(true);
      expect(highlighted?.is_active).toBe(true);
    });
  });

  describe("2. Offer CRUD Operations", () => {
    it("creates a new offer with uppercase clean code, auto-id, and timestamp", async () => {
      const created = await OfferService.createOffer({
        code: "festive25",
        title: "Diwali Botanical Festival",
        tag: "FESTIVE LIGHT & LEAF",
        description: "Flat 25% off all brass planters and auspicious indoor plants.",
        discount_badge: "25% OFF",
        discount_type: "percentage",
        discount_value: 25,
        min_spend: 1499,
        category: "sitewide",
      });

      expect(created.id).toBeDefined();
      expect(created.code).toBe("FESTIVE25");
      expect(created.title).toBe("Diwali Botanical Festival");
      expect(created.tag).toBe("FESTIVE LIGHT & LEAF");
      expect(created.display_order).toBe(6);
      expect(created.is_active).toBe(true);
      expect(created.created_at).toBeDefined();
    });

    it("enforces single highlighted offer when new offer is marked highlighted", async () => {
      const previousHighlighted = await OfferService.getHighlightedOffer();
      expect(previousHighlighted?.code).toBe("GLOROV10");

      const newHeroOffer = await OfferService.createOffer({
        code: "EXCLUSIVE50",
        title: "VIP Plant Parent Exclusive",
        tag: "EXCLUSIVE VIP OFFER",
        description: "Save ₹500 on premium exotic live foliage specimen collection.",
        discount_badge: "₹500 OFF",
        discount_type: "fixed",
        discount_value: 500,
        is_highlighted: true,
      });

      const currentHighlighted = await OfferService.getHighlightedOffer();
      expect(currentHighlighted?.id).toBe(newHeroOffer.id);
      expect(currentHighlighted?.code).toBe("EXCLUSIVE50");

      // Verify previously highlighted offer was unmarked
      const oldOffer = await OfferService.getOfferById("offer_welcome_glorov10");
      expect(oldOffer?.is_highlighted).toBe(false);
    });

    it("updates existing offer fields and persists changes", async () => {
      const updated = await OfferService.updateOffer("offer_welcome_glorov10", {
        description: "Special promotion: get 15% discount on all seeds and live plants.",
        discount_badge: "15% OFF",
        discount_value: 15,
      });

      expect(updated).not.toBeNull();
      expect(updated?.description).toBe("Special promotion: get 15% discount on all seeds and live plants.");
      expect(updated?.discount_badge).toBe("15% OFF");
      expect(updated?.discount_value).toBe(15);

      const fetched = await OfferService.getOfferById("offer_welcome_glorov10");
      expect(fetched?.discount_badge).toBe("15% OFF");
    });

    it("deletes an offer and removes it from store", async () => {
      const success = await OfferService.deleteOffer("offer_seeds_heirloom20");
      expect(success).toBe(true);

      const offers = await OfferService.listOffers(false);
      expect(offers.length).toBe(4);
      expect(offers.some((o) => o.id === "offer_seeds_heirloom20")).toBe(false);

      const deleted = await OfferService.getOfferById("offer_seeds_heirloom20");
      expect(deleted).toBeNull();
    });

    it("returns null when updating non-existent offer", async () => {
      const res = await OfferService.updateOffer("non_existent_id", { title: "Test" });
      expect(res).toBeNull();
    });

    it("returns false when deleting non-existent offer", async () => {
      const res = await OfferService.deleteOffer("non_existent_id");
      expect(res).toBe(false);
    });
  });

  describe("3. Resilience & Invariants", () => {
    it("handles getHighlightedOffer gracefully when all offers are inactive", async () => {
      const all = await OfferService.listOffers(false);
      for (const o of all) {
        await OfferService.updateOffer(o.id, { is_active: false });
      }

      const highlighted = await OfferService.getHighlightedOffer();
      expect(highlighted).toBeNull();
    });

    it("falls back to first active offer if no active offer is explicitly highlighted", async () => {
      await OfferService.updateOffer("offer_welcome_glorov10", { is_highlighted: false });
      const highlighted = await OfferService.getHighlightedOffer();
      expect(highlighted).not.toBeNull();
    });
  });

  describe("4. Coupon Validation & Milestone Progression Logic", () => {
    it("validates DIWALI10 successfully when cart meets ₹999 minimum spend", async () => {
      const res = await OfferService.validateCoupon("DIWALI10", 1069);
      expect(res.valid).toBe(true);
      expect(res.discount_amount).toBe(107); // 10% of 1069 rounded
      expect(res.offer?.code).toBe("DIWALI10");
      expect(res.next_tier).toBeDefined();
      expect(res.next_tier?.code).toBe("DIWALI15");
      expect(res.next_tier?.target_spend).toBe(1599);
      expect(res.next_tier?.needed).toBe(530); // 1599 - 1069
    });

    it("rejects DIWALI10 when cart subtotal is below ₹999 and reports exact needed amount", async () => {
      const res = await OfferService.validateCoupon("DIWALI10", 693);
      expect(res.valid).toBe(false);
      expect(res.needed).toBe(306); // 999 - 693 = 306 (matches screenshot #2)
      expect(res.error).toContain("306");
    });

    it("is case-insensitive and trims whitespace on coupon codes", async () => {
      const res = await OfferService.validateCoupon("  diwali15  ", 1600);
      expect(res.valid).toBe(true);
      expect(res.discount_percent).toBe(15);
      expect(res.discount_amount).toBe(240); // 15% of 1600
    });

    it("rejects non-existent or blank coupon codes cleanly", async () => {
      const res1 = await OfferService.validateCoupon("INVALIDCODE99", 5000);
      expect(res1.valid).toBe(false);
      expect(res1.error).toContain("invalid");

      const res2 = await OfferService.validateCoupon("", 5000);
      expect(res2.valid).toBe(false);
    });
  });
});

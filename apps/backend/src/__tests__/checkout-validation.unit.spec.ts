import { CheckoutValidationService } from "../modules/checkout/checkout-validation-service";
import { OfferService } from "../modules/offer/offer-service";

describe("Authoritative Checkout & Category Offer Validation Service", () => {
  beforeEach(async () => {
    await OfferService.seedDefaults(true);
  });

  describe("1. Category-Based Offer Validation", () => {
    it("successfully applies HEIRLOOM20 when cart contains seeds meeting min spend", async () => {
      const result = await CheckoutValidationService.validateCheckout({
        items: [
          { productId: "glr-seed-01", title: "Green Chilli Seeds", category: "seeds", quantity: 7, clientPrice: 79 },
        ],
        couponCode: "HEIRLOOM20",
        paymentMethod: "upi",
      });

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.verifiedCart.subtotal).toBe(553);
      expect(result.verifiedCart.discountAmount).toBe(Math.round(553 * 0.2));
      expect(result.verifiedCart.appliedOffer?.code).toBe("HEIRLOOM20");
    });

    it("rejects HEIRLOOM20 when cart contains ONLY planters (no seeds)", async () => {
      const result = await CheckoutValidationService.validateCheckout({
        items: [
          { productId: "glr-pot-02", title: "Diamond Ceramic Planter", category: "planters", quantity: 2, clientPrice: 449 },
        ],
        couponCode: "HEIRLOOM20",
        paymentMethod: "card",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.toLowerCase().includes("only valid for seeds"))).toBe(true);
      expect(result.verifiedCart.discountAmount).toBe(0);
    });

    it("calculates discount ONLY on eligible seeds when cart has mixed seeds and planters", async () => {
      const result = await CheckoutValidationService.validateCheckout({
        items: [
          { productId: "glr-seed-01", title: "Green Chilli Seeds", category: "seeds", quantity: 7, clientPrice: 79 }, // 553
          { productId: "glr-pot-01", title: "Artisan Terracotta Pot", category: "planters", quantity: 2, clientPrice: 249 }, // 498
        ],
        couponCode: "HEIRLOOM20",
        paymentMethod: "upi",
      });

      expect(result.valid).toBe(true);
      expect(result.verifiedCart.subtotal).toBe(553 + 498);
      // Discount must be 20% of 553 (seeds only), NOT 20% of 1051!
      expect(result.verifiedCart.discountAmount).toBe(Math.round(553 * 0.2));
      expect(result.verifiedCart.appliedOffer?.eligibleSubtotal).toBe(553);
    });
  });

  describe("2. Hacker Prevention: Quantity & Stock Verification", () => {
    it("rejects negative or zero quantities", async () => {
      const result = await CheckoutValidationService.validateCheckout({
        items: [
          { productId: "glr-seed-01", title: "Green Chilli Seeds", quantity: -3, clientPrice: 79 },
        ],
        paymentMethod: "upi",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("must be a positive integer"))).toBe(true);
    });

    it("rejects fractional or floating point quantities", async () => {
      const result = await CheckoutValidationService.validateCheckout({
        items: [
          { productId: "glr-seed-01", title: "Green Chilli Seeds", quantity: 1.5, clientPrice: 79 },
        ],
        paymentMethod: "upi",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("must be a positive integer"))).toBe(true);
    });

    it("rejects quantities exceeding maximum allowed purchase limit (50 units)", async () => {
      const result = await CheckoutValidationService.validateCheckout({
        items: [
          { productId: "glr-seed-01", title: "Green Chilli Seeds", quantity: 999, clientPrice: 79 },
        ],
        paymentMethod: "upi",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Maximum 50 units allowed"))).toBe(true);
    });
  });

  describe("3. Price Tampering Prevention", () => {
    it("recalculates price from authoritative catalog when client sends tampered price", async () => {
      const result = await CheckoutValidationService.validateCheckout({
        items: [
          { productId: "glr-plant-01", title: "Monstera Deliciosa", quantity: 1, clientPrice: 1 }, // Hacker tries ₹1
        ],
        paymentMethod: "upi",
      });

      expect(result.valid).toBe(true);
      // Real price is ₹549
      expect(result.verifiedCart.items[0].unitPrice).toBe(549);
      expect(result.verifiedCart.subtotal).toBe(549);
      expect(result.warnings.some((w) => w.includes("Price updated"))).toBe(true);
    });
  });

  describe("4. Payment Method Validation & COD Fraud Control", () => {
    it("rejects unsupported or malicious payment methods", async () => {
      const result = await CheckoutValidationService.validateCheckout({
        items: [
          { productId: "glr-seed-01", title: "Green Chilli Seeds", quantity: 2, clientPrice: 79 },
        ],
        paymentMethod: "bitcoin_hacked",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Unsupported payment method"))).toBe(true);
    });

    it("rejects Cash on Delivery (COD) for high-value orders exceeding ₹5,000", async () => {
      const result = await CheckoutValidationService.validateCheckout({
        items: [
          // 12 x 449 = 5388 (exceeds ₹5,000 limit)
          { productId: "glr-pot-02", title: "Diamond Glazed Ceramic Planter", quantity: 12, clientPrice: 449 },
        ],
        paymentMethod: "cod",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Cash on Delivery (COD) is restricted to orders up to ₹5,000"))).toBe(true);
    });

    it("accepts Cash on Delivery (COD) for orders within the ₹5,000 threshold", async () => {
      const result = await CheckoutValidationService.validateCheckout({
        items: [
          { productId: "glr-seed-01", title: "Green Chilli Seeds", quantity: 4, clientPrice: 79 },
        ],
        paymentMethod: "cod",
      });

      expect(result.valid).toBe(true);
      expect(result.verifiedCart.paymentMethod.valid).toBe(true);
    });
  });
});

import {
  RecommendationService,
  CATALOG_RECOMMENDATIONS,
} from "../modules/recommendations/recommendation-service";

describe("RecommendationService Unit Tests", () => {
  it("provides rich curated botanical catalog recommendations", () => {
    expect(CATALOG_RECOMMENDATIONS.length).toBeGreaterThanOrEqual(5);
    const npk = CATALOG_RECOMMENDATIONS.find(
      (p) => p.handle === "instagrow-npk-19-19-19-fertilizer"
    );
    expect(npk).toBeDefined();
    expect(npk?.price).toBe(169);
    expect(npk?.compare_at_price).toBe(399);
    expect(npk?.rating).toBe(4.8);
    expect(npk?.badge).toBe("BESTSELLER");

    const jade = CATALOG_RECOMMENDATIONS.find((p) => p.handle === "jade-plant-mini");
    expect(jade).toBeDefined();
    expect(jade?.price).toBe(199);
    expect(jade?.rating).toBe(4.8);
  });

  it("filters out products that are already in the cart", () => {
    const recs = RecommendationService.getCartRecommendations({
      cartProductHandles: ["jade-plant-mini"],
      cartProductTitles: ["Jade Mini Plant"],
    });

    expect(recs.some((p) => p.handle === "jade-plant-mini")).toBe(false);
  });

  it("boosts plant care fertilizer and soil when seeds are in the cart", () => {
    const recs = RecommendationService.getCartRecommendations({
      cartProductHandles: ["cosmos-mix-seeds"],
      cartProductTitles: ["Cosmos Mix Seeds 1 gm"],
      limit: 3,
    });

    expect(recs.length).toBe(3);
    // Should prioritize fertilizer/care products for seeds
    const careItem = recs.find((r) => r.category === "care");
    expect(careItem).toBeDefined();
    expect(careItem?.handle).toBe("instagrow-npk-19-19-19-fertilizer");
  });

  it("boosts categories based on past purchased customer profile", () => {
    const recs = RecommendationService.getCartRecommendations({
      cartProductHandles: [],
      pastPurchasedCategories: ["plants"],
      limit: 4,
    });

    expect(recs.length).toBe(4);
    expect(recs.some((r) => r.category === "plants")).toBe(true);
  });
});

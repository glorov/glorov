import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { RecommendationService } from "../../../modules/recommendations/recommendation-service";
import { sendSanitizedError } from "../../../utils/error-handler";

/**
 * GET /store/recommendations
 * Query parameters:
 *  - handles: comma-separated handles of items currently in cart
 *  - titles: comma-separated titles of items currently in cart
 *  - categories: comma-separated past purchased categories (e.g. seeds, plants)
 *  - limit: number of recommendations to return (default 6)
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const rawHandles = (req.query?.handles as string) || "";
    const rawTitles = (req.query?.titles as string) || "";
    const rawCategories = (req.query?.categories as string) || "";
    const limit = req.query?.limit ? parseInt(req.query.limit as string, 10) : 6;

    const cartProductHandles = rawHandles
      ? rawHandles.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const cartProductTitles = rawTitles
      ? rawTitles.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const pastPurchasedCategories = rawCategories
      ? rawCategories.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const recommendations = RecommendationService.getCartRecommendations({
      cartProductHandles,
      cartProductTitles,
      pastPurchasedCategories,
      limit,
    });

    res.status(200).json({
      success: true,
      recommendations,
      count: recommendations.length,
    });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

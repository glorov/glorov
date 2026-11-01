import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ReviewService } from "../../../modules/review/review-service";
import { sendSanitizedError } from "../../../utils/error-handler";

/**
 * GET /store/reviews?product_id=...&sort=...&rating=...
 * Returns verified customer reviews and rating breakdown for the specified product.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const productId =
      (req.query.product_id as string) || (req.query.productId as string);

    if (!productId) {
      res.status(400).json({
        message: "product_id query parameter is required",
      });
      return;
    }

    const sort = (req.query.sort as string) || "Most Recent";
    const ratingStr = req.query.rating as string;
    const ratingFilter = ratingStr ? parseInt(ratingStr, 10) : undefined;

    const reviews = ReviewService.listReviews(productId, sort, ratingFilter);
    const summary = ReviewService.getSummary(productId);

    res.status(200).json({
      product_id: productId,
      reviews,
      summary,
      count: reviews.length,
    });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

/**
 * POST /store/reviews
 * Submits a new customer review for a botanical product.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = req.body as any;
    const productId = body.productId || body.product_id;
    const author = body.author;
    const rating = body.rating;
    const title = body.title;
    const content = body.content || body.reviewText;

    if (!productId || !title || !content || rating === undefined) {
      res.status(400).json({
        message:
          "Missing required fields: productId, title, content, and rating are required.",
      });
      return;
    }

    const created = ReviewService.createReview({
      productId,
      author: author || "Verified Buyer",
      avatarUrl: body.avatarUrl || body.avatar_url,
      rating: Number(rating),
      title: String(title),
      content: String(content),
      images: Array.isArray(body.images) ? body.images : [],
    });

    const updatedSummary = ReviewService.getSummary(productId);

    res.status(201).json({
      message: "Review submitted successfully",
      review: created,
      summary: updatedSummary,
    });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

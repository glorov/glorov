import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ReviewService } from "../../../../../modules/review/review-service";
import { sendSanitizedError } from "../../../../../utils/error-handler";

/**
 * POST /store/reviews/:id/helpful
 * Increments the helpful thumbs-up vote count for a review.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const reviewId = req.params.id;
    if (!reviewId) {
      res.status(400).json({ message: "Review id is required" });
      return;
    }

    const success = ReviewService.markHelpful(reviewId);
    if (!success) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    res.status(200).json({
      message: "Helpful vote recorded",
      reviewId,
      success: true,
    });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

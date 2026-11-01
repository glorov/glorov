import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { OfferService } from "../../../../modules/offer/offer-service";
import { sendSanitizedError } from "../../../../utils/error-handler";

/**
 * POST /admin/offers/seed
 * Resets offers to default botanical campaigns.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const offers = await OfferService.seedDefaults(true);
    res.status(200).json({
      offers,
      count: offers.length,
      message: "Default botanical promotional offers restored successfully.",
    });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

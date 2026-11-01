import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { TrustBadgeService } from "../../../modules/trust-badge/trust-badge-service";
import { sendSanitizedError } from "../../../utils/error-handler";

/**
 * GET /store/trust-badges
 * Public endpoint that returns active trust badges and current section styling.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    const badges = await TrustBadgeService.listBadges(true);
    const settings = await TrustBadgeService.getSettings();

    res.status(200).json({
      badges,
      settings,
      count: badges.length,
    });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { TrustBadgeService } from "../../../../modules/trust-badge/trust-badge-service";
import { sendSanitizedError } from "../../../../utils/error-handler";

/**
 * POST /admin/trust-badges/reorder
 * Reorders trust badges based on array of IDs.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = req.body as Record<string, any>;
    if (!body || !Array.isArray(body.ids)) {
      res.status(400).json({ message: "Field 'ids' must be an array of trust badge IDs." });
      return;
    }

    const badges = await TrustBadgeService.reorderBadges(body.ids);
    res.status(200).json({ badges, message: "Trust badges reordered successfully." });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

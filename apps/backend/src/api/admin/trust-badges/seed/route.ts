import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { TrustBadgeService } from "../../../../modules/trust-badge/trust-badge-service";
import { sendSanitizedError } from "../../../../utils/error-handler";

/**
 * POST /admin/trust-badges/seed
 * Resets trust badges and section settings to default.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const result = await TrustBadgeService.seedDefaults(true);
    res.status(200).json({
      badges: result.badges,
      settings: result.settings,
      message: "Trust badges reset to botanical defaults successfully.",
    });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

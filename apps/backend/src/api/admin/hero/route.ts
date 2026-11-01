import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HeroService } from "../../../modules/hero/hero-service";
import { sendSanitizedError } from "../../../utils/error-handler";

/**
 * GET /admin/hero
 * Fetch botanical hero showcase configuration for Medusa admin.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const hero = await HeroService.getHeroConfig();
    res.status(200).json({ hero });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

/**
 * POST /admin/hero
 * Update botanical hero showcase configuration from Medusa admin.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = (req.body as Record<string, unknown>) || {};
    const updated = await HeroService.updateHeroConfig(body);
    res.status(200).json({ hero: updated, message: "Hero configuration updated successfully" });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

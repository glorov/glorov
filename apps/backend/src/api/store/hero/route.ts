import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HeroService } from "../../../modules/hero/hero-service";
import { sendSanitizedError } from "../../../utils/error-handler";

/**
 * GET /store/hero
 * Returns current botanical hero showcase configuration.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    const hero = await HeroService.getHeroConfig();
    res.status(200).json({ hero });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { BannerService } from "../../../../modules/banner/banner-service";
import { sendSanitizedError } from "../../../../utils/error-handler";

/**
 * POST /admin/banners/seed
 * Force re-seeds the 4 default carousel banners into database/storage.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const banners = await BannerService.seedDefaults(true);
    res.status(200).json({
      banners,
      count: banners.length,
      message: "Seeded 4 default hero carousel banners successfully.",
    });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

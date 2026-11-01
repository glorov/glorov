import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { BannerService } from "../../../modules/banner/banner-service";
import { sendSanitizedError } from "../../../utils/error-handler";

/**
 * GET /store/banners
 * Returns active carousel banners sorted by display order.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    const banners = await BannerService.listBanners(true);
    res.status(200).json({ banners, count: banners.length });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

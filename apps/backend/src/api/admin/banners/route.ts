import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { BannerService } from "../../../modules/banner/banner-service";
import { sendSanitizedError } from "../../../utils/error-handler";

/**
 * GET /admin/banners
 * Returns all carousel banners sorted by display order.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const banners = await BannerService.listBanners(false);
    res.status(200).json({ banners, count: banners.length });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

/**
 * POST /admin/banners
 * Creates a new carousel banner.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = req.body as Record<string, any>;
    if (!body || !body.title || !body.desktop_image_url) {
      res.status(400).json({
        message: "Fields 'title' and 'desktop_image_url' are required.",
      });
      return;
    }

    const banner = await BannerService.createBanner({
      title: body.title,
      subtitle: body.subtitle,
      tag: body.tag,
      desktop_image_url: body.desktop_image_url,
      mobile_image_url: body.mobile_image_url,
      cta_text: body.cta_text,
      cta_route: body.cta_route,
      cta_arguments: body.cta_arguments,
      display_order: body.display_order ? Number(body.display_order) : undefined,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      bg_color: body.bg_color,
    });

    res.status(201).json({ banner, message: "Banner created successfully." });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

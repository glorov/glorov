import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { BannerService } from "../../../../modules/banner/banner-service";
import { sendSanitizedError } from "../../../../utils/error-handler";

/**
 * GET /admin/banners/:id
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Banner ID is required." });
      return;
    }

    const banner = await BannerService.getBannerById(id);
    if (!banner) {
      res.status(404).json({ message: `Banner with ID '${id}' not found.` });
      return;
    }

    res.status(200).json({ banner });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

/**
 * POST /admin/banners/:id
 * Updates existing banner.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Banner ID is required." });
      return;
    }

    const body = req.body as Record<string, any>;
    const updated = await BannerService.updateBanner(id, {
      title: body.title,
      subtitle: body.subtitle,
      tag: body.tag,
      desktop_image_url: body.desktop_image_url,
      mobile_image_url: body.mobile_image_url,
      cta_text: body.cta_text,
      cta_route: body.cta_route,
      cta_arguments: body.cta_arguments,
      display_order: body.display_order !== undefined ? Number(body.display_order) : undefined,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : undefined,
      bg_color: body.bg_color,
    });

    if (!updated) {
      res.status(404).json({ message: `Banner with ID '${id}' not found.` });
      return;
    }

    res.status(200).json({ banner: updated, message: "Banner updated successfully." });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

/**
 * DELETE /admin/banners/:id
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Banner ID is required." });
      return;
    }

    const deleted = await BannerService.deleteBanner(id);
    if (!deleted) {
      res.status(404).json({ message: `Banner with ID '${id}' not found.` });
      return;
    }

    res.status(200).json({ id, message: "Banner deleted successfully." });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

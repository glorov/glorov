import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { TrustBadgeService } from "../../../modules/trust-badge/trust-badge-service";
import { sendSanitizedError } from "../../../utils/error-handler";

/**
 * GET /admin/trust-badges
 * Returns all trust badges and current section settings.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const badges = await TrustBadgeService.listBadges(false);
    const settings = await TrustBadgeService.getSettings();
    res.status(200).json({ badges, settings, count: badges.length });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

/**
 * POST /admin/trust-badges
 * Creates a new trust badge item.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = req.body as Record<string, any>;
    if (!body || !body.title) {
      res.status(400).json({
        message: "Field 'title' is required.",
      });
      return;
    }

    const badge = await TrustBadgeService.createBadge({
      title: body.title,
      subtitle: body.subtitle,
      icon_key: body.icon_key,
      custom_icon_svg: body.custom_icon_svg,
      cta_route: body.cta_route,
      display_order: body.display_order !== undefined ? Number(body.display_order) : undefined,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
    });

    res.status(201).json({ badge, message: "Trust badge created successfully." });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

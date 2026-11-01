import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { TrustBadgeService } from "../../../../modules/trust-badge/trust-badge-service";
import { sendSanitizedError } from "../../../../utils/error-handler";

/**
 * GET /admin/trust-badges/settings
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const settings = await TrustBadgeService.getSettings();
    res.status(200).json({ settings });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

/**
 * POST /admin/trust-badges/settings
 * Updates section appearance settings (green color, text color, border radius, etc.)
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = req.body as Record<string, any>;
    const updated = await TrustBadgeService.updateSettings({
      bg_color: body.bg_color,
      text_color: body.text_color,
      icon_bg_color: body.icon_bg_color,
      icon_color: body.icon_color,
      divider_color: body.divider_color,
      border_radius: body.border_radius !== undefined ? Number(body.border_radius) : undefined,
      is_visible: body.is_visible !== undefined ? Boolean(body.is_visible) : undefined,
      section_title: body.section_title,
      section_subtitle: body.section_subtitle,
    });

    res.status(200).json({ settings: updated, message: "Trust section settings updated successfully." });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

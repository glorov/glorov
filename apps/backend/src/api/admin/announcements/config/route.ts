import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AnnouncementService } from "../../../../modules/announcement/announcement-service";
import { sendSanitizedError } from "../../../../utils/error-handler";

/**
 * PUT /admin/announcements/config
 * Updates announcement bar global settings (enable/disable, speed, colors, hover pause).
 */
export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = (req.body || {}) as Record<string, any>;

    const updatedConfig = await AnnouncementService.updateConfig({
      is_enabled: body.is_enabled !== undefined ? Boolean(body.is_enabled) : undefined,
      speed_seconds: body.speed_seconds !== undefined ? Number(body.speed_seconds) : undefined,
      bg_color: body.bg_color,
      text_color: body.text_color,
      highlight_color: body.highlight_color,
      pause_on_hover: body.pause_on_hover !== undefined ? Boolean(body.pause_on_hover) : undefined,
    });

    res.status(200).json({
      config: updatedConfig,
      message: "Announcement bar configuration updated successfully.",
    });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

/**
 * POST /admin/announcements/config
 * Alias for PUT to seamlessly support clients sending POST.
 */
export const POST = PUT;

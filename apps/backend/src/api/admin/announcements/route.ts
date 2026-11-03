import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AnnouncementService } from "../../../modules/announcement/announcement-service";
import { sendSanitizedError } from "../../../utils/error-handler";

/**
 * GET /admin/announcements
 * Returns full announcement bar configuration and all items (including inactive).
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const data = await AnnouncementService.getAllAdminAnnouncements();
    res.status(200).json({
      config: data.config,
      items: data.items,
      count: data.items.length,
    });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

/**
 * POST /admin/announcements
 * Creates a new marquee announcement item.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = req.body as Record<string, any>;
    if (!body || !body.text) {
      res.status(400).json({
        message: "Field 'text' is required.",
      });
      return;
    }

    const item = await AnnouncementService.createAnnouncement({
      text: body.text,
      highlight_text: body.highlight_text,
      badge_color: body.badge_color,
      badge_text_color: body.badge_text_color,
      icon: body.icon,
      link_url: body.link_url,
      display_order: body.display_order !== undefined ? Number(body.display_order) : undefined,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
    });

    res.status(201).json({ item, message: "Announcement item created successfully." });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

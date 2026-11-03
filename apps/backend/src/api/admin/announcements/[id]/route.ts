import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AnnouncementService } from "../../../../modules/announcement/announcement-service";
import { sendSanitizedError } from "../../../../utils/error-handler";

/**
 * GET /admin/announcements/:id
 * Fetches an announcement item by ID.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id } = req.params;
    const item = await AnnouncementService.getAnnouncementById(id);

    if (!item) {
      res.status(404).json({ message: `Announcement with id '${id}' not found.` });
      return;
    }

    res.status(200).json({ item });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

/**
 * PUT /admin/announcements/:id
 * Updates an announcement item.
 */
export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id } = req.params;
    const body = req.body as Record<string, any>;

    const updated = await AnnouncementService.updateAnnouncement(id, {
      text: body.text,
      highlight_text: body.highlight_text,
      badge_color: body.badge_color,
      badge_text_color: body.badge_text_color,
      icon: body.icon,
      link_url: body.link_url,
      display_order: body.display_order !== undefined ? Number(body.display_order) : undefined,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : undefined,
    });

    res.status(200).json({ item: updated, message: "Announcement updated successfully." });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

/**
 * POST /admin/announcements/:id
 * Alias for PUT to seamlessly support clients sending POST.
 */
export const POST = PUT;

/**
 * DELETE /admin/announcements/:id
 * Deletes an announcement item.
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id } = req.params;
    const deleted = await AnnouncementService.deleteAnnouncement(id);

    if (!deleted) {
      res.status(404).json({ message: `Announcement with id '${id}' not found.` });
      return;
    }

    res.status(200).json({ message: "Announcement deleted successfully.", id });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

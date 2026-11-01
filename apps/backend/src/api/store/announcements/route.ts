import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AnnouncementService } from "../../../modules/announcement/announcement-service";
import { sendSanitizedError } from "../../../utils/error-handler";

/**
 * GET /store/announcements
 * Returns active announcement bar configuration and active marquee ticker items.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const data = await AnnouncementService.getStoreAnnouncements();
    res.status(200).json({
      config: data.config,
      items: data.items,
      count: data.items.length,
    });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

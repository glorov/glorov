import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { TrustBadgeService } from "../../../../modules/trust-badge/trust-badge-service";
import { sendSanitizedError } from "../../../../utils/error-handler";

/**
 * GET /admin/trust-badges/:id
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Trust badge ID is required." });
      return;
    }

    const badge = await TrustBadgeService.getBadge(id);
    if (!badge) {
      res.status(404).json({ message: `Trust badge with ID '${id}' not found.` });
      return;
    }

    res.status(200).json({ badge });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

/**
 * POST /admin/trust-badges/:id
 * Updates an existing trust badge.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Trust badge ID is required." });
      return;
    }

    const body = req.body as Record<string, any>;
    const updated = await TrustBadgeService.updateBadge(id, {
      title: body.title,
      subtitle: body.subtitle,
      icon_key: body.icon_key,
      custom_icon_svg: body.custom_icon_svg,
      cta_route: body.cta_route,
      display_order: body.display_order !== undefined ? Number(body.display_order) : undefined,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : undefined,
    });

    if (!updated) {
      res.status(404).json({ message: `Trust badge with ID '${id}' not found.` });
      return;
    }

    res.status(200).json({ badge: updated, message: "Trust badge updated successfully." });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

/**
 * DELETE /admin/trust-badges/:id
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Trust badge ID is required." });
      return;
    }

    const deleted = await TrustBadgeService.deleteBadge(id);
    if (!deleted) {
      res.status(404).json({ message: `Trust badge with ID '${id}' not found.` });
      return;
    }

    res.status(200).json({ id, message: "Trust badge deleted successfully." });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

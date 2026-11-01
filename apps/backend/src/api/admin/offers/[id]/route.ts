import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { OfferService } from "../../../../modules/offer/offer-service";
import { sendSanitizedError } from "../../../../utils/error-handler";

/**
 * GET /admin/offers/:id
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Offer ID is required." });
      return;
    }

    const offer = await OfferService.getOfferById(id);
    if (!offer) {
      res.status(404).json({ message: `Offer with ID '${id}' not found.` });
      return;
    }

    res.status(200).json({ offer });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

/**
 * POST /admin/offers/:id
 * Updates existing offer.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Offer ID is required." });
      return;
    }

    const body = req.body as Record<string, any>;
    const updated = await OfferService.updateOffer(id, {
      code: body.code,
      title: body.title,
      tag: body.tag,
      description: body.description,
      discount_badge: body.discount_badge,
      discount_type: body.discount_type,
      discount_value: body.discount_value !== undefined ? Number(body.discount_value) : undefined,
      min_spend: body.min_spend !== undefined ? Number(body.min_spend) : undefined,
      min_spend_text: body.min_spend_text,
      expiry_text: body.expiry_text,
      category: body.category,
      bg_color: body.bg_color,
      text_color: body.text_color,
      accent_color: body.accent_color,
      icon: body.icon,
      is_highlighted: body.is_highlighted !== undefined ? Boolean(body.is_highlighted) : undefined,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : undefined,
      display_order: body.display_order !== undefined ? Number(body.display_order) : undefined,
    });

    if (!updated) {
      res.status(404).json({ message: `Offer with ID '${id}' not found.` });
      return;
    }

    res.status(200).json({ offer: updated, message: "Offer updated successfully." });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

/**
 * DELETE /admin/offers/:id
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Offer ID is required." });
      return;
    }

    const deleted = await OfferService.deleteOffer(id);
    if (!deleted) {
      res.status(404).json({ message: `Offer with ID '${id}' not found.` });
      return;
    }

    res.status(200).json({ id, message: "Offer deleted successfully." });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { OfferService } from "../../../modules/offer/offer-service";
import { sendSanitizedError } from "../../../utils/error-handler";

/**
 * GET /admin/offers
 * Returns all promotional offers sorted by display order.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const offers = await OfferService.listOffers(false);
    const highlighted = await OfferService.getHighlightedOffer();
    res.status(200).json({
      offers,
      highlighted_offer: highlighted,
      count: offers.length,
    });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

/**
 * POST /admin/offers
 * Creates a new promotional offer with validation.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = req.body as Record<string, any>;
    if (!body || !body.code || !body.title || !body.description) {
      res.status(400).json({
        message: "Fields 'code', 'title', and 'description' are required.",
      });
      return;
    }

    const offer = await OfferService.createOffer({
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
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      display_order: body.display_order !== undefined ? Number(body.display_order) : undefined,
    });

    res.status(201).json({ offer, message: "Offer created successfully." });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

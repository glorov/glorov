import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { OfferService } from "../../../modules/offer/offer-service";
import { sendSanitizedError } from "../../../utils/error-handler";

/**
 * GET /store/offers
 * Returns active promotional offers and highlighted welcome offer for storefront display.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    const offers = await OfferService.listOffers(true);
    const highlighted = await OfferService.getHighlightedOffer();

    const rawSubtotal = req.query?.cart_subtotal;
    const cartSubtotal = rawSubtotal ? Number(rawSubtotal) : undefined;

    const enrichedOffers = offers.map((offer) => {
      if (cartSubtotal === undefined || isNaN(cartSubtotal)) {
        return offer;
      }
      const minSpend = offer.min_spend || 0;
      const isEligible = cartSubtotal >= minSpend;
      const needed = Math.max(0, minSpend - cartSubtotal);

      let discountAmount = 0;
      if (isEligible) {
        if (offer.discount_type === "percentage") {
          discountAmount = Math.round((cartSubtotal * offer.discount_value) / 100);
        } else if (offer.discount_type === "fixed") {
          discountAmount = Math.min(cartSubtotal, offer.discount_value);
        }
      }

      return {
        ...offer,
        is_eligible: isEligible,
        needed,
        potential_discount: discountAmount,
      };
    });

    res.status(200).json({
      welcome_offer: highlighted,
      offers: enrichedOffers,
      count: enrichedOffers.length,
      cart_subtotal: cartSubtotal,
    });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

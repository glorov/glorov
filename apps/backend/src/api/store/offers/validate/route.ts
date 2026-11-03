import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { OfferService } from "../../../../modules/offer/offer-service";
import { sendSanitizedError } from "../../../../utils/error-handler";

/**
 * POST /store/offers/validate
 * Validates a coupon code against a cart subtotal amount.
 * Returns discount calculation, eligibility, terms, and next tier guidance.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = (req.body || {}) as {
      code?: string;
      cart_subtotal?: number;
      cart_id?: string;
      items?: Array<{
        productId?: string;
        variantId?: string;
        title?: string;
        category?: string;
        price: number;
        quantity: number;
      }>;
    };

    const code = body.code || "";
    const cartSubtotal = Number(body.cart_subtotal ?? 0);
    const items = Array.isArray(body.items) ? body.items : undefined;

    const validation = await OfferService.validateCoupon(code, cartSubtotal, items);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: validation.error,
        needed: validation.needed,
        min_spend: validation.min_spend,
        applicable_categories: validation.applicable_categories,
        eligible_subtotal: validation.eligible_subtotal,
        eligible_items_count: validation.eligible_items_count,
        offer: validation.offer,
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      offer: validation.offer,
      discount_amount: validation.discount_amount,
      discount_percent: validation.discount_percent,
      applicable_categories: validation.applicable_categories,
      eligible_subtotal: validation.eligible_subtotal,
      eligible_items_count: validation.eligible_items_count,
      next_tier: validation.next_tier,
    });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

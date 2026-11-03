import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  CheckoutValidationService,
  CheckoutValidationInput,
} from "../../../../modules/checkout/checkout-validation-service";
import { sendSanitizedError } from "../../../../utils/error-handler";

/**
 * POST /store/checkout/validate
 * Server-side authoritative validation preventing hacker attacks:
 * 1. Validates positive integer quantities and catalog stock
 * 2. Recalculates prices using server-side canonical inventory (anti-tamper)
 * 3. Enforces category restrictions on coupons
 * 4. Enforces payment method constraints (e.g. COD limit <= ₹5,000)
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = (req.body || {}) as CheckoutValidationInput;

    const result = await CheckoutValidationService.validateCheckout(body);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        valid: false,
        errors: result.errors,
        warnings: result.warnings,
        verifiedCart: result.verifiedCart,
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      errors: [],
      warnings: result.warnings,
      verifiedCart: result.verifiedCart,
    });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  CheckoutValidationService,
  CheckoutValidationInput,
} from "../../../../modules/checkout/checkout-validation-service";
import { sendSanitizedError } from "../../../../utils/error-handler";

/**
 * POST /store/checkout/place-order
 * Authoritative backend order finalization:
 * - Checks stock, quantities, pricing, and category offers
 * - Validates payment method constraints (e.g. COD <= ₹5,000)
 * - Returns official order receipt
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = (req.body || {}) as CheckoutValidationInput;

    const validation = await CheckoutValidationService.validateCheckout(body);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: "Checkout validation failed. Please review errors and try again.",
        errors: validation.errors,
        warnings: validation.warnings,
        verifiedCart: validation.verifiedCart,
      });
    }

    const orderId = `ord_${Date.now()}`;
    const displayId = `GLR-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const paymentTitle =
      validation.verifiedCart.paymentMethod.id === "cod"
        ? "Cash on Delivery (COD)"
        : validation.verifiedCart.paymentMethod.id === "upi"
        ? "UPI Instant Transfer"
        : "Credit / Debit Card (Simulated)";

    const receipt = {
      id: orderId,
      displayId,
      createdAt: now,
      email: body.deliveryAddress?.email || "customer@example.com",
      customerName: body.deliveryAddress?.fullName || "Valued Grower",
      shippingAddress: body.deliveryAddress || null,
      shippingMethodName: validation.verifiedCart.shippingOption.name,
      paymentMethodTitle: paymentTitle,
      items: validation.verifiedCart.items,
      subtotal: validation.verifiedCart.subtotal,
      discountAmount: validation.verifiedCart.discountAmount,
      shippingAmount: validation.verifiedCart.shippingAmount,
      totalAmount: validation.verifiedCart.grandTotal,
      currency: "INR",
      paymentStatus:
        validation.verifiedCart.paymentMethod.id === "cod" ? "authorized" : "captured",
      fulfillmentStatus: "not_fulfilled",
      appliedOffer: validation.verifiedCart.appliedOffer,
      warnings: validation.warnings,
    };

    return res.status(200).json({
      success: true,
      order: receipt,
    });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

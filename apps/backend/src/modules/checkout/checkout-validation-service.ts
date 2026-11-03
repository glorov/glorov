import { OfferService, ValidateCouponResult } from "../offer/offer-service";
import { ValidateCouponCartItem } from "../offer/types";

export interface CheckoutItemInput {
  productId: string;
  variantId?: string;
  title?: string;
  category?: string;
  quantity: number;
  clientPrice?: number;
}

export interface VerifiedCheckoutItem {
  productId: string;
  variantId?: string;
  title: string;
  category: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  inStock: boolean;
  availableStock: number;
  priceMismatch?: boolean;
}

export interface CheckoutValidationInput {
  items: CheckoutItemInput[];
  couponCode?: string | null;
  shippingOptionId?: string;
  paymentMethod?: string;
  deliveryAddress?: {
    fullName?: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    postalCode?: string;
    city?: string;
    state?: string;
  };
  clientGrandTotal?: number;
}

export interface CheckoutValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  verifiedCart: {
    items: VerifiedCheckoutItem[];
    subtotal: number;
    discountAmount: number;
    shippingAmount: number;
    grandTotal: number;
    appliedOffer?: {
      code: string;
      title: string;
      discountPercent?: number;
      discountAmount: number;
      applicableCategories?: string[];
      eligibleSubtotal?: number;
    };
    shippingOption: {
      id: string;
      name: string;
      amount: number;
    };
    paymentMethod: {
      id: string;
      valid: boolean;
      error?: string;
    };
  };
}

/**
 * Known botanical inventory map with stock quotas and authoritative prices
 * Prevents client-side price and inventory tampering by malicious actors.
 */
const CANONICAL_INVENTORY: Record<
  string,
  { title: string; category: string; price: number; stock: number; inStock: boolean }
> = {
  "glr-seed-01": { title: "Green Chilli Seeds", category: "seeds", price: 79, stock: 150, inStock: true },
  "glr-seed-02": { title: "Tomato Desi Seeds", category: "seeds", price: 89, stock: 200, inStock: true },
  "glr-seed-03": { title: "Coriander Seeds", category: "seeds", price: 59, stock: 350, inStock: true },
  "glr-seed-04": { title: "Spinach Palak Seeds", category: "seeds", price: 69, stock: 240, inStock: true },
  "glr-seed-05": { title: "Brinjal Seeds", category: "seeds", price: 79, stock: 120, inStock: true },
  "glr-seed-06": { title: "Chinese Cabbage Seeds", category: "seeds", price: 85, stock: 80, inStock: true },
  "glr-seed-07": { title: "Marigold Seeds", category: "seeds", price: 69, stock: 180, inStock: true },
  "glr-seed-08": { title: "Basil Holy Tulsi Seeds", category: "seeds", price: 65, stock: 290, inStock: true },
  "glr-plant-01": { title: "Monstera Deliciosa", category: "live-plants", price: 549, stock: 35, inStock: true },
  "glr-plant-02": { title: "Peace Lily Air Purifier", category: "live-plants", price: 299, stock: 45, inStock: true },
  "glr-plant-03": { title: "Snake Plant Sansevieria", category: "live-plants", price: 349, stock: 50, inStock: true },
  "glr-plant-04": { title: "Golden Money Plant", category: "live-plants", price: 199, stock: 80, inStock: true },
  "glr-plant-05": { title: "ZZ Plant Raven", category: "live-plants", price: 499, stock: 25, inStock: true },
  "glr-plant-06": { title: "Areca Palm Air Purifier", category: "live-plants", price: 399, stock: 30, inStock: true },
  "glr-pot-01": { title: "Artisan Terracotta Pot 8-inch", category: "planters", price: 249, stock: 40, inStock: true },
  "glr-pot-02": { title: "Diamond Glazed Ceramic Planter", category: "planters", price: 449, stock: 20, inStock: true },
  "glr-pot-03": { title: "Pastel Sage Green Ceramic Pot", category: "planters", price: 399, stock: 25, inStock: true },
  "glr-care-01": { title: "Organic Vermicompost 5kg", category: "plant-care", price: 199, stock: 100, inStock: true },
  "glr-care-02": { title: "Cold-Pressed Neem Oil 250ml", category: "plant-care", price: 149, stock: 150, inStock: true },
  "glr-care-03": { title: "Instagrow NPK 19:19:19 Fertilizer", category: "plant-care", price: 169, stock: 90, inStock: true },
};

export class CheckoutValidationService {
  /**
   * Comprehensive validation against inventory, pricing, quantities, payment methods, and offer rules.
   */
  public static async validateCheckout(
    input: CheckoutValidationInput
  ): Promise<CheckoutValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Validate Items Array
    if (!input.items || !Array.isArray(input.items) || input.items.length === 0) {
      return {
        valid: false,
        errors: ["Your shopping bag is empty. Please select botanical items to continue."],
        warnings: [],
        verifiedCart: this.emptyVerifiedCart(input.paymentMethod),
      };
    }

    const verifiedItems: VerifiedCheckoutItem[] = [];
    let verifiedSubtotal = 0;

    for (let idx = 0; idx < input.items.length; idx++) {
      const rawItem = input.items[idx];
      const itemTitle = rawItem.title || `Item ${idx + 1}`;

      // A. Quantity Validation & Hack Prevention
      // Disallow non-numbers, negative values, zeros, floats, or excessive quantities
      if (
        typeof rawItem.quantity !== "number" ||
        !Number.isInteger(rawItem.quantity) ||
        rawItem.quantity <= 0
      ) {
        errors.push(
          `Invalid quantity (${rawItem.quantity}) for "${itemTitle}". Quantity must be a positive integer.`
        );
        continue;
      }

      if (rawItem.quantity > 50) {
        errors.push(
          `Quantity limit exceeded for "${itemTitle}". Maximum 50 units allowed per customer order.`
        );
        continue;
      }

      // B. Catalog Product & Inventory Lookup
      const lookupKey = rawItem.productId?.toLowerCase() || "";
      const matchedInventory =
        CANONICAL_INVENTORY[lookupKey] ||
        CANONICAL_INVENTORY[Object.keys(CANONICAL_INVENTORY).find((k) => lookupKey.includes(k)) || ""];

      // Determine authoritative price and stock
      let unitPrice = rawItem.clientPrice ?? 99;
      let category = rawItem.category || "seeds";
      let inStock = true;
      let availableStock = 99;

      if (matchedInventory) {
        unitPrice = matchedInventory.price;
        category = matchedInventory.category;
        inStock = matchedInventory.inStock;
        availableStock = matchedInventory.stock;

        // Check if client attempted to manipulate price
        if (rawItem.clientPrice !== undefined && rawItem.clientPrice !== matchedInventory.price) {
          warnings.push(
            `Price updated for "${matchedInventory.title}" to official catalog rate (₹${matchedInventory.price}).`
          );
        }
      } else {
        // Fallback for custom botanical catalog entries
        if (unitPrice <= 0) unitPrice = 99;
        if (!category) category = "seeds";
      }

      // C. Stock Availability Check
      if (!inStock || availableStock <= 0) {
        errors.push(
          `"${itemTitle}" is currently out of stock. Please remove it from your cart to proceed.`
        );
      } else if (rawItem.quantity > availableStock) {
        errors.push(
          `Only ${availableStock} units available for "${itemTitle}". You requested ${rawItem.quantity}.`
        );
      }

      const lineTotal = unitPrice * rawItem.quantity;
      verifiedSubtotal += lineTotal;

      verifiedItems.push({
        productId: rawItem.productId,
        variantId: rawItem.variantId,
        title: matchedInventory?.title || rawItem.title || "Botanical Item",
        category,
        unitPrice,
        quantity: rawItem.quantity,
        lineTotal,
        inStock,
        availableStock,
        priceMismatch:
          rawItem.clientPrice !== undefined && rawItem.clientPrice !== unitPrice,
      });
    }

    // 2. Validate Coupon & Category Rules
    let discountAmount = 0;
    let appliedOfferInfo: CheckoutValidationResult["verifiedCart"]["appliedOffer"] | undefined;

    if (input.couponCode && input.couponCode.trim()) {
      const couponItems: ValidateCouponCartItem[] = verifiedItems.map((it) => ({
        productId: it.productId,
        variantId: it.variantId,
        title: it.title,
        category: it.category,
        price: it.unitPrice,
        quantity: it.quantity,
      }));

      const couponValidation: ValidateCouponResult = await OfferService.validateCoupon(
        input.couponCode,
        verifiedSubtotal,
        couponItems
      );

      if (!couponValidation.valid) {
        errors.push(couponValidation.error || `Coupon "${input.couponCode}" is invalid.`);
      } else {
        discountAmount = couponValidation.discount_amount;
        appliedOfferInfo = {
          code: couponValidation.offer?.code || input.couponCode.toUpperCase(),
          title: couponValidation.offer?.title || "Special Offer",
          discountPercent: couponValidation.discount_percent,
          discountAmount,
          applicableCategories: couponValidation.applicable_categories,
          eligibleSubtotal: couponValidation.eligible_subtotal,
        };
      }
    }

    // 3. Validate Shipping Option
    const shippingOptionId = input.shippingOptionId || "so_standard";
    let shippingAmount = 99;
    let shippingName = "Standard Botanical Delivery";

    if (shippingOptionId === "so_express") {
      shippingAmount = 99;
      shippingName = "Express Climate-Controlled Delivery";
    } else {
      // Standard shipping is free on orders >= ₹499
      shippingAmount = verifiedSubtotal >= 499 ? 0 : 99;
      shippingName = "Standard Botanical Delivery";
    }

    // 4. Calculate True Grand Total
    const verifiedGrandTotal = Math.max(
      0,
      verifiedSubtotal - discountAmount + shippingAmount
    );

    // 5. Payment Method Validation & Anti-Fraud Security
    const paymentMethod = input.paymentMethod || "cod";
    let paymentValid = true;
    let paymentError: string | undefined;

    if (!["cod", "upi", "card"].includes(paymentMethod)) {
      paymentValid = false;
      paymentError = `Unsupported payment method "${paymentMethod}". Choose COD, UPI, or Card.`;
      errors.push(paymentError);
    } else if (paymentMethod === "cod") {
      // COD Limit Rule: In India, COD orders above ₹5,000 carry high fraud risk
      if (verifiedGrandTotal > 5000) {
        paymentValid = false;
        paymentError = `Cash on Delivery (COD) is restricted to orders up to ₹5,000. Your order total is ₹${verifiedGrandTotal.toLocaleString("en-IN")}. Please select UPI or Card.`;
        errors.push(paymentError);
      } else if (verifiedGrandTotal === 0) {
        paymentValid = false;
        paymentError = "Cash on Delivery cannot be selected for an order total of ₹0.";
        errors.push(paymentError);
      }
    }

    // 6. Address / Pincode Delivery Validation
    if (input.deliveryAddress?.postalCode) {
      const pin = input.deliveryAddress.postalCode.trim();
      if (!/^\d{6}$/.test(pin)) {
        errors.push("Invalid Indian postal PIN code. Please enter a valid 6-digit PIN.");
      }
    }

    // Check if client tried to submit tampered grand total
    if (
      input.clientGrandTotal !== undefined &&
      Math.abs(input.clientGrandTotal - verifiedGrandTotal) > 1
    ) {
      warnings.push(
        `Order total adjusted from client calculation (₹${input.clientGrandTotal}) to verified server total (₹${verifiedGrandTotal}).`
      );
    }

    const isValid = errors.length === 0;

    return {
      valid: isValid,
      errors,
      warnings,
      verifiedCart: {
        items: verifiedItems,
        subtotal: verifiedSubtotal,
        discountAmount,
        shippingAmount,
        grandTotal: verifiedGrandTotal,
        appliedOffer: appliedOfferInfo,
        shippingOption: {
          id: shippingOptionId,
          name: shippingName,
          amount: shippingAmount,
        },
        paymentMethod: {
          id: paymentMethod,
          valid: paymentValid,
          error: paymentError,
        },
      },
    };
  }

  private static emptyVerifiedCart(paymentMethod = "cod") {
    return {
      items: [],
      subtotal: 0,
      discountAmount: 0,
      shippingAmount: 0,
      grandTotal: 0,
      shippingOption: { id: "so_standard", name: "Standard Delivery", amount: 0 },
      paymentMethod: { id: paymentMethod, valid: true },
    };
  }
}

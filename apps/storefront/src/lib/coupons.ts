/**
 * Storefront Botanical Coupons & Offers Client Service
 */

export interface CouponOffer {
  id: string;
  code: string;
  title: string;
  tag?: string;
  description: string;
  discount_badge: string;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount_value: number;
  min_spend?: number;
  min_spend_text?: string;
  terms?: string;
  expiry_text?: string;
  category?: string;
  is_eligible?: boolean;
  needed?: number;
  potential_discount?: number;
}

export interface AppliedCoupon {
  code: string;
  title: string;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount_value: number;
  discount_amount: number; // in INR
  min_spend?: number;
  terms?: string;
}

export const FALLBACK_COUPONS: CouponOffer[] = [
  {
    id: 'diwali-10',
    code: 'DIWALI10',
    title: '10% OFF',
    tag: 'FESTIVE SPECIAL',
    description: 'On orders above ₹999',
    discount_badge: '10% OFF',
    discount_type: 'percentage',
    discount_value: 10,
    min_spend: 999,
    min_spend_text: 'On orders above ₹999',
    terms: 'Not applicable on hamper products',
    expiry_text: 'Limited festive offer',
  },
  {
    id: 'diwali-15',
    code: 'DIWALI15',
    title: '15% OFF',
    tag: 'FESTIVE SPECIAL',
    description: 'On orders above ₹1,599',
    discount_badge: '15% OFF',
    discount_type: 'percentage',
    discount_value: 15,
    min_spend: 1599,
    min_spend_text: 'On orders above ₹1,599',
    terms: 'Not applicable on hamper products',
    expiry_text: 'Limited festive offer',
  },
  {
    id: 'diwali-20',
    code: 'DIWALI20',
    title: '20% OFF',
    tag: 'FESTIVE SPECIAL',
    description: 'On orders above ₹2,299',
    discount_badge: '20% OFF',
    discount_type: 'percentage',
    discount_value: 20,
    min_spend: 2299,
    min_spend_text: 'On orders above ₹2,299',
    terms: 'Not applicable on hamper products',
    expiry_text: 'Limited festive offer',
  },
  {
    id: 'welcome-glorov-10',
    code: 'GLOROV10',
    title: 'Special Welcome Offer',
    tag: 'WELCOME',
    description: '10% off your first botanical order from Pune nursery',
    discount_badge: '10% OFF',
    discount_type: 'percentage',
    discount_value: 10,
    min_spend: 499,
    min_spend_text: 'Min Order: ₹499',
    terms: 'Applicable on living plants and seeds',
    expiry_text: 'First botanical order',
  },
  {
    id: 'free-shipping-express',
    code: 'FREESHIP',
    title: 'Free Express Delivery',
    tag: 'FREE SHIPPING',
    description: 'Free conditioned botanical shipping across India',
    discount_badge: 'FREE DELIVERY',
    discount_type: 'free_shipping',
    discount_value: 0,
    min_spend: 499,
    min_spend_text: 'Min Order: ₹499',
    terms: 'Pan-India delivery',
    expiry_text: 'Standard shipping waiver',
  },
];

/**
 * Fetches available promotional coupons evaluated against the cart subtotal.
 */
export async function fetchAvailableOffers(cartSubtotalINR: number = 0): Promise<CouponOffer[]> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
    const publishableKey =
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_STORE_PUBLISHABLE_KEY ||
      '';

    const res = await fetch(`${backendUrl}/store/offers?cart_subtotal=${cartSubtotalINR}`, {
      headers: {
        'x-publishable-api-key': publishableKey,
      },
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.offers) && data.offers.length > 0) {
        return data.offers;
      }
    }
  } catch {
    // Fall back to local verified offers
  }

  // Fallback enriched computation
  return FALLBACK_COUPONS.map((coupon) => {
    const minSpend = coupon.min_spend || 0;
    const isEligible = cartSubtotalINR >= minSpend;
    const needed = Math.max(0, minSpend - cartSubtotalINR);
    let potentialDiscount = 0;
    if (isEligible) {
      if (coupon.discount_type === 'percentage') {
        potentialDiscount = Math.round((cartSubtotalINR * coupon.discount_value) / 100);
      } else if (coupon.discount_type === 'fixed') {
        potentialDiscount = Math.min(cartSubtotalINR, coupon.discount_value);
      }
    }
    return {
      ...coupon,
      is_eligible: isEligible,
      needed,
      potential_discount: potentialDiscount,
    };
  });
}

/**
 * Validates and calculates discount for a given coupon code and cart subtotal.
 */
export async function validateCoupon(
  code: string,
  cartSubtotalINR: number
): Promise<{
  success: boolean;
  coupon?: AppliedCoupon;
  error?: string;
  needed?: number;
}> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, error: 'Please enter a coupon code' };
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
    const publishableKey =
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_STORE_PUBLISHABLE_KEY ||
      '';

    const res = await fetch(`${backendUrl}/store/offers/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableKey,
      },
      body: JSON.stringify({
        code: cleanCode,
        cart_subtotal: cartSubtotalINR,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.offer) {
      return {
        success: true,
        coupon: {
          code: data.offer.code,
          title: data.offer.title,
          discount_type: data.offer.discount_type,
          discount_value: data.offer.discount_value,
          discount_amount: data.discount_amount,
          min_spend: data.offer.min_spend,
          terms: data.offer.terms,
        },
      };
    } else if (data.needed) {
      return {
        success: false,
        error: data.error || `Add ₹${data.needed} more to apply this offer`,
        needed: data.needed,
      };
    } else {
      return {
        success: false,
        error: data.error || `Coupon "${cleanCode}" is not valid`,
      };
    }
  } catch {
    // Client-side fallback validator
    const found = FALLBACK_COUPONS.find((c) => c.code.toUpperCase() === cleanCode);
    if (!found) {
      return { success: false, error: `Coupon "${cleanCode}" is invalid or expired` };
    }

    const minSpend = found.min_spend || 0;
    if (cartSubtotalINR < minSpend) {
      const needed = minSpend - cartSubtotalINR;
      return {
        success: false,
        error: `Add ₹${needed} more to apply code ${found.code}`,
        needed,
      };
    }

    let discountAmount = 0;
    if (found.discount_type === 'percentage') {
      discountAmount = Math.round((cartSubtotalINR * found.discount_value) / 100);
    } else if (found.discount_type === 'fixed') {
      discountAmount = Math.min(cartSubtotalINR, found.discount_value);
    }

    return {
      success: true,
      coupon: {
        code: found.code,
        title: found.title,
        discount_type: found.discount_type,
        discount_value: found.discount_value,
        discount_amount: discountAmount,
        min_spend: found.min_spend,
        terms: found.terms,
      },
    };
  }
}

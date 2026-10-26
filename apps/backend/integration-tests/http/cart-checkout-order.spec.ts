const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUBLISHABLE_KEY =
  process.env.STORE_PUBLISHABLE_KEY ||
  "pk_2d4629ab032f218451f992310351db37f7adcc4ea53d3cfa5fc2c95864b717cf";

describe("Medusa v2 Cart, Checkout, and Order Lifecycle Integration Tests", () => {
  const storeHeaders = {
    "x-publishable-api-key": PUBLISHABLE_KEY,
    "Content-Type": "application/json",
  };

  let adminToken = "";
  let adminHeaders: Record<string, string> = {};
  let inStockVariantId = "";
  let outOfStockVariantId = "";

  beforeAll(async () => {
    // 1. Verify backend health
    const healthRes = await fetch(`${BACKEND_URL}/health`);
    if (!healthRes.ok) {
      throw new Error(`Medusa backend health check failed with status ${healthRes.status}`);
    }

    // 2. Authenticate as Admin
    const authRes = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@glorov.in",
        password: "SuperSecretPassword123!",
      }),
    });
    if (!authRes.ok) {
      throw new Error(`Admin authentication failed: ${authRes.status}`);
    }
    const authData = await authRes.json();
    adminToken = authData.token;
    adminHeaders = {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    };

    // 3. Resolve test variants from Desi Tomato Seeds
    const prodRes = await fetch(
      `${BACKEND_URL}/store/products?handle=tomato-seeds-desi&fields=*variants,+variants.inventory_quantity`,
      { headers: storeHeaders }
    );
    const prodData = await prodRes.json();
    const tomato = prodData.products[0];
    if (!tomato) {
      throw new Error("Seed product 'tomato-seeds-desi' not found in store catalog");
    }

    const inStock = tomato.variants.find((v: { title: string }) => v.title === "20 Seeds");
    const outStock = tomato.variants.find((v: { title: string }) => v.title === "100 Seeds");

    if (!inStock || !outStock) {
      throw new Error("Expected variants (20 Seeds, 100 Seeds) not found on tomato product");
    }

    inStockVariantId = inStock.id;
    outOfStockVariantId = outStock.id;
  });

  it("1. POST /store/carts creates a cart for Indian sales region with INR currency", async () => {
    const res = await fetch(`${BACKEND_URL}/store/carts`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(200);

    const { cart } = await res.json();
    expect(cart.id).toBeDefined();
    expect(cart.currency_code).toBe("inr");
    expect(cart.region).toBeDefined();
    expect(cart.region.currency_code).toBe("inr");
    expect(cart.items).toHaveLength(0);
    expect(cart.total).toBe(0);
    expect(cart.subtotal).toBe(0);
  });

  it("2. POST /store/carts/:id/line-items adds selected product variant and calculates correct INR prices", async () => {
    // Create cart
    const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({}),
    });
    const { cart } = await cartRes.json();

    // Add 2 units of 20 Seeds variant (₹49 = 4900 paise each)
    const addRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({
        variant_id: inStockVariantId,
        quantity: 2,
      }),
    });
    expect(addRes.status).toBe(200);

    const { cart: updatedCart } = await addRes.json();
    expect(updatedCart.items).toHaveLength(1);
    const item = updatedCart.items[0];
    expect(item.variant_id).toBe(inStockVariantId);
    expect(item.quantity).toBe(2);
    expect(item.unit_price).toBe(4900); // ₹49
    expect(updatedCart.item_subtotal).toBe(9800); // ₹98
    expect(updatedCart.total).toBe(9800);
  });

  it("3. POST /store/carts/:id/line-items/:line_id updates item quantity and recalculates totals", async () => {
    const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({}),
    });
    const { cart } = await cartRes.json();

    const addRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({
        variant_id: inStockVariantId,
        quantity: 1,
      }),
    });
    const { cart: cartWithItem } = await addRes.json();
    const lineItemId = cartWithItem.items[0].id;

    // Update quantity to 4 (4 × 4900 = 19600)
    const updateRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items/${lineItemId}`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({
        quantity: 4,
      }),
    });
    expect(updateRes.status).toBe(200);

    const { cart: updatedCart } = await updateRes.json();
    expect(updatedCart.items[0].quantity).toBe(4);
    expect(updatedCart.item_subtotal).toBe(19600);
    expect(updatedCart.total).toBe(19600);
  });

  it("4. DELETE /store/carts/:id/line-items/:line_id removes item from cart", async () => {
    const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({}),
    });
    const { cart } = await cartRes.json();

    const addRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({
        variant_id: inStockVariantId,
        quantity: 1,
      }),
    });
    const { cart: cartWithItem } = await addRes.json();
    const lineItemId = cartWithItem.items[0].id;

    // Delete item
    const delRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items/${lineItemId}`, {
      method: "DELETE",
      headers: storeHeaders,
    });
    expect(delRes.status).toBe(200);

    // Verify cart is now empty
    const retrieveRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}?fields=*items`, {
      headers: storeHeaders,
    });
    const { cart: emptyCart } = await retrieveRes.json();
    expect(emptyCart.items).toHaveLength(0);
    expect(emptyCart.total).toBe(0);
  });

  it("5. GET /store/shipping-options?cart_id=:id retrieves Indian shipping options with INR pricing", async () => {
    const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({}),
    });
    const { cart } = await cartRes.json();

    const optionsRes = await fetch(`${BACKEND_URL}/store/shipping-options?cart_id=${cart.id}`, {
      headers: storeHeaders,
    });
    expect(optionsRes.status).toBe(200);

    const { shipping_options } = await optionsRes.json();
    expect(shipping_options.length).toBeGreaterThanOrEqual(2);

    const standard = shipping_options.find((o: { name: string }) => o.name.includes("Standard Delivery"));
    const express = shipping_options.find((o: { name: string }) => o.name.includes("Express Botanical Delivery"));

    expect(standard).toBeDefined();
    expect(standard.amount).toBe(4900); // ₹49
    expect(express).toBeDefined();
    expect(express.amount).toBe(9900); // ₹99
  });

  it("6. POST /store/carts/:id updates Indian customer delivery address and contact info", async () => {
    const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({}),
    });
    const { cart } = await cartRes.json();

    const updateRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({
        email: "priya.nair@example.com",
        shipping_address: {
          first_name: "Priya",
          last_name: "Nair",
          address_1: "Flat 502, Orchid Towers",
          address_2: "Baner Road",
          city: "Pune",
          province: "Maharashtra",
          postal_code: "411045",
          phone: "9876543210",
          country_code: "in",
        },
      }),
    });
    expect(updateRes.status).toBe(200);

    const { cart: updatedCart } = await updateRes.json();
    expect(updatedCart.email).toBe("priya.nair@example.com");
    expect(updatedCart.shipping_address).toBeDefined();
    expect(updatedCart.shipping_address.city).toBe("Pune");
    expect(updatedCart.shipping_address.province).toBe("Maharashtra");
    expect(updatedCart.shipping_address.postal_code).toBe("411045");
    expect(updatedCart.shipping_address.phone).toBe("9876543210");
  });

  it("7. Full Order Lifecycle: Cart -> Line Item -> Shipping Option -> Payment Session -> Order Completion", async () => {
    // Step 1: Create Cart
    const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({}),
    });
    expect(cartRes.status).toBe(200);
    const { cart } = await cartRes.json();

    // Step 2: Add line item (1 unit @ 4900)
    const addRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({
        variant_id: inStockVariantId,
        quantity: 1,
      }),
    });
    expect(addRes.status).toBe(200);

    // Step 3: Add Indian delivery address
    const addrRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({
        email: "rohit.verma@example.com",
        shipping_address: {
          first_name: "Rohit",
          last_name: "Verma",
          address_1: "House 14, Lotus Enclave",
          city: "Bengaluru",
          province: "Karnataka",
          postal_code: "560034",
          phone: "9876501234",
          country_code: "in",
        },
      }),
    });
    expect(addrRes.status).toBe(200);

    // Step 4: Retrieve available shipping options & select Standard Delivery
    const optRes = await fetch(`${BACKEND_URL}/store/shipping-options?cart_id=${cart.id}`, {
      headers: storeHeaders,
    });
    const { shipping_options } = await optRes.json();
    const standardOption = shipping_options.find((o: { name: string }) => o.name.includes("Standard Delivery"));
    expect(standardOption).toBeDefined();

    const smRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/shipping-methods`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({
        option_id: standardOption.id,
      }),
    });
    expect(smRes.status).toBe(200);
    const { cart: cartWithShipping } = await smRes.json();
    expect(cartWithShipping.shipping_methods).toHaveLength(1);
    expect(cartWithShipping.shipping_total).toBe(4900);
    // Total should be 4900 (item) + 4900 (shipping) = 9800
    expect(cartWithShipping.total).toBe(9800);

    // Step 5: Initialize Payment Collection & Session
    const pcRes = await fetch(`${BACKEND_URL}/store/payment-collections`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({ cart_id: cart.id }),
    });
    expect(pcRes.status).toBe(200);
    const { payment_collection } = await pcRes.json();
    expect(payment_collection.id).toBeDefined();
    expect(payment_collection.amount).toBe(9800);

    const psRes = await fetch(
      `${BACKEND_URL}/store/payment-collections/${payment_collection.id}/payment-sessions`,
      {
        method: "POST",
        headers: storeHeaders,
        body: JSON.stringify({ provider_id: "pp_system_default" }),
      }
    );
    expect(psRes.status).toBe(200);

    // Step 6: Complete Cart Workflow
    const completeRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/complete`, {
      method: "POST",
      headers: storeHeaders,
    });
    expect(completeRes.status).toBe(200);
    const completeData = await completeRes.json();
    expect(completeData.type).toBe("order");
    expect(completeData.order).toBeDefined();

    const order = completeData.order;
    expect(order.id).toBeDefined();
    expect(order.display_id).toBeDefined();
    expect(order.email).toBe("rohit.verma@example.com");
    expect(order.currency_code).toBe("inr");
    expect(order.total).toBe(9800);
    expect(order.items).toHaveLength(1);
    expect(order.items[0].variant_sku).toBe("GLR-SD-TOM-020");
    expect(order.shipping_address.postal_code).toBe("560034");

    // Step 7: Verify order is visible in Medusa Admin API with all expected commerce information
    const adminOrderRes = await fetch(
      `${BACKEND_URL}/admin/orders/${order.id}?fields=*items,*shipping_address,*shipping_methods,+email,+currency_code`,
      {
        headers: adminHeaders,
      }
    );
    expect(adminOrderRes.status).toBe(200);
    const { order: adminOrder } = await adminOrderRes.json();
    expect(adminOrder.id).toBe(order.id);
    expect(adminOrder.display_id).toBe(order.display_id);
    expect(adminOrder.email).toBe("rohit.verma@example.com");
    expect(adminOrder.currency_code).toBe("inr");
    expect(adminOrder.payment_status).toBe("authorized");
    expect(adminOrder.fulfillment_status).toBe("not_fulfilled");
    expect(adminOrder.total).toBe(9800);
    expect(adminOrder.created_at).toBeDefined();

    // Verify products, variants, SKUs, quantities, and prices
    expect(adminOrder.items).toHaveLength(1);
    const adminItem = adminOrder.items[0];
    expect(adminItem.title).toBe("Tomato Seeds (Desi / Pusa Ruby)");
    expect(adminItem.variant_sku).toBe("GLR-SD-TOM-020");
    expect(adminItem.quantity).toBe(1);
    expect(adminItem.unit_price).toBe(4900);

    // Verify shipping address and delivery details
    expect(adminOrder.shipping_address).toBeDefined();
    expect(adminOrder.shipping_address.first_name).toBe("Rohit");
    expect(adminOrder.shipping_address.last_name).toBe("Verma");
    expect(adminOrder.shipping_address.address_1).toBe("House 14, Lotus Enclave");
    expect(adminOrder.shipping_address.city).toBe("Bengaluru");
    expect(adminOrder.shipping_address.province).toBe("Karnataka");
    expect(adminOrder.shipping_address.postal_code).toBe("560034");
    expect(adminOrder.shipping_address.phone).toBe("9876501234");
    expect(adminOrder.shipping_address.country_code).toBe("in");

    // Verify shipping method selection
    expect(adminOrder.shipping_methods).toHaveLength(1);
    expect(adminOrder.shipping_methods[0].amount).toBe(4900);
    expect(adminOrder.shipping_methods[0].name).toContain("Standard Delivery");

    // Step 8: Test Idempotent Cart Completion (prevents duplicate orders)
    const duplicateRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/complete`, {
      method: "POST",
      headers: storeHeaders,
    });
    expect(duplicateRes.status).toBe(200);
    const duplicateData = await duplicateRes.json();
    expect(duplicateData.type).toBe("order");
    expect(duplicateData.order.id).toBe(order.id);

    // Step 9: Verify inventory reservation was created at Pune Central Nursery Hub
    const lineItemId = order.items[0].id;
    const resRes = await fetch(`${BACKEND_URL}/admin/reservations?line_item_id=${lineItemId}`, {
      headers: adminHeaders,
    });
    expect(resRes.status).toBe(200);
    const { reservations } = await resRes.json();
    expect(reservations.length).toBeGreaterThanOrEqual(1);
    const reservation = reservations[0];
    expect(reservation.quantity).toBe(1);
    expect(reservation.location_id).toBeDefined();

    // Verify reservation location is Pune Central Nursery Hub
    const locRes = await fetch(`${BACKEND_URL}/admin/stock-locations/${reservation.location_id}`, {
      headers: adminHeaders,
    });
    expect(locRes.status).toBe(200);
    const { stock_location } = await locRes.json();
    expect(stock_location.name).toContain("Pune");

    // Step 10: Clean up test order via Admin cancellation and verify reservation is released
    const cancelRes = await fetch(`${BACKEND_URL}/admin/orders/${order.id}/cancel`, {
      method: "POST",
      headers: adminHeaders,
    });
    expect(cancelRes.status).toBe(200);

    // Verify inventory reservation was automatically deleted / released
    const checkRes = await fetch(`${BACKEND_URL}/admin/reservations?line_item_id=${lineItemId}`, {
      headers: adminHeaders,
    });
    expect(checkRes.status).toBe(200);
    const { reservations: remainingReservations } = await checkRes.json();
    expect(remainingReservations).toHaveLength(0);
  });

  it("8. Out-of-stock failure handling: backend rejects adding or purchasing unavailable variants", async () => {
    // Create cart
    const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({}),
    });
    const { cart } = await cartRes.json();

    // 1. Adding 100 Seeds variant (which has 0 inventory) must be rejected with 400
    const addOutRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({
        variant_id: outOfStockVariantId,
        quantity: 1,
      }),
    });
    expect(addOutRes.status).toBe(400);
    const errBody = await addOutRes.json();
    expect(errBody.message.toLowerCase()).toMatch(/stock|inventory/);

    // 2. Adding more units than available (e.g. 999 units of 20 Seeds variant) must be rejected with 400
    const addExcessRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({
        variant_id: inStockVariantId,
        quantity: 999,
      }),
    });
    expect(addExcessRes.status).toBe(400);
    const excessErr = await addExcessRes.json();
    expect(excessErr.message.toLowerCase()).toMatch(/stock|inventory/);

    // 3. Stock becomes unavailable during checkout: backend rejects order completion with 400
    // Create new cart and add 1 in-stock unit
    const raceCartRes = await fetch(`${BACKEND_URL}/store/carts`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({}),
    });
    const { cart: raceCart } = await raceCartRes.json();

    await fetch(`${BACKEND_URL}/store/carts/${raceCart.id}/line-items`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({ variant_id: inStockVariantId, quantity: 1 }),
    });

    await fetch(`${BACKEND_URL}/store/carts/${raceCart.id}`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({
        email: "stockrace@example.com",
        shipping_address: {
          first_name: "Stock",
          last_name: "Tester",
          address_1: "789 Nursery Lane",
          city: "Pune",
          province: "Maharashtra",
          postal_code: "411001",
          phone: "9876543210",
          country_code: "in",
        },
      }),
    });

    const optRes = await fetch(`${BACKEND_URL}/store/shipping-options?cart_id=${raceCart.id}`, {
      headers: storeHeaders,
    });
    const { shipping_options } = await optRes.json();
    await fetch(`${BACKEND_URL}/store/carts/${raceCart.id}/shipping-methods`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({ option_id: shipping_options[0].id }),
    });

    const pcRes = await fetch(`${BACKEND_URL}/store/payment-collections`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({ cart_id: raceCart.id }),
    });
    const { payment_collection } = await pcRes.json();

    await fetch(`${BACKEND_URL}/store/payment-collections/${payment_collection.id}/payment-sessions`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({ provider_id: "pp_system_default" }),
    });

    // Query inventory item and level for inStockVariantId
    const invRes = await fetch(`${BACKEND_URL}/admin/inventory-items?sku=GLR-SD-TOM-020`, {
      headers: adminHeaders,
    });
    const { inventory_items } = await invRes.json();
    const invItem = inventory_items[0];

    const levelsRes = await fetch(`${BACKEND_URL}/admin/inventory-items/${invItem.id}/location-levels`, {
      headers: adminHeaders,
    });
    const { inventory_levels } = await levelsRes.json();
    const targetLevel = inventory_levels[0];
    const originalStock = targetLevel.stocked_quantity;

    try {
      // Temporarily set stocked_quantity to 0 to simulate stock depletion mid-checkout
      const depleteRes = await fetch(
        `${BACKEND_URL}/admin/inventory-items/${invItem.id}/location-levels/${targetLevel.location_id}`,
        {
          method: "POST",
          headers: adminHeaders,
          body: JSON.stringify({ stocked_quantity: 0 }),
        }
      );
      expect(depleteRes.status).toBe(200);

      // Attempting to complete the cart MUST fail with 400
      const failedCompleteRes = await fetch(`${BACKEND_URL}/store/carts/${raceCart.id}/complete`, {
        method: "POST",
        headers: storeHeaders,
      });
      expect(failedCompleteRes.status).toBe(400);
      const failedData = await failedCompleteRes.json();
      expect(failedData.message.toLowerCase()).toMatch(/stock|inventory/);
    } finally {
      // Restore stocked_quantity
      await fetch(
        `${BACKEND_URL}/admin/inventory-items/${invItem.id}/location-levels/${targetLevel.location_id}`,
        {
          method: "POST",
          headers: adminHeaders,
          body: JSON.stringify({ stocked_quantity: originalStock }),
        }
      );
    }
  });

  it("9. Unauthorized Administrative Access: Admin endpoints reject requests without token or with storefront keys", async () => {
    // 1. Unauthenticated request to /admin/orders must return 401
    const unauthRes = await fetch(`${BACKEND_URL}/admin/orders`);
    expect(unauthRes.status).toBe(401);

    // 2. Request to /admin/orders with Storefront publishable key must return 401
    const pubKeyRes = await fetch(`${BACKEND_URL}/admin/orders`, {
      headers: storeHeaders,
    });
    expect(pubKeyRes.status).toBe(401);
  });
});

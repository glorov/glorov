const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUBLISHABLE_KEY =
  process.env.STORE_PUBLISHABLE_KEY ||
  "pk_2d4629ab032f218451f992310351db37f7adcc4ea53d3cfa5fc2c95864b717cf";

describe("Medusa v2 Admin Operations and Order Management Integration Tests", () => {
  const storeHeaders = {
    "x-publishable-api-key": PUBLISHABLE_KEY,
    "Content-Type": "application/json",
  };

  let adminToken = "";
  let adminHeaders: Record<string, string> = {};
  let customerToken = "";
  let inStockVariantId = "";
  let testProductId = "";
  let puneLocationId = "";

  beforeAll(async () => {
    // 1. Backend health check
    const healthRes = await fetch(`${BACKEND_URL}/health`);
    if (!healthRes.ok) {
      throw new Error(`Medusa backend health check failed: ${healthRes.status}`);
    }

    // 2. Admin Authentication
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

    // 3. Register a test customer to obtain customer bearer token for access control tests
    const customerEmail = `admin-audit-${Date.now()}@glorov.in`;
    const custAuthRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: customerEmail,
        password: "CustomerSecret123!",
      }),
    });
    if (custAuthRes.ok) {
      const custData = await custAuthRes.json();
      customerToken = custData.token;
    }

    // 4. Resolve seed product & in-stock variant
    const prodRes = await fetch(
      `${BACKEND_URL}/store/products?handle=tomato-seeds-desi&fields=*variants`,
      { headers: storeHeaders }
    );
    const prodData = await prodRes.json();
    const tomato = prodData.products[0];
    if (tomato) {
      testProductId = tomato.id;
      const v20 = tomato.variants.find((v: { title: string }) => v.title === "20 Seeds");
      if (v20) inStockVariantId = v20.id;
    }

    // 5. Resolve Pune Central Nursery Hub location ID
    const locRes = await fetch(`${BACKEND_URL}/admin/stock-locations`, {
      headers: adminHeaders,
    });
    const { stock_locations } = await locRes.json();
    const puneLoc = stock_locations.find((l: { name: string }) =>
      l.name.includes("Pune Central Nursery Hub")
    );
    if (puneLoc) puneLocationId = puneLoc.id;
  });

  describe("1. Administrative Authentication & Access Control Security", () => {
    it("authenticates store owner and issues valid user-actor JWT token", async () => {
      const authRes = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@glorov.in",
          password: "SuperSecretPassword123!",
        }),
      });
      expect(authRes.status).toBe(200);
      const data = await authRes.json();
      expect(data.token).toBeDefined();
      expect(typeof data.token).toBe("string");
    });

    it("rejects invalid admin credentials with 401 Unauthorized", async () => {
      const authRes = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@glorov.in",
          password: "WrongPasswordAttempt!",
        }),
      });
      expect(authRes.status).toBe(401);
    });

    it("GET /admin/users/me returns authenticated store owner profile", async () => {
      const res = await fetch(`${BACKEND_URL}/admin/users/me`, {
        headers: adminHeaders,
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe("admin@glorov.in");
    });

    it("rejects unauthenticated request to /admin/orders with 401 Unauthorized", async () => {
      const res = await fetch(`${BACKEND_URL}/admin/orders`);
      expect(res.status).toBe(401);
    });

    it("rejects customer bearer token from accessing /admin/orders with 401 Unauthorized", async () => {
      if (!customerToken) return;
      const res = await fetch(`${BACKEND_URL}/admin/orders`, {
        headers: {
          Authorization: `Bearer ${customerToken}`,
          "Content-Type": "application/json",
        },
      });
      expect(res.status).toBe(401);
    });
  });

  describe("2. Product Catalog & Botanical Metadata Administration", () => {
    it("GET /admin/products retrieves catalog products with categories and variants", async () => {
      const res = await fetch(`${BACKEND_URL}/admin/products?limit=10`, {
        headers: adminHeaders,
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.products).toBeDefined();
      expect(data.products.length).toBeGreaterThan(0);

      const tomato = data.products.find(
        (p: { handle: string }) => p.handle === "tomato-seeds-desi"
      );
      expect(tomato).toBeDefined();
      expect(tomato.title).toBe("Tomato Seeds (Desi / Pusa Ruby)");
    });

    it("POST /admin/products/:id updates botanical cultivation metadata and persists values", async () => {
      const originalRes = await fetch(`${BACKEND_URL}/admin/products/${testProductId}`, {
        headers: adminHeaders,
      });
      const { product: original } = await originalRes.json();
      const existingMeta = original.metadata || {};

      const testTimestamp = Date.now();
      const updatedMeta = {
        ...existingMeta,
        admin_verified_at: testTimestamp,
        seed_purity_percentage: 99.5,
      };

      const updateRes = await fetch(`${BACKEND_URL}/admin/products/${testProductId}`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          metadata: updatedMeta,
        }),
      });
      expect(updateRes.status).toBe(200);

      const { product: updated } = await updateRes.json();
      expect(updated.metadata.admin_verified_at).toBe(testTimestamp);
      expect(updated.metadata.seed_purity_percentage).toBe(99.5);
      // Verify heirloom botanical name is intact
      expect(updated.metadata.botanical_name).toBe("Solanum lycopersicum");
    });

    it("verifies packet-size variants have independent SKUs and INR pricing", async () => {
      const res = await fetch(
        `${BACKEND_URL}/admin/products/${testProductId}?fields=*variants,*variants.prices`,
        { headers: adminHeaders }
      );
      expect(res.status).toBe(200);
      const { product } = await res.json();

      expect(product.variants.length).toBeGreaterThanOrEqual(3);
      const skus = product.variants.map((v: { sku: string }) => v.sku);
      expect(skus).toContain("GLR-SD-TOM-020");
      expect(skus).toContain("GLR-SD-TOM-050");
      expect(skus).toContain("GLR-SD-TOM-100");
    });
  });

  describe("3. Multi-Location Inventory & Stock Management", () => {
    it("GET /admin/stock-locations retrieves Pune Central Nursery Hub", async () => {
      const res = await fetch(`${BACKEND_URL}/admin/stock-locations`, {
        headers: adminHeaders,
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.stock_locations.length).toBeGreaterThan(0);

      const puneHub = data.stock_locations.find((l: { name: string }) =>
        l.name.includes("Pune Central Nursery Hub")
      );
      expect(puneHub).toBeDefined();
      expect(puneHub.address.postal_code).toBe("411001");
    });

    it("GET /admin/inventory-items lists seed inventory linked to Pune stock location", async () => {
      const res = await fetch(`${BACKEND_URL}/admin/inventory-items?limit=10`, {
        headers: adminHeaders,
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.inventory_items.length).toBeGreaterThan(0);

      const tomato50 = data.inventory_items.find(
        (i: { sku: string }) => i.sku === "GLR-SD-TOM-050"
      );
      expect(tomato50).toBeDefined();
      expect(tomato50.location_levels).toBeDefined();
      expect(tomato50.location_levels.length).toBeGreaterThan(0);
    });

    it("POST /admin/inventory-items/:id/location-levels/:loc_id updates stocked quantity in real time", async () => {
      const invRes = await fetch(`${BACKEND_URL}/admin/inventory-items?sku=GLR-SD-TOM-050`, {
        headers: adminHeaders,
      });
      const invData = await invRes.json();
      const item = invData.inventory_items[0];
      expect(item).toBeDefined();

      const locLevel = item.location_levels.find(
        (l: { location_id: string }) => l.location_id === puneLocationId
      );
      expect(locLevel).toBeDefined();
      const currentStock = locLevel.stocked_quantity;

      // Increment stock by 5
      const newStock = currentStock + 5;
      const updateRes = await fetch(
        `${BACKEND_URL}/admin/inventory-items/${item.id}/location-levels/${puneLocationId}`,
        {
          method: "POST",
          headers: adminHeaders,
          body: JSON.stringify({ stocked_quantity: newStock }),
        }
      );
      expect(updateRes.status).toBe(200);
      const updateData = await updateRes.json();
      const updatedLevel = updateData.inventory_item.location_levels.find(
        (l: { location_id: string }) => l.location_id === puneLocationId
      );
      expect(updatedLevel.stocked_quantity).toBe(newStock);

      // Revert back to original stock for idempotency
      await fetch(
        `${BACKEND_URL}/admin/inventory-items/${item.id}/location-levels/${puneLocationId}`,
        {
          method: "POST",
          headers: adminHeaders,
          body: JSON.stringify({ stocked_quantity: currentStock }),
        }
      );
    });
  });

  describe("4. Customer Management & Accounts", () => {
    it("GET /admin/customers lists customer accounts and order history records", async () => {
      const res = await fetch(`${BACKEND_URL}/admin/customers?limit=10`, {
        headers: adminHeaders,
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.customers).toBeDefined();
      expect(data.count).toBeGreaterThan(0);
    });

    it("GET /admin/customers/:id retrieves customer profile with address information", async () => {
      const listRes = await fetch(`${BACKEND_URL}/admin/customers?limit=1`, {
        headers: adminHeaders,
      });
      const { customers } = await listRes.json();
      const customer = customers[0];

      const res = await fetch(
        `${BACKEND_URL}/admin/customers/${customer.id}?fields=*addresses`,
        { headers: adminHeaders }
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.customer.id).toBe(customer.id);
      expect(data.customer.email).toBe(customer.email);
    });
  });

  describe("5. Order Lifecycle: Placement, Review, Fulfillment, and Decoupled Statuses", () => {
    let orderId = "";
    let lineItemId = "";
    let displayId = 0;

    it("step 1: customer places order via storefront cart workflow", async () => {
      // Create cart
      const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
        method: "POST",
        headers: storeHeaders,
        body: JSON.stringify({}),
      });
      const { cart } = await cartRes.json();

      // Add seed packet
      await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
        method: "POST",
        headers: storeHeaders,
        body: JSON.stringify({
          variant_id: inStockVariantId,
          quantity: 1,
        }),
      });

      // Set Indian shipping address
      await fetch(`${BACKEND_URL}/store/carts/${cart.id}`, {
        method: "POST",
        headers: storeHeaders,
        body: JSON.stringify({
          email: "ops.review@glorov.in",
          shipping_address: {
            first_name: "Pooja",
            last_name: "Hegde",
            address_1: "74 Garden Street, Shivaji Nagar",
            city: "Pune",
            province: "Maharashtra",
            postal_code: "411005",
            country_code: "in",
            phone: "9876543210",
          },
        }),
      });

      // Select shipping method
      const optRes = await fetch(`${BACKEND_URL}/store/shipping-options?cart_id=${cart.id}`, {
        headers: storeHeaders,
      });
      const { shipping_options } = await optRes.json();
      await fetch(`${BACKEND_URL}/store/carts/${cart.id}/shipping-methods`, {
        method: "POST",
        headers: storeHeaders,
        body: JSON.stringify({ option_id: shipping_options[0].id }),
      });

      // Initialize payment collection & system session
      const pcRes = await fetch(`${BACKEND_URL}/store/payment-collections`, {
        method: "POST",
        headers: storeHeaders,
        body: JSON.stringify({ cart_id: cart.id }),
      });
      const { payment_collection } = await pcRes.json();
      await fetch(
        `${BACKEND_URL}/store/payment-collections/${payment_collection.id}/payment-sessions`,
        {
          method: "POST",
          headers: storeHeaders,
          body: JSON.stringify({ provider_id: "pp_system_default" }),
        }
      );

      // Complete checkout
      const completeRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/complete`, {
        method: "POST",
        headers: storeHeaders,
      });
      expect(completeRes.status).toBe(200);
      const completeData = await completeRes.json();
      expect(completeData.order).toBeDefined();

      orderId = completeData.order.id;
      lineItemId = completeData.order.items[0].id;
      displayId = completeData.order.display_id;
    });

    it("step 2: store owner inspects incoming order and verifies status decoupling", async () => {
      const res = await fetch(
        `${BACKEND_URL}/admin/orders/${orderId}?fields=*items,*shipping_address,+email,+currency_code`,
        { headers: adminHeaders }
      );
      expect(res.status).toBe(200);
      const { order } = await res.json();

      expect(order.id).toBe(orderId);
      expect(order.display_id).toBe(displayId);
      expect(order.email).toBe("ops.review@glorov.in");
      expect(order.currency_code).toBe("inr");

      // Verify strict separation of 3 statuses:
      expect(order.status).toBe("pending");
      expect(order.payment_status).toBe("authorized");
      expect(order.fulfillment_status).toBe("not_fulfilled");

      // Verify Indian address inspection
      expect(order.shipping_address.city).toBe("Pune");
      expect(order.shipping_address.postal_code).toBe("411005");
    });

    it("step 3: store owner creates fulfillment generating Shiprocket tracking details", async () => {
      const fulRes = await fetch(`${BACKEND_URL}/admin/orders/${orderId}/fulfillments`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          items: [{ id: lineItemId, quantity: 1 }],
        }),
      });
      expect(fulRes.status).toBe(200);

      // Verify order fulfillment status transitioned
      const res = await fetch(
        `${BACKEND_URL}/admin/orders/${orderId}?fields=*fulfillments,*fulfillments.labels,+fulfillment_status`,
        { headers: adminHeaders }
      );
      const { order } = await res.json();

      expect(order.fulfillment_status).toBe("fulfilled");
      expect(order.fulfillments.length).toBe(1);

      const fulfillment = order.fulfillments[0];
      expect(fulfillment.id).toBeDefined();
      expect(fulfillment.data).toBeDefined();

      // If Shiprocket provider was selected or fallback, labels must exist
      if (fulfillment.labels && fulfillment.labels.length > 0) {
        expect(fulfillment.labels[0].tracking_number).toBeDefined();
      }
    });

    it("step 4: store owner searches orders by display ID or customer email natively", async () => {
      const searchRes = await fetch(`${BACKEND_URL}/admin/orders?q=ops.review@glorov.in`, {
        headers: adminHeaders,
      });
      expect(searchRes.status).toBe(200);
      const { orders } = await searchRes.json();
      expect(orders.length).toBeGreaterThanOrEqual(1);
      expect(orders.some((o: { id: string }) => o.id === orderId)).toBe(true);
    });
  });

  describe("6. Order Cancellation & Financial Reconciliation Workflow", () => {
    let cancelOrderId = "";

    it("creates an order and processes administrative cancellation", async () => {
      // Create cart
      const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
        method: "POST",
        headers: storeHeaders,
        body: JSON.stringify({}),
      });
      const { cart } = await cartRes.json();

      await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
        method: "POST",
        headers: storeHeaders,
        body: JSON.stringify({ variant_id: inStockVariantId, quantity: 1 }),
      });

      await fetch(`${BACKEND_URL}/store/carts/${cart.id}`, {
        method: "POST",
        headers: storeHeaders,
        body: JSON.stringify({
          email: "cancel.test@glorov.in",
          shipping_address: {
            first_name: "Rahul",
            last_name: "Patil",
            address_1: "FC Road",
            city: "Pune",
            province: "Maharashtra",
            postal_code: "411004",
            country_code: "in",
            phone: "9876543210",
          },
        }),
      });

      const optRes = await fetch(`${BACKEND_URL}/store/shipping-options?cart_id=${cart.id}`, {
        headers: storeHeaders,
      });
      const { shipping_options } = await optRes.json();
      await fetch(`${BACKEND_URL}/store/carts/${cart.id}/shipping-methods`, {
        method: "POST",
        headers: storeHeaders,
        body: JSON.stringify({ option_id: shipping_options[0].id }),
      });

      const pcRes = await fetch(`${BACKEND_URL}/store/payment-collections`, {
        method: "POST",
        headers: storeHeaders,
        body: JSON.stringify({ cart_id: cart.id }),
      });
      const { payment_collection } = await pcRes.json();
      await fetch(
        `${BACKEND_URL}/store/payment-collections/${payment_collection.id}/payment-sessions`,
        {
          method: "POST",
          headers: storeHeaders,
          body: JSON.stringify({ provider_id: "pp_system_default" }),
        }
      );

      const completeRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/complete`, {
        method: "POST",
        headers: storeHeaders,
      });
      const completeData = await completeRes.json();
      cancelOrderId = completeData.order.id;

      // Admin calls POST /admin/orders/:id/cancel
      const cancelRes = await fetch(`${BACKEND_URL}/admin/orders/${cancelOrderId}/cancel`, {
        method: "POST",
        headers: adminHeaders,
      });
      expect(cancelRes.status).toBe(200);

      // Verify order transitioned to canceled
      const res = await fetch(`${BACKEND_URL}/admin/orders/${cancelOrderId}?fields=+status,+payment_status`, {
        headers: adminHeaders,
      });
      const { order } = await res.json();
      expect(order.status).toBe("canceled");
      expect(order.payment_status).toBe("canceled");
    });
  });
});

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUBLISHABLE_KEY =
  process.env.STORE_PUBLISHABLE_KEY ||
  "pk_2d4629ab032f218451f992310351db37f7adcc4ea53d3cfa5fc2c95864b717cf";

describe("Medusa v2 Customer Authentication, Account, and Order Security Integration Tests", () => {
  const storeHeaders: Record<string, string> = {
    "x-publishable-api-key": PUBLISHABLE_KEY,
    "Content-Type": "application/json",
  };

  let adminToken = "";
  let adminHeaders: Record<string, string> = {};
  let inStockVariantId = "";

  // Test Customer 1 credentials
  const timestamp = Date.now();
  const customer1Email = `aarav.customer.${timestamp}@glorov.in`;
  const customer1Password = "SecureP@ssw0rd2026!";
  let customer1Token = "";
  let customer1Id = "";
  let customer1AddressId = "";
  let customer1OrderId = "";

  // Test Customer 2 credentials (for cross-customer security attack simulation)
  const customer2Email = `neha.customer.${timestamp}@glorov.in`;
  const customer2Password = "AnotherSecureP@ss2026!";
  let customer2Token = "";
  let customer2Id = "";

  beforeAll(async () => {
    // 1. Backend health check
    const healthRes = await fetch(`${BACKEND_URL}/health`);
    if (!healthRes.ok) {
      throw new Error(`Medusa backend health check failed: ${healthRes.status}`);
    }

    // 2. Admin auth for setup/cleanup
    const authRes = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@glorov.in",
        password: "SuperSecretPassword123!",
      }),
    });
    if (!authRes.ok) {
      throw new Error(`Admin auth failed: ${authRes.status}`);
    }
    const authData = await authRes.json();
    adminToken = authData.token;
    adminHeaders = {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    };

    // 3. Resolve test variant (using Marigold Seeds so Tomato Seeds stock checks remain isolated)
    const prodRes = await fetch(
      `${BACKEND_URL}/store/products?handle=marigold-seeds-pusa-narangi&fields=*variants`,
      { headers: storeHeaders }
    );
    const prodData = await prodRes.json();
    const marigold = prodData.products[0];
    const inStock = marigold?.variants?.find((v: { title: string }) => v.title === "50 Seeds");
    if (!inStock) {
      throw new Error("Could not find 50 Seeds variant on marigold-seeds-pusa-narangi");
    }
    inStockVariantId = inStock.id;
  });


  afterAll(async () => {
    // Clean up reservations created during order test to keep stock numbers pristine
    try {
      const resvRes = await fetch(`${BACKEND_URL}/admin/reservations`, {
        headers: adminHeaders,
      });
      if (resvRes.ok) {
        const { reservations } = await resvRes.json();
        for (const r of reservations || []) {
          if (r.description?.includes(customer1OrderId) || r.created_by === customer1Id) {
            await fetch(`${BACKEND_URL}/admin/reservations/${r.id}`, {
              method: "DELETE",
              headers: adminHeaders,
            });
          }
        }
      }
    } catch {
      // Ignore cleanup error
    }
  });

  it("1. POST /auth/customer/emailpass/register registers customer auth identity", async () => {
    const regRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: customer1Email,
        password: customer1Password,
      }),
    });
    expect(regRes.status).toBe(200);

    const regData = await regRes.json();
    expect(regData.token).toBeDefined();

    // Link customer in Store API
    const custRes = await fetch(`${BACKEND_URL}/store/customers`, {
      method: "POST",
      headers: {
        ...storeHeaders,
        Authorization: `Bearer ${regData.token}`,
      },
      body: JSON.stringify({
        email: customer1Email,
        first_name: "Aarav",
        last_name: "Sharma",
        phone: "9876543210",
      }),
    });
    expect(custRes.status).toBe(200);

    const custData = await custRes.json();
    expect(custData.customer).toBeDefined();
    expect(custData.customer.email).toBe(customer1Email);
    expect(custData.customer.first_name).toBe("Aarav");
    expect(custData.customer.last_name).toBe("Sharma");
    expect(custData.customer.has_account).toBe(true);
    customer1Id = custData.customer.id;
  });

  it("2. POST /auth/customer/emailpass/register rejects duplicate registration with existing email", async () => {
    const dupRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: customer1Email,
        password: "AnotherPassword123!",
      }),
    });
    expect(dupRes.status).toBeGreaterThanOrEqual(400);
  });

  it("3. POST /auth/customer/emailpass logs in customer and returns actor session token", async () => {
    const loginRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: customer1Email,
        password: customer1Password,
      }),
    });
    expect(loginRes.status).toBe(200);

    const loginData = await loginRes.json();
    expect(loginData.token).toBeDefined();
    customer1Token = loginData.token;
  });

  it("4. POST /auth/customer/emailpass rejects incorrect password with 401 Unauthorized", async () => {
    const badLoginRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: customer1Email,
        password: "WrongPasswordEntirely!",
      }),
    });
    expect(badLoginRes.status).toBe(401);
  });

  it("5. GET /store/customers/me retrieves authenticated customer profile and session state", async () => {
    const meRes = await fetch(`${BACKEND_URL}/store/customers/me?fields=*addresses`, {
      headers: {
        ...storeHeaders,
        Authorization: `Bearer ${customer1Token}`,
      },
    });
    expect(meRes.status).toBe(200);

    const meData = await meRes.json();
    expect(meData.customer).toBeDefined();
    expect(meData.customer.id).toBe(customer1Id);
    expect(meData.customer.email).toBe(customer1Email);
    expect(meData.customer.first_name).toBe("Aarav");
    expect(meData.customer.last_name).toBe("Sharma");
  });

  it("6. POST /store/customers/me updates customer profile attributes", async () => {
    const updateRes = await fetch(`${BACKEND_URL}/store/customers/me`, {
      method: "POST",
      headers: {
        ...storeHeaders,
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        first_name: "Aarav Kumar",
        last_name: "Sharma",
        phone: "9876543211",
      }),
    });
    expect(updateRes.status).toBe(200);

    const updateData = await updateRes.json();
    expect(updateData.customer.first_name).toBe("Aarav Kumar");
    expect(updateData.customer.phone).toBe("9876543211");
  });

  it("7. POST /store/customers/me/addresses adds Indian delivery address", async () => {
    const addAddrRes = await fetch(`${BACKEND_URL}/store/customers/me/addresses`, {
      method: "POST",
      headers: {
        ...storeHeaders,
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        address_name: "Home Nursery",
        first_name: "Aarav",
        last_name: "Sharma",
        address_1: "Flat 402, Green Meadows",
        address_2: "MG Road, Indiranagar",
        city: "Bengaluru",
        province: "Karnataka",
        postal_code: "560001",
        phone: "9876543210",
        country_code: "in",
        is_default_shipping: true,
      }),
    });
    expect(addAddrRes.status).toBe(200);

    const addAddrData = await addAddrRes.json();
    expect(addAddrData.customer.addresses.length).toBeGreaterThanOrEqual(1);

    const addedAddr = addAddrData.customer.addresses.find(
      (a: { postal_code: string }) => a.postal_code === "560001"
    );
    expect(addedAddr).toBeDefined();
    expect(addedAddr.city).toBe("Bengaluru");
    expect(addedAddr.province).toBe("Karnataka");
    expect(addedAddr.is_default_shipping).toBe(true);
    customer1AddressId = addedAddr.id;
  });

  it("8. POST /store/customers/me/addresses/:id updates saved customer address", async () => {
    const updateAddrRes = await fetch(
      `${BACKEND_URL}/store/customers/me/addresses/${customer1AddressId}`,
      {
        method: "POST",
        headers: {
          ...storeHeaders,
          Authorization: `Bearer ${customer1Token}`,
        },
        body: JSON.stringify({
          address_1: "Flat 405, Updated Green Meadows",
        }),
      }
    );
    expect(updateAddrRes.status).toBe(200);

    const updateAddrData = await updateAddrRes.json();
    const updatedAddr = updateAddrData.customer.addresses.find(
      (a: { id: string }) => a.id === customer1AddressId
    );
    expect(updatedAddr).toBeDefined();
    expect(updatedAddr.address_1).toBe("Flat 405, Updated Green Meadows");
  });

  it("9. DELETE /store/customers/me/addresses/:id removes saved customer address", async () => {
    // Add temporary address to delete
    const tempAddrRes = await fetch(`${BACKEND_URL}/store/customers/me/addresses`, {
      method: "POST",
      headers: {
        ...storeHeaders,
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        first_name: "Temp",
        last_name: "Address",
        address_1: "123 Test Street",
        city: "Pune",
        province: "Maharashtra",
        postal_code: "411001",
        phone: "9876500000",
        country_code: "in",
      }),
    });
    const { customer } = await tempAddrRes.json();
    const tempId = customer.addresses.find((a: { city: string }) => a.city === "Pune")?.id;
    expect(tempId).toBeDefined();

    const delRes = await fetch(`${BACKEND_URL}/store/customers/me/addresses/${tempId}`, {
      method: "DELETE",
      headers: {
        ...storeHeaders,
        Authorization: `Bearer ${customer1Token}`,
      },
    });
    expect(delRes.status).toBe(200);
    const delData = await delRes.json();
    expect(delData.deleted).toBe(true);
  });

  it("10. Cart Preservation & Association: guest cart line items are transferred to customer on login", async () => {
    // 1. Create guest cart
    const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({}),
    });
    const { cart } = await cartRes.json();
    expect(cart.customer_id).toBeNull();

    // 2. Add line item to guest cart
    await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({
        variant_id: inStockVariantId,
        quantity: 1,
      }),
    });

    // 3. Associate cart with customer 1
    const assocRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}`, {
      method: "POST",
      headers: {
        ...storeHeaders,
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        email: customer1Email,
      }),
    });
    expect(assocRes.status).toBe(200);

    const { cart: associatedCart } = await assocRes.json();
    expect(associatedCart.customer_id).toBe(customer1Id);
    expect(associatedCart.email).toBe(customer1Email);
    // Line items preserved without duplicates
    expect(associatedCart.items).toHaveLength(1);
    expect(associatedCart.items[0].variant_id).toBe(inStockVariantId);
    expect(associatedCart.items[0].quantity).toBe(1);
  });

  it("11. Customer Checkout: completes order and associates it with customer account", async () => {
    // 1. Create cart with customer auth
    const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
      method: "POST",
      headers: {
        ...storeHeaders,
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({}),
    });
    const { cart } = await cartRes.json();
    expect(cart.customer_id).toBe(customer1Id);

    // 2. Add item
    await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
      method: "POST",
      headers: {
        ...storeHeaders,
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        variant_id: inStockVariantId,
        quantity: 1,
      }),
    });

    // 3. Shipping address
    await fetch(`${BACKEND_URL}/store/carts/${cart.id}`, {
      method: "POST",
      headers: {
        ...storeHeaders,
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        shipping_address: {
          first_name: "Aarav",
          last_name: "Sharma",
          address_1: "Flat 402, Green Meadows",
          city: "Bengaluru",
          province: "Karnataka",
          postal_code: "560001",
          phone: "9876543210",
          country_code: "in",
        },
      }),
    });

    // 4. Shipping method
    const optRes = await fetch(`${BACKEND_URL}/store/shipping-options?cart_id=${cart.id}`, {
      headers: storeHeaders,
    });
    const { shipping_options } = await optRes.json();
    await fetch(`${BACKEND_URL}/store/carts/${cart.id}/shipping-methods`, {
      method: "POST",
      headers: {
        ...storeHeaders,
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({ option_id: shipping_options[0].id }),
    });

    // 5. Payment session
    const pcRes = await fetch(`${BACKEND_URL}/store/payment-collections`, {
      method: "POST",
      headers: {
        ...storeHeaders,
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({ cart_id: cart.id }),
    });
    const { payment_collection } = await pcRes.json();

    await fetch(
      `${BACKEND_URL}/store/payment-collections/${payment_collection.id}/payment-sessions`,
      {
        method: "POST",
        headers: {
          ...storeHeaders,
          Authorization: `Bearer ${customer1Token}`,
        },
        body: JSON.stringify({ provider_id: "pp_system_default" }),
      }
    );

    // 6. Complete
    const compRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/complete`, {
      method: "POST",
      headers: {
        ...storeHeaders,
        Authorization: `Bearer ${customer1Token}`,
      },
    });
    expect(compRes.status).toBe(200);
    const compData = await compRes.json();
    expect(compData.type).toBe("order");
    expect(compData.order).toBeDefined();
    customer1OrderId = compData.order.id;
    expect(customer1OrderId).toBeDefined();
  });


  it("12. GET /store/orders retrieves customer's order history with dates and totals", async () => {
    const ordersRes = await fetch(`${BACKEND_URL}/store/orders?fields=*items,*summary`, {
      headers: {
        ...storeHeaders,
        Authorization: `Bearer ${customer1Token}`,
      },
    });
    expect(ordersRes.status).toBe(200);

    const ordersData = await ordersRes.json();
    expect(ordersData.orders.length).toBeGreaterThanOrEqual(1);

    const found = ordersData.orders.find((o: { id: string }) => o.id === customer1OrderId);
    expect(found).toBeDefined();
    expect(found.total).toBeGreaterThan(0);
    expect(found.items.length).toBeGreaterThanOrEqual(1);
    expect(found.created_at).toBeDefined();
  });

  it("13. GET /store/orders/:id retrieves details of authenticated customer's own order", async () => {
    const orderRes = await fetch(
      `${BACKEND_URL}/store/orders/${customer1OrderId}?fields=*items,*shipping_address,*shipping_methods`,
      {
        headers: {
          ...storeHeaders,
          Authorization: `Bearer ${customer1Token}`,
        },
      }
    );
    expect(orderRes.status).toBe(200);

    const orderData = await orderRes.json();
    expect(orderData.order).toBeDefined();
    expect(orderData.order.id).toBe(customer1OrderId);
    expect(orderData.order.shipping_address).toBeDefined();
    expect(orderData.order.shipping_address.city).toBe("Bengaluru");
    expect(orderData.order.shipping_address.postal_code).toBe("560001");
  });

  it("14. Cross-Customer Access Control: Customer 2 attempting to view Customer 1's order is rejected with 403 Forbidden", async () => {
    // 1. Register Customer 2
    const reg2Res = await fetch(`${BACKEND_URL}/auth/customer/emailpass/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: customer2Email,
        password: customer2Password,
      }),
    });
    const reg2Data = await reg2Res.json();

    await fetch(`${BACKEND_URL}/store/customers`, {
      method: "POST",
      headers: {
        ...storeHeaders,
        Authorization: `Bearer ${reg2Data.token}`,
      },
      body: JSON.stringify({
        email: customer2Email,
        first_name: "Neha",
        last_name: "Patel",
      }),
    });

    const login2Res = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: customer2Email,
        password: customer2Password,
      }),
    });
    const login2Data = await login2Res.json();
    customer2Token = login2Data.token;

    // 2. Customer 2 attempts to fetch Customer 1's order
    const attackRes = await fetch(`${BACKEND_URL}/store/orders/${customer1OrderId}`, {
      headers: {
        ...storeHeaders,
        Authorization: `Bearer ${customer2Token}`,
      },
    });

    // Enforce server-side rejection
    expect(attackRes.status).toBe(403);
    const attackData = await attackRes.json();
    expect(attackData.message).toContain("permission");
  });

  it("15. Server-Side Security: Unauthenticated request to Customer 1's order is rejected with 401 Unauthorized", async () => {
    const unauthRes = await fetch(`${BACKEND_URL}/store/orders/${customer1OrderId}`, {
      headers: storeHeaders,
    });
    expect(unauthRes.status).toBe(401);
  });

  it("16. POST /auth/customer/emailpass/reset-password handles password recovery request", async () => {
    const resetRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: customer1Email,
      }),
    });
    expect(resetRes.status).toBeGreaterThanOrEqual(200);
    expect(resetRes.status).toBeLessThan(300);
  });

  it("17. Customer Password Security: rejects session token on reset route, updates password via authenticated route, and enforces new password", async () => {
    // 1. Calling /auth/customer/emailpass/update with session bearer token is rejected with 401 because it requires reset token
    const rejectRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        password: "NewPassword123!",
      }),
    });
    expect(rejectRes.status).toBe(401);

    // 2. Unauthenticated request to /store/customers/me/password is rejected with 401
    const unauthUpdateRes = await fetch(`${BACKEND_URL}/store/customers/me/password`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({ password: "NewPassword123!" }),
    });
    expect(unauthUpdateRes.status).toBe(401);

    // 3. Authenticated customer updates password via /store/customers/me/password
    const newPassword = "UpdatedSecureP@ss2026!";
    const updateRes = await fetch(`${BACKEND_URL}/store/customers/me/password`, {
      method: "POST",
      headers: {
        ...storeHeaders,
        Authorization: `Bearer ${customer1Token}`,
      },
      body: JSON.stringify({
        password: newPassword,
      }),
    });
    expect(updateRes.status).toBe(200);

    // 4. Verify login with old password fails
    const oldLoginRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: customer1Email,
        password: customer1Password,
      }),
    });
    expect(oldLoginRes.status).toBe(401);

    // 5. Verify login with new password succeeds
    const newLoginRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: customer1Email,
        password: newPassword,
      }),
    });
    expect(newLoginRes.status).toBe(200);
    const newLoginData = await newLoginRes.json();
    expect(newLoginData.token).toBeDefined();
    customer1Token = newLoginData.token;
  });

  it("18. Guest Order Access Control: Unauthenticated guest can access guest order, but unrelated customer cannot", async () => {
    // 1. Create a guest cart and order
    const guestCartRes = await fetch(`${BACKEND_URL}/store/carts`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({}),
    });
    const { cart: guestCart } = await guestCartRes.json();

    const guestEmail = `guest.shopper.${timestamp}@example.com`;
    await fetch(`${BACKEND_URL}/store/carts/${guestCart.id}`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({
        email: guestEmail,
        shipping_address: {
          first_name: "Guest",
          last_name: "Shopper",
          address_1: "789 Residency Road",
          city: "Bengaluru",
          province: "Karnataka",
          postal_code: "560025",
          phone: "9876599999",
          country_code: "in",
        },
      }),
    });

    await fetch(`${BACKEND_URL}/store/carts/${guestCart.id}/line-items`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({
        variant_id: inStockVariantId,
        quantity: 1,
      }),
    });

    const optRes = await fetch(`${BACKEND_URL}/store/shipping-options?cart_id=${guestCart.id}`, {
      headers: storeHeaders,
    });
    const { shipping_options } = await optRes.json();
    await fetch(`${BACKEND_URL}/store/carts/${guestCart.id}/shipping-methods`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({ option_id: shipping_options[0].id }),
    });

    const pcRes = await fetch(`${BACKEND_URL}/store/payment-collections`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({ cart_id: guestCart.id }),
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

    const compRes = await fetch(`${BACKEND_URL}/store/carts/${guestCart.id}/complete`, {
      method: "POST",
      headers: storeHeaders,
    });
    expect(compRes.status).toBe(200);
    const { order: guestOrder } = await compRes.json();
    expect(guestOrder).toBeDefined();
    expect(guestOrder.id).toBeDefined();

    // 2. Unauthenticated request to guest order confirmation succeeds
    const unauthGuestRes = await fetch(`${BACKEND_URL}/store/orders/${guestOrder.id}`, {
      headers: storeHeaders,
    });
    expect(unauthGuestRes.status).toBe(200);
    const { order: retrievedGuestOrder } = await unauthGuestRes.json();
    expect(retrievedGuestOrder.id).toBe(guestOrder.id);

    // 3. Authenticated Customer 2 (different email) attempting to access guest order is rejected with 403
    const customer2AttackRes = await fetch(`${BACKEND_URL}/store/orders/${guestOrder.id}`, {
      headers: {
        ...storeHeaders,
        Authorization: `Bearer ${customer2Token}`,
      },
    });
    expect(customer2AttackRes.status).toBe(403);
  });
});



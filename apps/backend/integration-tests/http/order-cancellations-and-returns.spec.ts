const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUBLISHABLE_KEY =
  process.env.STORE_PUBLISHABLE_KEY ||
  "pk_2d4629ab032f218451f992310351db37f7adcc4ea53d3cfa5fc2c95864b717cf";

describe("Medusa v2 Order Cancellations, Returns, and Refund Workflows Integration Tests", () => {
  const storeHeaders: Record<string, string> = {
    "x-publishable-api-key": PUBLISHABLE_KEY,
    "Content-Type": "application/json",
  };

  let adminToken = "";
  let adminHeaders: Record<string, string> = {};
  let inStockVariantId = "";

  // Test Customer
  const timestamp = Date.now();
  const customerEmail = `cancellation.test.${timestamp}@glorov.in`;
  const customerPassword = "SecureCustomerP@ss2026!";
  let customerToken = "";
  let customerId = "";
  let customerHeaders: Record<string, string> = {};
  let unauthorizedHeaders: Record<string, string> = {};

  beforeAll(async () => {
    // 1. Backend health check
    const healthRes = await fetch(`${BACKEND_URL}/health`);
    if (!healthRes.ok) {
      throw new Error(`Medusa backend health check failed: ${healthRes.status}`);
    }

    // 2. Admin auth
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

    // 3. Register Customer
    const regRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: customerEmail,
        password: customerPassword,
      }),
    });
    if (!regRes.ok) {
      throw new Error(`Customer registration failed: ${regRes.status}`);
    }
    const regData = await regRes.json();
    customerToken = regData.token;

    // Link customer in Store API
    const custRes = await fetch(`${BACKEND_URL}/store/customers`, {
      method: "POST",
      headers: {
        ...storeHeaders,
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        email: customerEmail,
        first_name: "Pooja",
        last_name: "Nair",
        phone: "9876543210",
      }),
    });
    if (!custRes.ok) {
      throw new Error(`Customer store record creation failed: ${custRes.status}`);
    }
    const custData = await custRes.json();
    customerId = custData.customer.id;

    // Log in to obtain actor-scoped session token
    const loginRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: customerEmail, password: customerPassword }),
    });
    const loginData = await loginRes.json();
    customerHeaders = {
      ...storeHeaders,
      Authorization: `Bearer ${loginData.token}`,
    };

    // 4. Register second unauthorized customer for cross-customer authorization tests
    const unauthEmail = `unauth.${timestamp}@glorov.in`;
    const unauthRegRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: unauthEmail, password: customerPassword }),
    });
    const unauthRegData = await unauthRegRes.json();
    await fetch(`${BACKEND_URL}/store/customers`, {
      method: "POST",
      headers: {
        ...storeHeaders,
        Authorization: `Bearer ${unauthRegData.token}`,
      },
      body: JSON.stringify({
        email: unauthEmail,
        first_name: "Sneha",
        last_name: "Reddy",
      }),
    });

    const unauthLoginRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: unauthEmail, password: customerPassword }),
    });
    const unauthLoginData = await unauthLoginRes.json();
    unauthorizedHeaders = {
      ...storeHeaders,
      Authorization: `Bearer ${unauthLoginData.token}`,
    };

    // 5. Resolve test seed variant (Desi Tomato Seeds)
    const prodRes = await fetch(
      `${BACKEND_URL}/store/products?handle=tomato-seeds-desi&fields=*variants`,
      { headers: storeHeaders }
    );
    const prodData = await prodRes.json();
    const tomato = prodData.products?.[0];
    const variant = tomato?.variants?.find((v: { title: string }) => v.title === "20 Seeds") || tomato?.variants?.[0];
    if (!variant) {
      throw new Error("Test variant not found for order cancellation integration test");
    }
    inStockVariantId = variant.id;
  });

  // Helper to place an order for the test customer
  async function placeTestOrder(paymentProviderId = "pp_system_default") {
    // 1. Create cart
    const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
      method: "POST",
      headers: customerHeaders,
      body: JSON.stringify({}),
    });
    const { cart } = await cartRes.json();

    // 2. Add line item
    await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
      method: "POST",
      headers: customerHeaders,
      body: JSON.stringify({
        variant_id: inStockVariantId,
        quantity: 1,
      }),
    });

    // 3. Add shipping address
    await fetch(`${BACKEND_URL}/store/carts/${cart.id}`, {
      method: "POST",
      headers: customerHeaders,
      body: JSON.stringify({
        shipping_address: {
          first_name: "Pooja",
          last_name: "Nair",
          address_1: "704 Botanical Heights, Shivaji Nagar",
          city: "Pune",
          province: "Maharashtra",
          postal_code: "411005",
          phone: "9876543210",
          country_code: "in",
        },
      }),
    });

    // 4. Set shipping method
    const optRes = await fetch(`${BACKEND_URL}/store/shipping-options?cart_id=${cart.id}`, {
      headers: storeHeaders,
    });
    const { shipping_options } = await optRes.json();
    await fetch(`${BACKEND_URL}/store/carts/${cart.id}/shipping-methods`, {
      method: "POST",
      headers: customerHeaders,
      body: JSON.stringify({ option_id: shipping_options[0].id }),
    });

    // 5. Create payment collection & session
    const pcRes = await fetch(`${BACKEND_URL}/store/payment-collections`, {
      method: "POST",
      headers: customerHeaders,
      body: JSON.stringify({ cart_id: cart.id }),
    });
    const { payment_collection } = await pcRes.json();

    await fetch(
      `${BACKEND_URL}/store/payment-collections/${payment_collection.id}/payment-sessions`,
      {
        method: "POST",
        headers: customerHeaders,
        body: JSON.stringify({ provider_id: paymentProviderId }),
      }
    );

    // 6. Complete cart to create order
    const compRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/complete`, {
      method: "POST",
      headers: customerHeaders,
      body: JSON.stringify({}),
    });
    const compData = await compRes.json();
    return compData.order;
  }

  // =========================================================================
  // 1. Administrative Endpoint Security & Access Control
  // =========================================================================
  describe("1. Administrative Endpoint Access Control", () => {
    it("returns 401 Unauthorized for admin refund endpoint without auth", async () => {
      const res = await fetch(`${BACKEND_URL}/admin/orders/order_test/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_inr: 500 }),
      });
      expect(res.status).toBe(401);
    });

    it("returns 401 Unauthorized for admin COD refund endpoint without auth", async () => {
      const res = await fetch(`${BACKEND_URL}/admin/payments/cod/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: "order_test",
          amount_inr: 500,
          bank_account_number: "1234567890",
          bank_ifsc: "HDFC0001234",
          account_holder_name: "Test",
          bank_utr: "UTR123456",
        }),
      });
      expect(res.status).toBe(401);
    });

    it("returns 401 Unauthorized for admin return inventory triage without auth", async () => {
      const res = await fetch(
        `${BACKEND_URL}/admin/orders/order_test/return-inventory-triage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: [
              {
                line_item_id: "item_01",
                quantity: 1,
                condition: "unopened_sealed_seeds",
                restock: true,
              },
            ],
          }),
        }
      );
      expect(res.status).toBe(401);
    });
  })

  // =========================================================================
  // 2. Customer Order Cancellation Workflow
  // =========================================================================
  describe("2. Customer Order Cancellation Workflow", () => {
    let orderToCancel: any

    beforeAll(async () => {
      orderToCancel = await placeTestOrder()
      expect(orderToCancel).toBeDefined()
      expect(orderToCancel.id).toBeDefined()
    })

    it("successfully cancels an un-dispatched order via cancelOrderWorkflow", async () => {
      const cancelRes = await fetch(
        `${BACKEND_URL}/store/orders/${orderToCancel.id}/cancel`,
        {
          method: "POST",
          headers: customerHeaders,
          body: JSON.stringify({
            reason: "Customer changed mind before dispatch",
            customer_note: "Need to change shipping address",
          }),
        }
      )

      expect(cancelRes.status).toBe(200)
      const cancelData = await cancelRes.json()
      expect(cancelData.success).toBe(true)
      expect(cancelData.status).toBe("canceled")
      expect(cancelData.order_id).toBe(orderToCancel.id)

      // Query order in Medusa to verify state
      const checkRes = await fetch(`${BACKEND_URL}/admin/orders/${orderToCancel.id}`, {
        headers: adminHeaders,
      })
      const { order: freshOrder } = await checkRes.json()
      expect(freshOrder.status).toBe("canceled")
      expect(freshOrder.metadata?.cancellation).toBeDefined()
      expect(freshOrder.metadata.cancellation.reason).toBe("Customer changed mind before dispatch")
    })

    it("rejects duplicate cancellation on an already canceled order", async () => {
      const dupRes = await fetch(
        `${BACKEND_URL}/store/orders/${orderToCancel.id}/cancel`,
        {
          method: "POST",
          headers: customerHeaders,
          body: JSON.stringify({ reason: "Canceling again" }),
        }
      )

      expect(dupRes.status).toBe(400)
      const dupData = await dupRes.json()
      expect(dupData.success).toBe(false)
      expect(dupData.message).toContain("already canceled")
    })

    it("prevents an unauthorized second customer from cancelling another customer's order (403 Forbidden)", async () => {
      const targetOrder = await placeTestOrder()
      const unauthCancelRes = await fetch(
        `${BACKEND_URL}/store/orders/${targetOrder.id}/cancel`,
        {
          method: "POST",
          headers: unauthorizedHeaders,
          body: JSON.stringify({ reason: "Malicious cancellation attempt" }),
        }
      )

      expect(unauthCancelRes.status).toBe(403)
      const unauthData = await unauthCancelRes.json()
      expect(unauthData.message).toContain("permission")
    })

    it("rejects cancellation request with invalid body payload (400 Bad Request)", async () => {
      const freshOrder = await placeTestOrder()
      const invalidRes = await fetch(
        `${BACKEND_URL}/store/orders/${freshOrder.id}/cancel`,
        {
          method: "POST",
          headers: customerHeaders,
          body: JSON.stringify({ reason: "" }), // Empty reason violates schema
        }
      )

      expect(invalidRes.status).toBe(400)
      const invalidData = await invalidRes.json()
      expect(invalidData.message).toContain("reason is required")
    })
  })

  // =========================================================================
  // 3. Customer Return Requests & Administrative Review
  // =========================================================================
  describe("3. Customer Return Requests & Administrative Review", () => {
    let returnOrder: any
    let lineItemId = ""
    let createdRequestId = ""

    beforeAll(async () => {
      returnOrder = await placeTestOrder()
      lineItemId = returnOrder.items?.[0]?.id
      expect(lineItemId).toBeDefined()
    })

    it("rejects return request on unfulfilled order (customer must cancel instead)", async () => {
      const earlyRes = await fetch(
        `${BACKEND_URL}/store/orders/${returnOrder.id}/return-request`,
        {
          method: "POST",
          headers: customerHeaders,
          body: JSON.stringify({
            items: [
              {
                line_item_id: lineItemId,
                quantity: 1,
                reason: "damaged_in_transit",
              },
            ],
          }),
        }
      )

      expect(earlyRes.status).toBe(400)
      const earlyData = await earlyRes.json()
      expect(earlyData.message).toContain("dispatched or delivered")
    })

    it("submits a botanical return request once order is fulfilled", async () => {
      // 1. Fulfill order via admin fulfillment
      const fulRes = await fetch(
        `${BACKEND_URL}/admin/orders/${returnOrder.id}/fulfillments`,
        {
          method: "POST",
          headers: adminHeaders,
          body: JSON.stringify({
            items: [{ id: lineItemId, quantity: 1 }],
          }),
        }
      )
      expect(fulRes.status).toBe(200)

      // 2. Submit return request
      const retRes = await fetch(
        `${BACKEND_URL}/store/orders/${returnOrder.id}/return-request`,
        {
          method: "POST",
          headers: customerHeaders,
          body: JSON.stringify({
            items: [
              {
                line_item_id: lineItemId,
                quantity: 1,
                reason: "damaged_in_transit",
                customer_note: "Outer envelope crushed and seed packet punctured",
              },
            ],
            customer_notes: "Requesting botanical replacement packet or refund",
          }),
        }
      )

      expect(retRes.status).toBe(201)
      const retData = await retRes.json()
      expect(retData.success).toBe(true)
      expect(retData.return_request?.id).toBeDefined()
      createdRequestId = retData.return_request.id
    })

    it("retrieves submitted return requests with sanitized status for the customer", async () => {
      const getRes = await fetch(
        `${BACKEND_URL}/store/orders/${returnOrder.id}/return-request`,
        { headers: customerHeaders }
      )

      expect(getRes.status).toBe(200)
      const getData = await getRes.json()
      expect(getData.return_requests).toBeDefined()
      expect(getData.return_requests.length).toBeGreaterThanOrEqual(1)

      const targetReq = getData.return_requests.find(
        (r: { id: string }) => r.id === createdRequestId
      )
      expect(targetReq).toBeDefined()
      expect(targetReq.status).toBe("pending_review")
      expect(targetReq.items[0].line_item_id).toBe(lineItemId)
    })

    it("admin reviews and approves the return request", async () => {
      const reviewRes = await fetch(
        `${BACKEND_URL}/admin/orders/${returnOrder.id}/return-requests/${createdRequestId}/review`,
        {
          method: "POST",
          headers: adminHeaders,
          body: JSON.stringify({
            decision: "approved",
            decision_notes: "Verified transit damage from outer parcel photographs",
            return_action: "approve_with_refund",
            return_shipping_required: false, // Perishable/damaged seeds writeoff
          }),
        }
      )

      expect(reviewRes.status).toBe(200)
      const reviewData = await reviewRes.json()
      expect(reviewData.success).toBe(true)
      expect(reviewData.return_request?.status).toBe("approved")
      expect(reviewData.return_request?.seller_decision?.return_action).toBe("approve_with_refund")

      // Customer view reflects the approval
      const custGetRes = await fetch(
        `${BACKEND_URL}/store/orders/${returnOrder.id}/return-request`,
        { headers: customerHeaders }
      )
      const custGetData = await custGetRes.json()
      const updatedReq = custGetData.return_requests.find(
        (r: { id: string }) => r.id === createdRequestId
      )
      expect(updatedReq.status).toBe("approved")
    })

    it("rejects duplicate return request exceeding unreturned quantity (400 Bad Request)", async () => {
      const dupRetRes = await fetch(
        `${BACKEND_URL}/store/orders/${returnOrder.id}/return-request`,
        {
          method: "POST",
          headers: customerHeaders,
          body: JSON.stringify({
            items: [
              {
                line_item_id: lineItemId,
                quantity: 1,
                reason: "damaged_in_transit",
              },
            ],
          }),
        }
      )

      expect(dupRetRes.status).toBe(400)
      const dupRetData = await dupRetRes.json()
      expect(dupRetData.message).toContain("already been submitted for return")
    })
  })

  // =========================================================================
  // 4. Admin Refund & COD Guardrails
  // =========================================================================
  describe("4. Admin Refund & COD Guardrails", () => {
    it("rejects automated card/UPI gateway refund on Cash on Delivery orders", async () => {
      const codOrder = await placeTestOrder("pp_cod_cod")

      const refundRes = await fetch(
        `${BACKEND_URL}/admin/orders/${codOrder.id}/refund`,
        {
          method: "POST",
          headers: adminHeaders,
          body: JSON.stringify({
            amount_inr: 100,
            reason: "customer_return",
          }),
        }
      )

      expect(refundRes.status).toBe(422)
      const refundData = await refundRes.json()
      expect(refundData.message).toContain("Cash on Delivery (COD)")
    })

    it("rejects COD direct bank refund when bank IFSC code format is invalid", async () => {
      const codOrder = await placeTestOrder("pp_cod_cod")

      const badIfscRes = await fetch(`${BACKEND_URL}/admin/payments/cod/refund`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          order_id: codOrder.id,
          amount_inr: 250,
          bank_account_number: "987654321012",
          bank_ifsc: "INVALID_IFSC", // Invalid Indian IFSC
          account_holder_name: "Pooja Nair",
          bank_utr: "HDFC20261026001",
        }),
      })

      expect(badIfscRes.status).toBe(400)
      const badData = await badIfscRes.json()
      expect(badData.message).toContain("IFSC")
    })

    it("rejects COD refund if payment was never captured (cash was never collected)", async () => {
      const codOrder = await placeTestOrder("pp_cod_cod")

      const uncapRes = await fetch(`${BACKEND_URL}/admin/payments/cod/refund`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          order_id: codOrder.id,
          amount_inr: 250,
          bank_account_number: "987654321012",
          bank_ifsc: "HDFC0001234",
          account_holder_name: "Pooja Nair",
          bank_utr: "HDFC20261026002",
        }),
      })

      expect(uncapRes.status).toBe(422)
      const uncapData = await uncapRes.json()
      expect(uncapData.message).toContain("uncaptured")
    })
  })

  // =========================================================================
  // 5. Botanical Return Inventory Triage
  // =========================================================================
  describe("5. Botanical Return Inventory Triage", () => {
    let order: any
    let lineItemId = ""

    beforeAll(async () => {
      order = await placeTestOrder()
      lineItemId = order.items?.[0]?.id
      expect(lineItemId).toBeDefined()
    })

    it("triages unopened sealed seeds with restock to Pune Central Nursery Hub", async () => {
      const triageRes = await fetch(
        `${BACKEND_URL}/admin/orders/${order.id}/return-inventory-triage`,
        {
          method: "POST",
          headers: adminHeaders,
          body: JSON.stringify({
            items: [
              {
                line_item_id: lineItemId,
                quantity: 1,
                condition: "unopened_sealed_seeds",
                restock: true,
                notes: "Aluminum pouch seal intact, viability valid through 2027",
              },
            ],
            triage_notes: "Pune Hub receiving inspection",
          }),
        }
      )

      expect(triageRes.status).toBe(200)
      const triageData = await triageRes.json()
      expect(triageData.success).toBe(true)
      expect(triageData.triage_record.items[0].restocked).toBe(true)
      expect(triageData.triage_record.items[0].adjustment_quantity).toBe(1)
    })

    it("prevents duplicate restock on previously triaged line item (409 Conflict)", async () => {
      const dupRes = await fetch(
        `${BACKEND_URL}/admin/orders/${order.id}/return-inventory-triage`,
        {
          method: "POST",
          headers: adminHeaders,
          body: JSON.stringify({
            items: [
              {
                line_item_id: lineItemId,
                quantity: 1,
                condition: "unopened_sealed_seeds",
                restock: true,
              },
            ],
          }),
        }
      )

      expect(dupRes.status).toBe(409)
      const dupData = await dupRes.json()
      expect(dupData.message).toContain("already restocked previously")
    })

    it("rejects triage quantity that exceeds ordered line item quantity (400 Bad Request)", async () => {
      const excessRes = await fetch(
        `${BACKEND_URL}/admin/orders/${order.id}/return-inventory-triage`,
        {
          method: "POST",
          headers: adminHeaders,
          body: JSON.stringify({
            items: [
              {
                line_item_id: lineItemId,
                quantity: 999, // Exceeds ordered quantity (1)
                condition: "unopened_sealed_seeds",
                restock: false,
              },
            ],
          }),
        }
      )

      expect(excessRes.status).toBe(400)
      const excessData = await excessRes.json()
      expect(excessData.message).toContain("exceeds ordered quantity")
    })

    it("rejects restocking perishable live plants (botanical invariant violation)", async () => {
      const livePlantRes = await fetch(
        `${BACKEND_URL}/admin/orders/${order.id}/return-inventory-triage`,
        {
          method: "POST",
          headers: adminHeaders,
          body: JSON.stringify({
            items: [
              {
                line_item_id: lineItemId,
                quantity: 1,
                condition: "perishable_spoilage",
                restock: true, // Invalid attempt to restock perishable plant loss
              },
            ],
          }),
        }
      )

      expect(livePlantRes.status).toBe(400)
      const livePlantData = await livePlantRes.json()
      expect(livePlantData.message).toContain("Botanical invariant violation")
    })
  })
})

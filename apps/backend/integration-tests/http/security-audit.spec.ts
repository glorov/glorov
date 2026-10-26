import crypto from "crypto";

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUBLISHABLE_KEY =
  process.env.STORE_PUBLISHABLE_KEY ||
  "pk_2d4629ab032f218451f992310351db37f7adcc4ea53d3cfa5fc2c95864b717cf";

describe("GLOROV Security Audit & Hardening Integration Tests", () => {
  const storeHeaders: Record<string, string> = {
    "x-publishable-api-key": PUBLISHABLE_KEY,
    "Content-Type": "application/json",
  };

  let adminToken = "";
  let adminHeaders: Record<string, string> = {};
  let customerToken = "";
  let customerEmail = "";

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

    // 3. Register a test customer to test customer-to-admin boundary
    customerEmail = `sec-audit-${Date.now()}@glorov.in`;
    const custRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: customerEmail,
        password: "CustomerPassword123!",
      }),
    });
    if (custRes.ok) {
      const custData = await custRes.json();
      customerToken = custData.token;
    }
  });

  describe("1. Administrative Access Control & Privilege Separation", () => {
    it("rejects unauthenticated requests to /admin/products with 401 Unauthorized", async () => {
      const res = await fetch(`${BACKEND_URL}/admin/products`);
      expect(res.status).toBe(401);
    });

    it("rejects unauthenticated requests to /admin/orders with 401 Unauthorized", async () => {
      const res = await fetch(`${BACKEND_URL}/admin/orders`);
      expect(res.status).toBe(401);
    });

    it("rejects unauthenticated requests to /admin/products/csv-import/preview with 401 Unauthorized", async () => {
      const res = await fetch(`${BACKEND_URL}/admin/products/csv-import/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv_content: "handle,title,sku,price\n" }),
      });
      expect(res.status).toBe(401);
    });

    it("rejects unauthenticated requests to /admin/products/csv-import/apply with 401 Unauthorized", async () => {
      const res = await fetch(`${BACKEND_URL}/admin/products/csv-import/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [] }),
      });
      expect(res.status).toBe(401);
    });

    it("rejects customer bearer token on /admin/products with 401 Unauthorized", async () => {
      const res = await fetch(`${BACKEND_URL}/admin/products`, {
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
      });
      expect(res.status).toBe(401);
    });

    it("rejects customer bearer token on /admin/orders with 401 Unauthorized", async () => {
      const res = await fetch(`${BACKEND_URL}/admin/orders`, {
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
      });
      expect(res.status).toBe(401);
    });

    it("rejects customer bearer token on /admin/products/csv-import/preview with 401 Unauthorized", async () => {
      const res = await fetch(`${BACKEND_URL}/admin/products/csv-import/preview`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ csv_content: "handle,title,sku,price\n" }),
      });
      expect(res.status).toBe(401);
    });

    it("allows authenticated admin requests to /admin/products with 200 OK", async () => {
      const res = await fetch(`${BACKEND_URL}/admin/products?limit=1`, {
        headers: adminHeaders,
      });
      expect(res.status).toBe(200);
    });
  });

  describe("2. Webhook Authentication & Cryptographic Timing Attack Defense", () => {
    const validShiprocketToken =
      process.env.SHIPROCKET_WEBHOOK_TOKEN || "test_shiprocket_token_2026";

    it("rejects Shiprocket webhook with missing token with 401 Unauthorized", async () => {
      const res = await fetch(`${BACKEND_URL}/hooks/shiprocket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          awb: "AWB-INVALID",
          current_status: "DELIVERED",
        }),
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.message).toMatch(/token/i);
    });

    it("rejects Shiprocket webhook with invalid token with 401 Unauthorized", async () => {
      const res = await fetch(`${BACKEND_URL}/hooks/shiprocket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "completely-wrong-token-for-attack",
        },
        body: JSON.stringify({
          awb: "AWB-INVALID",
          current_status: "DELIVERED",
        }),
      });
      expect(res.status).toBe(401);
    });

    it("accepts Shiprocket webhook with valid token even if order not found (graceful 200 status)", async () => {
      const res = await fetch(`${BACKEND_URL}/hooks/shiprocket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": validShiprocketToken,
        },
        body: JSON.stringify({
          order_id: "non-existent-order-id-for-webhook-test",
          current_status: "IN TRANSIT",
        }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.received).toBe(true);
    });

    it("rejects Razorpay payment verification when signature is missing (400 Bad Request)", async () => {
      const res = await fetch(`${BACKEND_URL}/store/payment/razorpay/verify`, {
        method: "POST",
        headers: storeHeaders,
        body: JSON.stringify({
          cart_id: "cart_01H1234567890ABCDEF",
          razorpay_payment_id: "pay_test123",
          razorpay_order_id: "order_test123",
          // missing razorpay_signature
        }),
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
      expect(data.error).toMatch(/razorpay_signature/i);
    });

    it("rejects Razorpay payment verification with invalid signature (400 Bad Request)", async () => {
      const res = await fetch(`${BACKEND_URL}/store/payment/razorpay/verify`, {
        method: "POST",
        headers: storeHeaders,
        body: JSON.stringify({
          cart_id: "cart_01H1234567890ABCDEF",
          razorpay_payment_id: "pay_test123",
          razorpay_order_id: "order_test123",
          razorpay_signature: "invalid_tampered_signature_hex_value",
        }),
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/signature/i);
    });
  });

  describe("3. Rate Limiting Defense on Sensitive Endpoints", () => {
    it("returns X-RateLimit headers on /store/pincode-check", async () => {
      const res = await fetch(
        `${BACKEND_URL}/store/pincode-check?pincode=110001`,
        { headers: storeHeaders }
      );
      expect(res.status).toBe(200);

      const limit = res.headers.get("x-ratelimit-limit");
      const remaining = res.headers.get("x-ratelimit-remaining");

      // Rate limit headers must be provided
      expect(limit).toBeDefined();
      expect(Number(limit)).toBeGreaterThan(0);
      expect(remaining).toBeDefined();
    });

    it("tracks and decrements remaining quota on successive requests", async () => {
      const res1 = await fetch(
        `${BACKEND_URL}/store/pincode-check?pincode=560001`,
        { headers: storeHeaders }
      );
      const rem1 = Number(res1.headers.get("x-ratelimit-remaining"));

      const res2 = await fetch(
        `${BACKEND_URL}/store/pincode-check?pincode=560001`,
        { headers: storeHeaders }
      );
      const rem2 = Number(res2.headers.get("x-ratelimit-remaining"));

      expect(rem2).toBeLessThanOrEqual(rem1);
    });
  });

  describe("4. Malicious Input & CSV Denial-of-Service Defense", () => {
    it("rejects CSV preview with missing body or empty csv_content (400 Bad Request)", async () => {
      const res = await fetch(`${BACKEND_URL}/admin/products/csv-import/preview`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toMatch(/csv_content/i);
    });

    it("rejects oversized CSV upload exceeding 5MB with 413 Payload Too Large", async () => {
      const largeCsv = "a".repeat(5.1 * 1024 * 1024);
      const res = await fetch(`${BACKEND_URL}/admin/products/csv-import/preview`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          csv_content: largeCsv,
        }),
      });
      expect(res.status).toBe(413);
      const data = await res.json();
      expect(data.message).toMatch(/(exceeds maximum allowed size|request entity too large)/i);
    });

    it("safely handles rows with negative prices and script injection in CSV preview with detailed validation report", async () => {
      const maliciousCsv = [
        "product_title,handle,sku,price,packet_size,category,in_stock",
        'malicious-seeds,"<script>alert(1)</script>",MAL-001,-99.00,"50 Seeds",Vegetable Seeds,true',
      ].join("\n");

      const res = await fetch(`${BACKEND_URL}/admin/products/csv-import/preview`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ csv_content: maliciousCsv }),
      });
      expect(res.status).toBe(200);
      const { preview } = await res.json();
      expect(preview).toBeDefined();
      expect(preview.validation.is_valid).toBe(false);
      expect(preview.validation.errors.length).toBeGreaterThanOrEqual(1);
      expect(
        preview.validation.errors.some(
          (e: { field: string; message: string }) =>
            e.field === "price" || /price/i.test(e.message)
        )
      ).toBe(true);
    });

    it("handles SQL injection strings in storefront search safely without leaking internal data", async () => {
      const sqliPayload = "' OR '1'='1' --";
      const res = await fetch(
        `${BACKEND_URL}/store/products?q=${encodeURIComponent(sqliPayload)}`,
        { headers: storeHeaders }
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.products)).toBe(true);
    });
  });

  describe("5. Anti-IDOR & Order Data Protection", () => {
    it("returns 404 Not Found when attempting to access a non-existent order ID", async () => {
      const res = await fetch(
        `${BACKEND_URL}/store/orders/order_non_existent_random_id`,
        { headers: storeHeaders }
      );
      expect(res.status).toBe(404);
    });
  });
});

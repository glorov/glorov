const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUBLISHABLE_KEY =
  process.env.STORE_PUBLISHABLE_KEY ||
  "pk_2d4629ab032f218451f992310351db37f7adcc4ea53d3cfa5fc2c95864b717cf";

describe("Medusa v2 Product CSV Import and Inventory Reconciliation Integration Tests", () => {
  let adminToken = "";
  let adminHeaders: Record<string, string> = {};
  let customerToken = "";

  beforeAll(async () => {
    // 1. Health check
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

    // 3. Register a test customer to verify authorization rejection
    const customerEmail = `csv-import-tester-${Date.now()}@glorov.in`;
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

  describe("1. Access Control & Authorization Security", () => {
    it("rejects unauthenticated requests to preview endpoint with 401 Unauthorized", async () => {
      const res = await fetch(`${BACKEND_URL}/admin/products/csv-import/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv_content: "handle,title,sku,price\n" }),
      });
      expect(res.status).toBe(401);
    });

    it("rejects customer bearer token from accessing preview endpoint with 401 Unauthorized", async () => {
      if (!customerToken) return;
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

    it("rejects unauthenticated requests to confirm endpoint with 401 Unauthorized", async () => {
      const res = await fetch(`${BACKEND_URL}/admin/products/csv-import/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv_content: "handle,title,sku,price\n" }),
      });
      expect(res.status).toBe(401);
    });

    it("rejects customer bearer token from accessing confirm endpoint with 401 Unauthorized", async () => {
      if (!customerToken) return;
      const res = await fetch(`${BACKEND_URL}/admin/products/csv-import/confirm`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ csv_content: "handle,title,sku,price\n" }),
      });
      expect(res.status).toBe(401);
    });

    it("rejects empty payload with 400 Bad Request", async () => {
      const res = await fetch(`${BACKEND_URL}/admin/products/csv-import/preview`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain("must include 'csv_content'");
    });
  });

  describe("2. Preview & Validation Workflow (POST /admin/products/csv-import/preview)", () => {
    it("successfully previews valid Tomato Seeds CSV with 3 packet variants", async () => {
      const csv = `product_title,handle,description,category,status,variant_title,sku,packet_size,price,currency,initial_inventory_quantity,botanical_name,season
Tomato Seeds (Desi / Pusa Ruby),tomato-seeds-desi,Heirloom desi tomato,vegetable-seeds,published,20 Seeds,GLR-SD-TOM-020,20 Seeds,49.00,inr,150,Solanum lycopersicum,kharif
Tomato Seeds (Desi / Pusa Ruby),tomato-seeds-desi,Heirloom desi tomato,vegetable-seeds,published,50 Seeds,GLR-SD-TOM-050,50 Seeds,99.00,inr,80,Solanum lycopersicum,kharif
Tomato Seeds (Desi / Pusa Ruby),tomato-seeds-desi,Heirloom desi tomato,vegetable-seeds,published,100 Seeds,GLR-SD-TOM-100,100 Seeds,179.00,inr,50,Solanum lycopersicum,kharif`;

      const res = await fetch(`${BACKEND_URL}/admin/products/csv-import/preview`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ csv_content: csv }),
      });
      expect(res.status).toBe(200);

      const { preview } = await res.json();
      expect(preview).toBeDefined();
      expect(preview.validation.is_valid).toBe(true);
      expect(preview.validation.errors).toHaveLength(0);
      expect(preview.products_preview).toHaveLength(1);

      const product = preview.products_preview[0];
      expect(product.handle).toBe("tomato-seeds-desi");
      expect(product.variants).toHaveLength(3);
      expect(product.variants[0].sku).toBe("GLR-SD-TOM-020");
      expect(product.variants[0].price_inr).toBe("₹49.00");
    });

    it("reports validation errors for malformed CSV rows with line numbers", async () => {
      const malformedCsv = `product_title,handle,sku,price
,missing-title,GLR-TEST-001,45.00
Invalid Price Seed,invalid-price,GLR-TEST-002,-10.00
Missing Sku Seed,missing-sku,,50.00`;

      const res = await fetch(`${BACKEND_URL}/admin/products/csv-import/preview`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ csv_content: malformedCsv }),
      });
      expect(res.status).toBe(200);

      const { preview } = await res.json();
      expect(preview.validation.is_valid).toBe(false);
      expect(preview.validation.errors.length).toBeGreaterThanOrEqual(3);

      const codes = preview.validation.errors.map((e: { code: string }) => e.code);
      expect(codes).toContain("MISSING_REQUIRED_FIELD");
      expect(codes).toContain("INVALID_PRICE");
    });

    it("rejects duplicate SKUs within the same CSV with DUPLICATE_SKU_IN_FILE", async () => {
      const duplicateCsv = `product_title,handle,sku,price
Tomato 20 Seeds,tomato-20,GLR-SD-DUP-001,49.00
Tomato 50 Seeds,tomato-50,GLR-SD-DUP-001,89.00`;

      const res = await fetch(`${BACKEND_URL}/admin/products/csv-import/preview`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ csv_content: duplicateCsv }),
      });
      expect(res.status).toBe(200);

      const { preview } = await res.json();
      expect(preview.validation.is_valid).toBe(false);
      const dupError = preview.validation.errors.find(
        (e: { code: string }) => e.code === "DUPLICATE_SKU_IN_FILE"
      );
      expect(dupError).toBeDefined();
      expect(dupError.value).toBe("GLR-SD-DUP-001");
    });

    it("rejects conflicting product titles under the same handle with CONFLICTING_PRODUCT_DATA", async () => {
      const conflictCsv = `product_title,handle,sku,price
Palak Desi Spinach,palak-spinach-desi,GLR-SD-PLK-050,35.00
Methi Fenugreek,palak-spinach-desi,GLR-SD-MTH-050,35.00`;

      const res = await fetch(`${BACKEND_URL}/admin/products/csv-import/preview`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ csv_content: conflictCsv }),
      });
      expect(res.status).toBe(200);

      const { preview } = await res.json();
      expect(preview.validation.is_valid).toBe(false);
      const conflictError = preview.validation.errors.find(
        (e: { code: string }) => e.code === "CONFLICTING_PRODUCT_DATA"
      );
      expect(conflictError).toBeDefined();
    });
  });

  describe("3. Dry-Run Import Execution (dry_run: true)", () => {
    it("simulates proposed import without making any database changes", async () => {
      const uniqueHandle = `dryrun-seed-${Date.now()}`;
      const csv = `product_title,handle,sku,price,packet_size
Dry Run Seed,${uniqueHandle},GLR-DRY-001,29.00,50 Seeds`;

      const res = await fetch(`${BACKEND_URL}/admin/products/csv-import/confirm`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          csv_content: csv,
          dry_run: true,
        }),
      });
      expect(res.status).toBe(200);

      const { result } = await res.json();
      expect(result.success).toBe(true);
      expect(result.dry_run).toBe(true);
      expect(result.imported_products_count).toBe(1);

      // Verify product was NOT actually created in database
      const checkRes = await fetch(`${BACKEND_URL}/admin/products?handle=${uniqueHandle}`, {
        headers: adminHeaders,
      });
      const checkData = await checkRes.json();
      expect(checkData.products).toHaveLength(0);
    });
  });

  describe("4. Live Import Execution (POST /admin/products/csv-import/confirm)", () => {
    const importHandle = `coriander-seeds-desi-${Date.now()}`;
    const sku50 = `GLR-SD-COR-${Date.now().toString().slice(-4)}-050`;
    const sku100 = `GLR-SD-COR-${Date.now().toString().slice(-4)}-100`;

    it("imports a new seed product with multiple packet variants and pricing", async () => {
      const csv = `product_title,handle,description,category,status,variant_title,sku,packet_size,price,currency,initial_inventory_quantity,botanical_name,variety,sunlight,season
Coriander Heirloom (Desi Dhaniya),${importHandle},Aromatic Heirloom Desi Coriander,vegetable-seeds,published,50 Seeds,${sku50},50 Seeds,39.00,inr,100,Coriandrum sativum,Desi Pant Haritima,full_sun,rabi
Coriander Heirloom (Desi Dhaniya),${importHandle},Aromatic Heirloom Desi Coriander,vegetable-seeds,published,100 Seeds,${sku100},100 Seeds,69.00,inr,60,Coriandrum sativum,Desi Pant Haritima,full_sun,rabi`;

      const res = await fetch(`${BACKEND_URL}/admin/products/csv-import/confirm`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          csv_content: csv,
          dry_run: false,
          allow_inventory_updates: true,
        }),
      });
      expect(res.status).toBe(200);

      const { result } = await res.json();
      expect(result.success).toBe(true);
      expect(result.dry_run).toBe(false);
      expect(result.imported_products_count).toBe(1);
      expect(result.imported_variants_count).toBe(2);

      // Verify product and variants in Medusa catalog
      const prodRes = await fetch(
        `${BACKEND_URL}/admin/products?handle=${importHandle}&fields=*variants,*variants.prices`,
        { headers: adminHeaders }
      );
      expect(prodRes.status).toBe(200);
      const prodData = await prodRes.json();
      expect(prodData.products).toHaveLength(1);

      const importedProduct = prodData.products[0];
      expect(importedProduct.title).toBe("Coriander Heirloom (Desi Dhaniya)");
      expect(importedProduct.handle).toBe(importHandle);
      expect(importedProduct.variants).toHaveLength(2);

      const v50 = importedProduct.variants.find((v: { sku: string }) => v.sku === sku50);
      expect(v50).toBeDefined();
      const p50 = v50.prices.find((p: { currency_code: string }) => p.currency_code === "inr");
      expect(p50).toBeDefined();
      expect(p50.amount).toBe(3900); // ₹39.00

      const v100 = importedProduct.variants.find((v: { sku: string }) => v.sku === sku100);
      expect(v100).toBeDefined();
      const p100 = v100.prices.find((p: { currency_code: string }) => p.currency_code === "inr");
      expect(p100).toBeDefined();
      expect(p100.amount).toBe(6900); // ₹69.00
    });

    it("updates existing product without creating duplicate records", async () => {
      // Re-import with updated title and description
      const updatedCsv = `product_title,handle,description,category,status,variant_title,sku,packet_size,price,currency
Coriander Heirloom (Certified Organic),${importHandle},Updated certified organic heirloom description,vegetable-seeds,published,50 Seeds,${sku50},50 Seeds,45.00,inr`;

      const res = await fetch(`${BACKEND_URL}/admin/products/csv-import/confirm`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          csv_content: updatedCsv,
          dry_run: false,
        }),
      });
      expect(res.status).toBe(200);

      const { result } = await res.json();
      expect(result.success).toBe(true);
      expect(result.updated_products_count).toBe(1);
      expect(result.imported_products_count).toBe(0);

      // Verify no duplicates were created
      const prodRes = await fetch(`${BACKEND_URL}/admin/products?handle=${importHandle}`, {
        headers: adminHeaders,
      });
      const prodData = await prodRes.json();
      expect(prodData.products).toHaveLength(1);
      expect(prodData.products[0].title).toBe("Coriander Heirloom (Certified Organic)");
      expect(prodData.products[0].description).toBe(
        "Updated certified organic heirloom description"
      );
    });
  });

  describe("5. Inventory Reconciliation Workflow (POST /admin/products/csv-import/reconcile)", () => {
    it("compares imported counts against current stock levels without mutating stock (confirm_adjustment: false)", async () => {
      // SKU GLR-SD-TOM-050 is seeded in Pune Central Nursery Hub
      const csv = `sku,initial_inventory_quantity
GLR-SD-TOM-050,120`;

      const res = await fetch(`${BACKEND_URL}/admin/products/csv-import/reconcile`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          csv_content: csv,
          confirm_adjustment: false,
        }),
      });
      expect(res.status).toBe(200);

      const { reconciliation } = await res.json();
      expect(reconciliation).toBeDefined();
      expect(reconciliation.matched_skus).toBe(1);
      expect(reconciliation.adjustments_confirmed).toBe(false);
      expect(reconciliation.applied_adjustments_count).toBe(0);

      const item = reconciliation.reconciliation_items[0];
      expect(item.sku).toBe("GLR-SD-TOM-050");
      expect(item.imported_quantity).toBe(120);
      expect(item.current_stocked_quantity).toBeDefined();
      expect(item.variance).toBe(120 - item.current_stocked_quantity);

      // Verify stock in database was NOT modified
      const invRes = await fetch(`${BACKEND_URL}/admin/inventory-items?sku=GLR-SD-TOM-050`, {
        headers: adminHeaders,
      });
      const invData = await invRes.json();
      const locLevel = invData.inventory_items[0].location_levels[0];
      expect(locLevel.stocked_quantity).toBe(item.current_stocked_quantity);
    });

    it("applies stock adjustment when confirm_adjustment is explicitly true", async () => {
      // Get current stock
      const invRes = await fetch(`${BACKEND_URL}/admin/inventory-items?sku=GLR-SD-TOM-050`, {
        headers: adminHeaders,
      });
      const invData = await invRes.json();
      const originalStock = invData.inventory_items[0].location_levels[0].stocked_quantity;

      const targetStock = originalStock + 10;
      const csv = `sku,initial_inventory_quantity
GLR-SD-TOM-050,${targetStock}`;

      const res = await fetch(`${BACKEND_URL}/admin/products/csv-import/reconcile`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          csv_content: csv,
          confirm_adjustment: true,
        }),
      });
      expect(res.status).toBe(200);

      const { reconciliation } = await res.json();
      expect(reconciliation.adjustments_confirmed).toBe(true);
      expect(reconciliation.applied_adjustments_count).toBe(1);

      // Verify stock was updated in database
      const verifyRes = await fetch(`${BACKEND_URL}/admin/inventory-items?sku=GLR-SD-TOM-050`, {
        headers: adminHeaders,
      });
      const verifyData = await verifyRes.json();
      expect(verifyData.inventory_items[0].location_levels[0].stocked_quantity).toBe(targetStock);

      // Revert back for idempotency
      await fetch(`${BACKEND_URL}/admin/products/csv-import/reconcile`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          csv_content: `sku,initial_inventory_quantity\nGLR-SD-TOM-050,${originalStock}`,
          confirm_adjustment: true,
        }),
      });
    });
  });
});

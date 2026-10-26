const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUBLISHABLE_KEY =
  process.env.STORE_PUBLISHABLE_KEY ||
  "pk_2d4629ab032f218451f992310351db37f7adcc4ea53d3cfa5fc2c95864b717cf";

describe("Medusa Store API & Catalog Integration Tests", () => {
  const storeHeaders = {
    "x-publishable-api-key": PUBLISHABLE_KEY,
    "Content-Type": "application/json",
  };

  beforeAll(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      if (!res.ok) {
        throw new Error(`Health check returned status ${res.status}`);
      }
    } catch (e) {
      throw new Error(
        `Medusa backend is not reachable at ${BACKEND_URL}. ` +
          `Ensure the backend is running before running HTTP integration tests. Details: ${e}`
      );
    }
  });

  it("GET /store/products retrieves product catalog successfully", async () => {
    const res = await fetch(`${BACKEND_URL}/store/products`, {
      headers: storeHeaders,
    });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.products).toBeDefined();
    expect(Array.isArray(data.products)).toBe(true);
    expect(data.products.length).toBeGreaterThanOrEqual(1);

    const tomato = data.products.find(
      (p: { handle: string }) => p.handle === "tomato-seeds-desi"
    );
    expect(tomato).toBeDefined();
    expect(tomato.title).toContain("Tomato Seeds");
  });

  it("GET /store/products?handle=tomato-seeds-desi retrieves Tomato Seeds with 3 variants, SKUs, INR pricing, native inventory_quantity, and botanical metadata", async () => {
    const fields =
      "*variants,*variants.prices,+variants.inventory_quantity,*variants.inventory_items,*variants.inventory_items.inventory.location_levels,+metadata,*categories,*collection";
    const res = await fetch(
      `${BACKEND_URL}/store/products?handle=tomato-seeds-desi&fields=${fields}`,
      {
        headers: storeHeaders,
      }
    );
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.products).toHaveLength(1);
    const product = data.products[0];

    // 1. Verify single product with multiple variants
    expect(product.handle).toBe("tomato-seeds-desi");
    expect(product.variants).toHaveLength(3);

    // 2. Verify variant titles, SKUs, INR pricing, and native inventory_quantity
    const variant20 = product.variants.find((v: { title: string }) => v.title === "20 Seeds");
    const variant50 = product.variants.find((v: { title: string }) => v.title === "50 Seeds");
    const variant100 = product.variants.find((v: { title: string }) => v.title === "100 Seeds");

    expect(variant20).toBeDefined();
    expect(variant20.sku).toBe("GLR-SD-TOM-020");
    expect(variant20.inventory_quantity).toBeGreaterThanOrEqual(50);
    const price20 = variant20.prices.find((p: { currency_code: string }) => p.currency_code === "inr");
    expect(price20).toBeDefined();
    expect(price20.amount).toBe(4900); // ₹49

    expect(variant50).toBeDefined();
    expect(variant50.sku).toBe("GLR-SD-TOM-050");
    expect(variant50.inventory_quantity).toBeGreaterThanOrEqual(50);
    const price50 = variant50.prices.find((p: { currency_code: string }) => p.currency_code === "inr");
    expect(price50).toBeDefined();
    expect(price50.amount).toBe(9900); // ₹99

    expect(variant100).toBeDefined();
    expect(variant100.sku).toBe("GLR-SD-TOM-100");
    expect(variant100.inventory_quantity).toBe(0);
    const price100 = variant100.prices.find((p: { currency_code: string }) => p.currency_code === "inr");
    expect(price100).toBeDefined();
    expect(price100.amount).toBe(17900); // ₹179

    // 3. Verify Indian botanical metadata
    expect(product.metadata).toBeDefined();
    expect(product.metadata.common_name).toBe("Desi Tomato / Tamatar");
    expect(product.metadata.botanical_name).toBe("Solanum lycopersicum");
    expect(product.metadata.seed_type).toBe("Heirloom / Open-Pollinated");
    expect(product.metadata.variety).toBe("Pusa Ruby");
    expect(product.metadata.germination_time_range).toBe("6-10 days");
    expect(product.metadata.sowing_depth).toBe("0.5 cm");
    expect(product.metadata.sunlight).toBe("full_sun");
    expect(product.metadata.watering).toBe("daily");
    expect(product.metadata.season).toBe("kharif");
    expect(product.metadata.is_perishable).toBe(false);

    // 4. Verify category and collection associations
    expect(product.categories).toBeDefined();
    expect(product.categories.some((c: { handle: string }) => c.handle === "vegetable-seeds")).toBe(true);
    expect(product.collection).toBeDefined();
    expect(product.collection.handle).toBe("kitchen-garden-essentials");
  });

  it("GET /store/products/:id retrieves product by ID with full fields", async () => {
    // 1. Get product ID from list
    const listRes = await fetch(`${BACKEND_URL}/store/products?handle=tomato-seeds-desi`, {
      headers: storeHeaders,
    });
    const listData = await listRes.json();
    const productId = listData.products[0].id;

    // 2. Retrieve by ID
    const res = await fetch(
      `${BACKEND_URL}/store/products/${productId}?fields=*variants,*variants.prices,+variants.inventory_quantity,+metadata`,
      { headers: storeHeaders }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.product.id).toBe(productId);
    expect(data.product.title).toContain("Tomato Seeds");
    expect(data.product.variants).toHaveLength(3);
    expect(data.product.metadata.common_name).toBe("Desi Tomato / Tamatar");
  });

  it("GET /store/product-categories retrieves hierarchical categories", async () => {
    const res = await fetch(`${BACKEND_URL}/store/product-categories`, {
      headers: storeHeaders,
    });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.product_categories).toBeDefined();

    const handles = data.product_categories.map((c: { handle: string }) => c.handle);
    expect(handles).toContain("seeds");
    expect(handles).toContain("vegetable-seeds");
    expect(handles).toContain("flower-seeds");
    expect(handles).toContain("herb-seeds");
    expect(handles).toContain("live-plants");
    expect(handles).toContain("indoor-plants");
  });

  it("verifies inventory stock levels and out-of-stock behavior via cart line items", async () => {
    // 1. Fetch Tomato Seeds variants
    const prodRes = await fetch(
      `${BACKEND_URL}/store/products?handle=tomato-seeds-desi&fields=*variants,*variants.inventory_items,*variants.inventory_items.inventory.location_levels`,
      { headers: storeHeaders }
    );
    const prodData = await prodRes.json();
    const product = prodData.products[0];

    const variant20 = product.variants.find((v: { title: string }) => v.title === "20 Seeds");
    const variant100 = product.variants.find((v: { title: string }) => v.title === "100 Seeds");

    // Verify stock levels at location
    const stock20 = variant20.inventory_items[0].inventory.location_levels[0].stocked_quantity;
    const stock100 = variant100.inventory_items[0].inventory.location_levels[0].stocked_quantity;
    expect(stock20).toBeGreaterThanOrEqual(100);
    expect(stock100).toBe(0);

    // 2. Create a cart
    const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({ currency_code: "inr" }),
    });
    expect(cartRes.status).toBe(200);
    const { cart } = await cartRes.json();
    expect(cart.id).toBeDefined();

    // 3. Add in-stock variant (20 Seeds, qty 2) -> MUST SUCCEED
    const addInStockRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({
        variant_id: variant20.id,
        quantity: 2,
      }),
    });
    expect(addInStockRes.status).toBe(200);
    const inStockData = await addInStockRes.json();
    expect(inStockData.cart.items).toHaveLength(1);
    expect(inStockData.cart.items[0].quantity).toBe(2);

    // 4. Attempt to add out-of-stock variant (100 Seeds, qty 1) -> MUST FAIL with 400 insufficient_inventory
    const addOutOfStockRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({
        variant_id: variant100.id,
        quantity: 1,
      }),
    });
    expect(addOutOfStockRes.status).toBe(400);
    const outOfStockErr = await addOutOfStockRes.json();
    expect(outOfStockErr.type).toBe("not_allowed");
    expect(outOfStockErr.code).toBe("insufficient_inventory");

    // 5. Attempt to oversell (20 Seeds, requesting 200 units when only 150 stocked) -> MUST FAIL
    const oversellRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({
        variant_id: variant20.id,
        quantity: 200,
      }),
    });
    expect(oversellRes.status).toBe(400);
    const oversellErr = await oversellRes.json();
    expect(oversellErr.type).toBe("not_allowed");
    expect(oversellErr.code).toBe("insufficient_inventory");
  });

  it("verifies administrative access control: Admin endpoints reject unauthorized or storefront requests", async () => {
    // 1. Unauthenticated request to /admin/products must be rejected with 401
    const unauthRes = await fetch(`${BACKEND_URL}/admin/products`);
    expect(unauthRes.status).toBe(401);

    // 2. Request using storefront publishable key to /admin/products must be rejected with 401
    const storeKeyOnAdminRes = await fetch(`${BACKEND_URL}/admin/products`, {
      headers: storeHeaders,
    });
    expect(storeKeyOnAdminRes.status).toBe(401);

    // 3. Attempting to create a product on /admin/products with publishable key must be rejected
    const createRes = await fetch(`${BACKEND_URL}/admin/products`, {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({
        title: "Unauthorized Admin Product",
      }),
    });
    expect(createRes.status).toBe(401);
  });

  it("creates, publishes, retrieves via Store API, and cleans up a botanical product with packet-size variants via Admin API", async () => {
    // 1. Authenticate as Admin
    const authRes = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@glorov.in",
        password: "SuperSecretPassword123!",
      }),
    });
    expect(authRes.status).toBe(200);
    const { token: adminToken } = await authRes.json();
    expect(adminToken).toBeDefined();

    const adminHeaders = {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    };

    // 2. Resolve default sales channel
    const scRes = await fetch(`${BACKEND_URL}/admin/sales-channels`, {
      headers: adminHeaders,
    });
    expect(scRes.status).toBe(200);
    const { sales_channels } = await scRes.json();
    expect(sales_channels.length).toBeGreaterThan(0);
    const salesChannelId = sales_channels[0].id;

    // 3. Create a botanical product with 2 packet sizes via Admin API
    const testHandle = `coriander-seeds-test-${Date.now()}`;
    const createRes = await fetch(`${BACKEND_URL}/admin/products`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        title: "Test Coriander Seeds (Pusa Sugandh)",
        handle: testHandle,
        description: "Aromatic Indian Coriander seeds with high essential oil content.",
        status: "published",
        sales_channels: [{ id: salesChannelId }],
        options: [
          {
            title: "Packet Size",
            values: ["50g", "100g"],
          },
        ],
        variants: [
          {
            title: "50g",
            sku: `GLR-SD-COR-050-${Date.now()}`,
            options: { "Packet Size": "50g" },
            prices: [{ currency_code: "inr", amount: 3500 }],
            metadata: { packet_size_label: "50g", approx_seeds_per_packet: 500 },
          },
          {
            title: "100g",
            sku: `GLR-SD-COR-100-${Date.now()}`,
            options: { "Packet Size": "100g" },
            prices: [{ currency_code: "inr", amount: 6500 }],
            metadata: { packet_size_label: "100g", approx_seeds_per_packet: 1000 },
          },
        ],
        metadata: {
          common_name: "Desi Coriander / Dhaniya",
          botanical_name: "Coriandrum sativum",
          variety: "Pusa Sugandh",
          season: "rabi",
          sunlight: "full_sun",
          watering: "daily",
          approx_seeds_per_packet: 500,
          is_perishable: false,
        },
      }),
    });
    expect(createRes.status).toBe(200);
    const { product: createdProduct } = await createRes.json();
    expect(createdProduct.id).toBeDefined();
    expect(createdProduct.handle).toBe(testHandle);
    expect(createdProduct.variants).toHaveLength(2);

    try {
      // 4. Retrieve newly created product through Store API
      const storeRes = await fetch(
        `${BACKEND_URL}/store/products?handle=${testHandle}&fields=*variants,*variants.prices,+metadata`,
        { headers: storeHeaders }
      );
      expect(storeRes.status).toBe(200);
      const storeData = await storeRes.json();
      expect(storeData.products).toHaveLength(1);

      const storeProduct = storeData.products[0];
      expect(storeProduct.title).toBe("Test Coriander Seeds (Pusa Sugandh)");
      expect(storeProduct.variants).toHaveLength(2);
      expect(storeProduct.metadata.common_name).toBe("Desi Coriander / Dhaniya");
      expect(storeProduct.metadata.season).toBe("rabi");

      const var50 = storeProduct.variants.find((v: { title: string }) => v.title === "50g");
      const var100 = storeProduct.variants.find((v: { title: string }) => v.title === "100g");
      expect(var50).toBeDefined();
      expect(var100).toBeDefined();
      expect(var50.prices[0].amount).toBe(3500); // ₹35
      expect(var100.prices[0].amount).toBe(6500); // ₹65
    } finally {
      // 5. Clean up created test product via Admin API
      const delRes = await fetch(`${BACKEND_URL}/admin/products/${createdProduct.id}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      expect(delRes.status).toBe(200);

      // Verify product is no longer returned via Store API
      const verifyDelRes = await fetch(
        `${BACKEND_URL}/store/products?handle=${testHandle}`,
        { headers: storeHeaders }
      );
      const verifyDelData = await verifyDelRes.json();
      expect(verifyDelData.products).toHaveLength(0);
    }
  });

  describe("Product Discovery, Search, and Sorting via Store API", () => {
    it("GET /store/products?q=tomato returns matching tomato seeds and excludes unrelated specimens", async () => {
      const res = await fetch(`${BACKEND_URL}/store/products?q=tomato`, {
        headers: storeHeaders,
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.products).toBeDefined();
      expect(data.products.length).toBeGreaterThanOrEqual(1);

      const allMatch = data.products.every(
        (p: { title: string; handle: string; description?: string }) =>
          p.title.toLowerCase().includes("tomato") ||
          p.handle.toLowerCase().includes("tomato") ||
          (p.description && p.description.toLowerCase().includes("tomato"))
      );
      expect(allMatch).toBe(true);

      const hasSnakePlant = data.products.some(
        (p: { handle: string }) => p.handle === "snake-plant-golden-hahnii"
      );
      expect(hasSnakePlant).toBe(false);
    });

    it("GET /store/products?q=marigold returns marigold seeds", async () => {
      const res = await fetch(`${BACKEND_URL}/store/products?q=marigold`, {
        headers: storeHeaders,
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.products.length).toBeGreaterThanOrEqual(1);
      expect(data.products[0].title.toLowerCase()).toContain("marigold");
    });

    it("GET /store/products?order=-created_at returns products sorted with newest first", async () => {
      const res = await fetch(`${BACKEND_URL}/store/products?order=-created_at&limit=10`, {
        headers: storeHeaders,
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.products.length).toBeGreaterThanOrEqual(2);

      for (let i = 0; i < data.products.length - 1; i++) {
        const timeA = new Date(data.products[i].created_at).getTime();
        const timeB = new Date(data.products[i + 1].created_at).getTime();
        expect(timeA).toBeGreaterThanOrEqual(timeB);
      }
    });

    it("GET /store/products?category_id[]={id} filters catalog by category branch", async () => {
      // 1. Get vegetable seeds category ID
      const catRes = await fetch(`${BACKEND_URL}/store/product-categories`, {
        headers: storeHeaders,
      });
      const catData = await catRes.json();
      const vegCategory = catData.product_categories.find(
        (c: { handle: string }) => c.handle === "vegetable-seeds"
      );
      expect(vegCategory).toBeDefined();

      // 2. Fetch products for vegetable seeds category
      const res = await fetch(
        `${BACKEND_URL}/store/products?category_id[]=${vegCategory.id}&fields=*categories`,
        { headers: storeHeaders }
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.products.length).toBeGreaterThanOrEqual(1);

      // Verify each returned product belongs to vegetable seeds
      for (const p of data.products) {
        const hasVegCategory = p.categories.some(
          (c: { id: string }) => c.id === vegCategory.id
        );
        expect(hasVegCategory).toBe(true);
      }
    });

    it("Store API search returns empty array for nonexistent botanical queries gracefully without errors", async () => {
      const res = await fetch(
        `${BACKEND_URL}/store/products?q=nonexistentbotanicalvarietyxyz999`,
        { headers: storeHeaders }
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.products).toBeDefined();
      expect(data.products).toHaveLength(0);
      expect(data.count).toBe(0);
    });
  });
});

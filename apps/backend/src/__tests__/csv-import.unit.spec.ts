import { CsvParser } from "../modules/csv-import/csv-parser";
import { CsvValidator } from "../modules/csv-import/csv-validator";

describe("Product CSV Parser & Validator Unit Tests", () => {
  describe("1. RFC 4180 CSV Parsing & Normalization", () => {
    it("parses standard CSV with headers and trimmed fields", () => {
      const csv = `product_title,handle,sku,price,packet_size
Tomato Seeds,tomato-seeds,GLR-TOM-020,49.00,20 Seeds
Tomato Seeds,tomato-seeds,GLR-TOM-050,99.00,50 Seeds`;

      const rows = CsvParser.parse(csv);
      expect(rows).toHaveLength(2);
      expect(rows[0].product_title).toBe("Tomato Seeds");
      expect(rows[0].handle).toBe("tomato-seeds");
      expect(rows[0].sku).toBe("GLR-TOM-020");
      expect(rows[0].price).toBe("49.00");
      expect(rows[0].packet_size).toBe("20 Seeds");
      expect(rows[0].row_number).toBe(2);

      expect(rows[1].sku).toBe("GLR-TOM-050");
      expect(rows[1].row_number).toBe(3);
    });

    it("handles quotes, embedded commas, and escaped quotes (\"\")", () => {
      const csv = `product_title,description,handle,sku,price
"Tomato, Heirloom Desi","Special ""Pusa Ruby"" heirloom, high yielding",tomato-desi,GLR-TOM-020,49.00`;

      const rows = CsvParser.parse(csv);
      expect(rows).toHaveLength(1);
      expect(rows[0].product_title).toBe("Tomato, Heirloom Desi");
      expect(rows[0].description).toBe('Special "Pusa Ruby" heirloom, high yielding');
      expect(rows[0].sku).toBe("GLR-TOM-020");
    });

    it("handles multiline descriptions and CRLF (Windows) line endings", () => {
      const csv = "product_title,description,handle,sku,price\r\n" +
        '"Spinach Seeds","Line 1: High iron.\r\nLine 2: Easy to grow.",spinach-desi,GLR-SPN-050,39.00\r\n';

      const rows = CsvParser.parse(csv);
      expect(rows).toHaveLength(1);
      expect(rows[0].description).toBe("Line 1: High iron.\r\nLine 2: Easy to grow.");
      expect(rows[0].sku).toBe("GLR-SPN-050");
    });

    it("strips UTF-8 Byte Order Mark (BOM)", () => {
      const csvWithBom = "\uFEFFproduct_title,handle,sku,price\nTomato,tomato,GLR-TOM-020,49.00";
      const rows = CsvParser.parse(csvWithBom);
      expect(rows).toHaveLength(1);
      expect(rows[0].product_title).toBe("Tomato");
    });

    it("returns empty array for empty or whitespace-only input", () => {
      expect(CsvParser.parse("")).toHaveLength(0);
      expect(CsvParser.parse("   \n\r\n   ")).toHaveLength(0);
    });
  });

  describe("2. Security: Formula Injection Neutralization", () => {
    it("detects and neutralizes formulas starting with =, +, -, @, \\t, \\r", () => {
      const formula1 = "=SUM(A1:A10)";
      const res1 = CsvParser.sanitizeFormulaInjection(formula1);
      expect(res1.hadFormula).toBe(true);
      expect(res1.sanitized).toBe("'=SUM(A1:A10)");

      const formula2 = "+123456";
      const res2 = CsvParser.sanitizeFormulaInjection(formula2);
      expect(res2.hadFormula).toBe(true);
      expect(res2.sanitized).toBe("'+123456");

      const formula3 = "-2+5+cmd|' /C calc'!A0";
      const res3 = CsvParser.sanitizeFormulaInjection(formula3);
      expect(res3.hadFormula).toBe(true);
      expect(res3.sanitized).toBe("'-2+5+cmd|' /C calc'!A0");

      const formula4 = "@HYPERLINK(\"http://evil.com\")";
      const res4 = CsvParser.sanitizeFormulaInjection(formula4);
      expect(res4.hadFormula).toBe(true);
      expect(res4.sanitized).toBe("'@HYPERLINK(\"http://evil.com\")");

      const safe = "Organic Tomato Seeds";
      const resSafe = CsvParser.sanitizeFormulaInjection(safe);
      expect(resSafe.hadFormula).toBe(false);
      expect(resSafe.sanitized).toBe("Organic Tomato Seeds");
    });
  });

  describe("3. Schema Validation & Multi-Variant Grouping", () => {
    it("validates a complete seed product with 3 packet variants (20, 50, 100 seeds)", () => {
      const rawRows = [
        {
          row_number: 2,
          product_title: "Tomato Seeds (Desi / Pusa Ruby)",
          description: "Heirloom desi tomato",
          handle: "tomato-seeds-desi",
          category: "vegetable-seeds",
          status: "published",
          variant_title: "20 Seeds",
          sku: "GLR-SD-TOM-020",
          packet_size: "20 Seeds",
          price: "49.00",
          currency: "inr",
          initial_inventory_quantity: "150",
          botanical_name: "Solanum lycopersicum",
          season: "kharif",
          sunlight: "full_sun",
        },
        {
          row_number: 3,
          product_title: "Tomato Seeds (Desi / Pusa Ruby)",
          description: "Heirloom desi tomato",
          handle: "tomato-seeds-desi",
          category: "vegetable-seeds",
          status: "published",
          variant_title: "50 Seeds",
          sku: "GLR-SD-TOM-050",
          packet_size: "50 Seeds",
          price: "99.00",
          currency: "inr",
          initial_inventory_quantity: "80",
          botanical_name: "Solanum lycopersicum",
          season: "kharif",
          sunlight: "full_sun",
        },
        {
          row_number: 4,
          product_title: "Tomato Seeds (Desi / Pusa Ruby)",
          description: "Heirloom desi tomato",
          handle: "tomato-seeds-desi",
          category: "vegetable-seeds",
          status: "published",
          variant_title: "100 Seeds",
          sku: "GLR-SD-TOM-100",
          packet_size: "100 Seeds",
          price: "179.00",
          currency: "inr",
          initial_inventory_quantity: "50",
          botanical_name: "Solanum lycopersicum",
          season: "kharif",
          sunlight: "full_sun",
        },
      ];

      const { report, groupedProducts } = CsvValidator.validate(rawRows);
      expect(report.is_valid).toBe(true);
      expect(report.errors).toHaveLength(0);
      expect(groupedProducts).toHaveLength(1);

      const tomato = groupedProducts[0];
      expect(tomato.handle).toBe("tomato-seeds-desi");
      expect(tomato.title).toBe("Tomato Seeds (Desi / Pusa Ruby)");
      expect(tomato.variants).toHaveLength(3);

      expect(tomato.variants[0].sku).toBe("GLR-SD-TOM-020");
      expect(tomato.variants[0].priceINR).toBe(4900); // 49 * 100 paise
      expect(tomato.variants[0].inventory_quantity).toBe(150);

      expect(tomato.variants[1].sku).toBe("GLR-SD-TOM-050");
      expect(tomato.variants[1].priceINR).toBe(9900);

      expect(tomato.variants[2].sku).toBe("GLR-SD-TOM-100");
      expect(tomato.variants[2].priceINR).toBe(17900);

      expect(tomato.metadata.botanical_name).toBe("Solanum lycopersicum");
      expect(tomato.metadata.season).toBe("kharif");
    });

    it("flags missing required fields (title, handle, sku, price)", () => {
      const rawRows = [
        {
          row_number: 2,
          product_title: "",
          handle: "",
          sku: "",
          price: "",
        },
      ];

      const { report } = CsvValidator.validate(rawRows);
      expect(report.is_valid).toBe(false);
      expect(report.errors.length).toBeGreaterThanOrEqual(4);

      const codes = report.errors.map((e) => e.code);
      expect(codes).toContain("MISSING_REQUIRED_FIELD");
      expect(codes).toContain("INVALID_PRICE");
    });

    it("flags invalid prices (negative, zero, non-numeric)", () => {
      const rawRows = [
        {
          row_number: 2,
          product_title: "Chilli Seeds",
          handle: "chilli-seeds",
          sku: "GLR-SD-CHL-050",
          price: "-45.00",
        },
        {
          row_number: 3,
          product_title: "Chilli Seeds",
          handle: "chilli-seeds",
          sku: "GLR-SD-CHL-100",
          price: "FREE",
        },
      ];

      const { report } = CsvValidator.validate(rawRows);
      expect(report.is_valid).toBe(false);
      const priceErrors = report.errors.filter((e) => e.code === "INVALID_PRICE");
      expect(priceErrors).toHaveLength(2);
      expect(priceErrors[0].row_number).toBe(2);
      expect(priceErrors[1].row_number).toBe(3);
    });

    it("flags invalid currency code", () => {
      const rawRows = [
        {
          row_number: 2,
          product_title: "Tulsi Seeds",
          handle: "tulsi-seeds",
          sku: "GLR-SD-TLS-100",
          price: "45.00",
          currency: "USD",
        },
      ];

      const { report } = CsvValidator.validate(rawRows);
      expect(report.is_valid).toBe(false);
      const currErrors = report.errors.filter((e) => e.code === "INVALID_CURRENCY");
      expect(currErrors).toHaveLength(1);
    });

    it("flags invalid inventory quantity (negative, non-integer)", () => {
      const rawRows = [
        {
          row_number: 2,
          product_title: "Tulsi Seeds",
          handle: "tulsi-seeds",
          sku: "GLR-SD-TLS-100",
          price: "45.00",
          initial_inventory_quantity: "-5",
        },
        {
          row_number: 3,
          product_title: "Tulsi Seeds",
          handle: "tulsi-seeds",
          sku: "GLR-SD-TLS-250",
          price: "85.00",
          initial_inventory_quantity: "12.5",
        },
      ];

      const { report } = CsvValidator.validate(rawRows);
      expect(report.is_valid).toBe(false);
      const qtyErrors = report.errors.filter((e) => e.code === "INVALID_QUANTITY");
      expect(qtyErrors).toHaveLength(2);
    });

    it("flags unsafe image URLs (javascript:, data:)", () => {
      const rawRows = [
        {
          row_number: 2,
          product_title: "Tulsi Seeds",
          handle: "tulsi-seeds",
          sku: "GLR-SD-TLS-100",
          price: "45.00",
          image_url: "javascript:alert('xss')",
        },
        {
          row_number: 3,
          product_title: "Tulsi Seeds",
          handle: "tulsi-seeds",
          sku: "GLR-SD-TLS-250",
          price: "85.00",
          image_url: "data:text/html;base64,PHNjcmlwdD4=",
        },
      ];

      const { report } = CsvValidator.validate(rawRows);
      expect(report.is_valid).toBe(false);
      const urlErrors = report.errors.filter((e) => e.code === "INVALID_URL");
      expect(urlErrors).toHaveLength(2);
    });

    it("detects duplicate SKUs within the same CSV file", () => {
      const rawRows = [
        {
          row_number: 2,
          product_title: "Tomato Seeds",
          handle: "tomato-seeds",
          sku: "GLR-SD-TOM-020",
          price: "49.00",
        },
        {
          row_number: 3,
          product_title: "Tomato Seeds",
          handle: "tomato-seeds",
          sku: "GLR-SD-TOM-020", // Duplicate SKU
          price: "49.00",
        },
      ];

      const { report } = CsvValidator.validate(rawRows);
      expect(report.is_valid).toBe(false);
      const dupErrors = report.errors.filter((e) => e.code === "DUPLICATE_SKU_IN_FILE");
      expect(dupErrors).toHaveLength(1);
      expect(dupErrors[0].row_number).toBe(3);
      expect(dupErrors[0].message).toContain("Duplicate SKU");
    });

    it("detects conflicting product titles under the same product handle", () => {
      const rawRows = [
        {
          row_number: 2,
          product_title: "Tomato Seeds (Desi)",
          handle: "tomato-seeds-desi",
          sku: "GLR-SD-TOM-020",
          price: "49.00",
        },
        {
          row_number: 3,
          product_title: "Brinjal Purple Seeds", // Conflict under same handle
          handle: "tomato-seeds-desi",
          sku: "GLR-SD-BRJ-050",
          price: "55.00",
        },
      ];

      const { report } = CsvValidator.validate(rawRows);
      expect(report.is_valid).toBe(false);
      const conflictErrors = report.errors.filter((e) => e.code === "CONFLICTING_PRODUCT_DATA");
      expect(conflictErrors).toHaveLength(1);
      expect(conflictErrors[0].message).toContain("Conflicting product title");
    });
  });
});

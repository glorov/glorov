import { CsvParser } from "./csv-parser";
import {
  CsvProductVariantRow,
  GroupedProductImport,
  RawCsvRow,
  ValidationError,
  ValidationReport,
  ValidationWarning,
} from "./types";

export class CsvValidator {
  /**
   * Validates raw CSV rows and groups them into products and variants.
   */
  public static validate(rawRows: RawCsvRow[]): {
    report: ValidationReport;
    groupedProducts: GroupedProductImport[];
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const parsedRows: CsvProductVariantRow[] = [];

    const seenSkusInFile = new Map<string, number>(); // sku -> first row_number

    for (const raw of rawRows) {
      const rowNumber = raw.row_number;

      // 1. Validate Product Title
      const rawTitle = String(raw.product_title || "").trim();
      if (!rawTitle) {
        errors.push({
          row_number: rowNumber,
          field: "product_title",
          message: "Product title is required and cannot be empty.",
          code: "MISSING_REQUIRED_FIELD",
        });
      }
      const titleClean = CsvParser.sanitizeFormulaInjection(rawTitle);
      if (titleClean.hadFormula) {
        warnings.push({
          row_number: rowNumber,
          field: "product_title",
          message: "Formula injection characters detected and neutralized with leading quote.",
        });
      }

      // 2. Validate Handle
      const rawHandle = String(raw.handle || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-")
        .replace(/-+/g, "-");
      if (!rawHandle) {
        errors.push({
          row_number: rowNumber,
          field: "handle",
          message: "Product handle is required and must contain alphanumeric characters.",
          code: "MISSING_REQUIRED_FIELD",
        });
      }

      // 3. Validate SKU
      const rawSku = String(raw.sku || "").trim().toUpperCase();
      if (!rawSku) {
        errors.push({
          row_number: rowNumber,
          field: "sku",
          message: "Variant SKU is required and cannot be empty.",
          code: "MISSING_REQUIRED_FIELD",
        });
      } else {
        if (seenSkusInFile.has(rawSku)) {
          errors.push({
            row_number: rowNumber,
            field: "sku",
            value: rawSku,
            message: `Duplicate SKU "${rawSku}" found in CSV file (first seen on row ${seenSkusInFile.get(
              rawSku
            )}). Each variant must have a unique SKU.`,
            code: "DUPLICATE_SKU_IN_FILE",
          });
        } else {
          seenSkusInFile.set(rawSku, rowNumber);
        }
      }

      // 4. Validate Price
      const rawPriceStr = String(raw.price || "").trim();
      const numPrice = Number(rawPriceStr);
      if (!rawPriceStr || isNaN(numPrice) || numPrice <= 0) {
        errors.push({
          row_number: rowNumber,
          field: "price",
          value: raw.price,
          message: "Price must be a valid positive number greater than 0.",
          code: "INVALID_PRICE",
        });
      }

      // 5. Validate Currency
      const rawCurrency = String(raw.currency || "inr").trim().toLowerCase();
      if (rawCurrency !== "inr") {
        errors.push({
          row_number: rowNumber,
          field: "currency",
          value: raw.currency,
          message: `Currency "${rawCurrency}" is unsupported. GLOROV requires "INR".`,
          code: "INVALID_CURRENCY",
        });
      }

      // 6. Validate Initial Quantity
      let parsedStock: number | undefined = undefined;
      if (raw.initial_inventory_quantity !== undefined && raw.initial_inventory_quantity !== "") {
        const numStock = Number(raw.initial_inventory_quantity);
        if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
          errors.push({
            row_number: rowNumber,
            field: "initial_inventory_quantity",
            value: raw.initial_inventory_quantity,
            message: "Initial inventory quantity must be a non-negative integer (e.g. 0, 50, 100).",
            code: "INVALID_QUANTITY",
          });
        } else {
          parsedStock = numStock;
        }
      }

      // 7. Validate Image URL
      const rawImage = String(raw.image_url || raw.thumbnail || "").trim();
      let sanitizedImage: string | undefined = undefined;
      if (rawImage) {
        if (
          rawImage.startsWith("http://") ||
          rawImage.startsWith("https://") ||
          rawImage.startsWith("/")
        ) {
          sanitizedImage = rawImage;
        } else {
          errors.push({
            row_number: rowNumber,
            field: "image_url",
            value: rawImage,
            message: "Image URL must use http://, https://, or an absolute path. Protocols like javascript: and data: are forbidden.",
            code: "INVALID_URL",
          });
        }
      }

      // 8. Variant Title & Packet Size
      const packetSize = String(raw.packet_size || raw.variant_title || "Standard").trim();
      const variantTitle = String(raw.variant_title || packetSize).trim();

      // 9. Status
      const rawStatus = String(raw.status || "published").trim().toLowerCase();
      const status: "published" | "draft" = rawStatus === "draft" ? "draft" : "published";

      // 10. Extract metadata
      const approxSeeds = Number(raw.approx_seeds_per_packet);

      parsedRows.push({
        row_number: rowNumber,
        product_title: titleClean.sanitized,
        description: String(raw.description || "").trim(),
        handle: rawHandle,
        category: String(raw.category || "").trim(),
        status,
        variant_title: variantTitle,
        sku: rawSku,
        packet_size: packetSize,
        price: numPrice,
        currency: "inr",
        initial_inventory_quantity: parsedStock,
        image_url: sanitizedImage,
        thumbnail: sanitizedImage,

        // Botanical attributes
        common_name: String(raw.common_name || "").trim() || undefined,
        botanical_name: String(raw.botanical_name || "").trim() || undefined,
        variety: String(raw.variety || "").trim() || undefined,
        seed_type: String(raw.seed_type || "").trim() || undefined,
        approx_seeds_per_packet: !isNaN(approxSeeds) && approxSeeds > 0 ? approxSeeds : undefined,
        germination_time_range: String(raw.germination_time_range || "").trim() || undefined,
        sowing_depth: String(raw.sowing_depth || "").trim() || undefined,
        spacing: String(raw.spacing || "").trim() || undefined,
        sunlight: String(raw.sunlight || "").trim() || undefined,
        watering: String(raw.watering || "").trim() || undefined,
        season: String(raw.season || "").trim() || undefined,
        difficulty: String(raw.difficulty || "").trim() || undefined,
        planting_instructions: String(raw.planting_instructions || "").trim() || undefined,
        packaging_notes: String(raw.packaging_notes || "").trim() || undefined,
        is_perishable:
          String(raw.is_perishable).toLowerCase() === "true" ||
          String(raw.is_perishable).toLowerCase() === "yes",
      });
    }

    // Grouping by handle to form complete products with variants
    const groupedMap = new Map<string, GroupedProductImport>();

    for (const row of parsedRows) {
      if (!row.handle) continue;

      if (!groupedMap.has(row.handle)) {
        const metadata: Record<string, unknown> = {};
        if (row.common_name) metadata.common_name = row.common_name;
        if (row.botanical_name) metadata.botanical_name = row.botanical_name;
        if (row.variety) metadata.variety = row.variety;
        if (row.seed_type) metadata.seed_type = row.seed_type;
        if (row.approx_seeds_per_packet) metadata.approx_seeds_per_packet = row.approx_seeds_per_packet;
        if (row.germination_time_range) metadata.germination_time_range = row.germination_time_range;
        if (row.sowing_depth) metadata.sowing_depth = row.sowing_depth;
        if (row.spacing) metadata.spacing = row.spacing;
        if (row.sunlight) metadata.sunlight = row.sunlight;
        if (row.watering) metadata.watering = row.watering;
        if (row.season) metadata.season = row.season;
        if (row.difficulty) metadata.difficulty = row.difficulty;
        if (row.planting_instructions) metadata.planting_instructions = row.planting_instructions;
        if (row.packaging_notes) metadata.packaging_notes = row.packaging_notes;
        metadata.is_perishable = Boolean(row.is_perishable);

        groupedMap.set(row.handle, {
          handle: row.handle,
          title: row.product_title,
          description: row.description || "",
          status: row.status || "published",
          category_handle: row.category,
          thumbnail: row.thumbnail,
          images: row.image_url ? [row.image_url] : [],
          metadata,
          variants: [],
          action: "create", // updated later during existing product lookup
        });
      }

      const productGroup = groupedMap.get(row.handle)!;

      // Check for conflicting product details across rows with same handle
      if (
        row.product_title &&
        productGroup.title &&
        row.product_title.toLowerCase() !== productGroup.title.toLowerCase()
      ) {
        errors.push({
          row_number: row.row_number,
          field: "product_title",
          value: row.product_title,
          message: `Conflicting product title "${row.product_title}" for handle "${row.handle}". First defined as "${productGroup.title}". All variant rows for a single handle must share the same product title.`,
          code: "CONFLICTING_PRODUCT_DATA",
        });
      }

      // Price conversion:
      // Standard prices in GLOROV CSV are in Rupees (e.g. 49 = ₹49.00 -> 4900 paise)
      const pricePaise = Math.round(row.price * 100);

      productGroup.variants.push({
        row_number: row.row_number,
        title: row.variant_title,
        sku: row.sku,
        priceINR: pricePaise,
        priceMajor: row.price,
        packet_size: row.packet_size,
        inventory_quantity: row.initial_inventory_quantity,
        metadata: {
          packet_size_label: row.packet_size,
          approx_seeds_per_packet: row.approx_seeds_per_packet,
        },
      });

      // Add image to gallery if new
      if (row.image_url && !productGroup.images.includes(row.image_url)) {
        productGroup.images.push(row.image_url);
      }
    }

    const groupedProducts = Array.from(groupedMap.values());
    const isValid = errors.length === 0;

    const report: ValidationReport = {
      is_valid: isValid,
      total_rows: rawRows.length,
      valid_rows_count: isValid ? rawRows.length : rawRows.length - errors.length,
      error_rows_count: errors.length,
      warning_rows_count: warnings.length,
      errors,
      warnings,
      summary: {
        products_to_create: groupedProducts.length,
        products_to_update: 0,
        variants_to_create: parsedRows.length,
        variants_to_update: 0,
      },
    };

    return {
      report,
      groupedProducts,
    };
  }
}

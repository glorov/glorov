/**
 * Types and interfaces for GLOROV CSV Product Import and Inventory Reconciliation
 */

export interface RawCsvRow {
  row_number: number;
  [key: string]: string | number | undefined;
}

export interface CsvProductVariantRow {
  row_number: number;
  product_title: string;
  description?: string;
  handle: string;
  category?: string;
  status?: "published" | "draft";
  variant_title: string;
  sku: string;
  packet_size: string;
  price: number; // in INR major units (e.g. 49.00) or paise
  currency: string;
  initial_inventory_quantity?: number;
  image_url?: string;
  thumbnail?: string;

  // Botanical & Seed Specifications
  common_name?: string;
  botanical_name?: string;
  variety?: string;
  seed_type?: string;
  approx_seeds_per_packet?: number;
  germination_time_range?: string;
  sowing_depth?: string;
  spacing?: string;
  sunlight?: string;
  watering?: string;
  season?: string;
  difficulty?: string;
  planting_instructions?: string;
  packaging_notes?: string;
  is_perishable?: boolean;
}

export interface ValidationError {
  row_number: number;
  field: string;
  value?: unknown;
  message: string;
  code:
    | "MISSING_REQUIRED_FIELD"
    | "INVALID_PRICE"
    | "INVALID_QUANTITY"
    | "INVALID_URL"
    | "DUPLICATE_SKU_IN_FILE"
    | "CONFLICTING_PRODUCT_DATA"
    | "INVALID_CURRENCY"
    | "FORMULA_INJECTION_DETECTED"
    | "UNKNOWN_ERROR";
}

export interface ValidationWarning {
  row_number: number;
  field: string;
  message: string;
}

export interface GroupedProductImport {
  handle: string;
  title: string;
  description: string;
  status: "published" | "draft";
  category_handle?: string;
  thumbnail?: string;
  images: string[];
  metadata: Record<string, unknown>;
  variants: Array<{
    row_number: number;
    title: string;
    sku: string;
    priceINR: number; // in paise for Medusa pricing module
    priceMajor: number; // in rupees for display
    packet_size: string;
    inventory_quantity?: number;
    metadata: Record<string, unknown>;
  }>;
  existing_product_id?: string;
  action: "create" | "update";
}

export interface ValidationReport {
  is_valid: boolean;
  total_rows: number;
  valid_rows_count: number;
  error_rows_count: number;
  warning_rows_count: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  summary: {
    products_to_create: number;
    products_to_update: number;
    variants_to_create: number;
    variants_to_update: number;
  };
}

export interface ImportPreviewResult {
  validation: ValidationReport;
  products_preview: Array<{
    handle: string;
    title: string;
    action: "create" | "update";
    category?: string;
    status: string;
    variants_count: number;
    variants: Array<{
      title: string;
      sku: string;
      price_inr: string;
      packet_size: string;
      initial_stock?: number;
      action: "create" | "update";
    }>;
  }>;
}

export interface ImportExecutionResult {
  success: boolean;
  dry_run: boolean;
  imported_products_count: number;
  updated_products_count: number;
  imported_variants_count: number;
  updated_variants_count: number;
  skipped_count: number;
  failed_count: number;
  details: Array<{
    handle: string;
    product_id?: string;
    title: string;
    action: "created" | "updated" | "skipped" | "failed";
    variants: Array<{
      sku: string;
      variant_id?: string;
      action: "created" | "updated" | "skipped" | "failed";
      error?: string;
    }>;
    error?: string;
  }>;
  errors: ValidationError[];
}

export interface InventoryReconciliationItem {
  sku: string;
  variant_title: string;
  product_handle: string;
  product_title: string;
  location_id: string;
  location_name: string;
  current_stocked_quantity: number;
  current_reserved_quantity: number;
  current_available_quantity: number;
  imported_quantity: number;
  variance: number; // imported - current_stocked
  action_required: "no_change" | "surplus" | "shortage" | "item_not_found";
}

export interface InventoryReconciliationReport {
  total_skus: number;
  matched_skus: number;
  unmatched_skus: number;
  items_with_variance: number;
  items_in_sync: number;
  location_id: string;
  location_name: string;
  reconciliation_items: InventoryReconciliationItem[];
  applied_adjustments_count?: number;
  adjustments_confirmed: boolean;
}

import { RawCsvRow } from "./types";

/**
 * Robust RFC 4180 compliant CSV Parser.
 * Handles quoted fields, embedded commas, escaped quotes (""), and multiline values.
 */
export class CsvParser {
  /**
   * Sanitizes a string to prevent spreadsheet formula injection (CSV Injection / DDE).
   * Characters =, +, -, @, \t, \r at the beginning of a cell can be evaluated by Excel/Sheets.
   */
  public static sanitizeFormulaInjection(value: string): { sanitized: string; hadFormula: boolean } {
    if (!value || typeof value !== "string") {
      return { sanitized: value, hadFormula: false };
    }

    const trimmed = value.trim();
    const formulaChars = ["=", "+", "-", "@", "\t", "\r"];

    if (formulaChars.some((char) => trimmed.startsWith(char))) {
      // Prepend a single quote ' to force Excel/Sheets to treat the content as literal text
      return {
        sanitized: `'${trimmed}`,
        hadFormula: true,
      };
    }

    return { sanitized: value, hadFormula: false };
  }

  /**
   * Parses raw CSV text into an array of objects keyed by header names.
   */
  public static parse(csvText: string): RawCsvRow[] {
    if (!csvText || typeof csvText !== "string") {
      return [];
    }

    // Strip UTF-8 Byte Order Mark (BOM) if present
    let text = csvText;
    if (text.charCodeAt(0) === 0xfeff) {
      text = text.slice(1);
    }

    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = "";
    let inQuotes = false;
    let i = 0;
    const len = text.length;

    while (i < len) {
      const char = text[i];

      if (char === '"') {
        if (inQuotes) {
          // Check for escaped quote ("")
          if (i + 1 < len && text[i + 1] === '"') {
            currentField += '"';
            i += 2;
            continue;
          } else {
            // Closing quote
            inQuotes = false;
            i++;
            continue;
          }
        } else {
          // Opening quote
          inQuotes = true;
          i++;
          continue;
        }
      }

      if (char === "," && !inQuotes) {
        currentRow.push(currentField);
        currentField = "";
        i++;
        continue;
      }

      // Handle Line breaks
      if ((char === "\r" || char === "\n") && !inQuotes) {
        currentRow.push(currentField);
        currentField = "";

        // Skip \r\n
        if (char === "\r" && i + 1 < len && text[i + 1] === "\n") {
          i++;
        }

        // Only push non-empty rows
        if (currentRow.some((field) => field.trim().length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        i++;
        continue;
      }

      currentField += char;
      i++;
    }

    // Catch final field and row
    if (currentField.length > 0 || currentRow.length > 0) {
      currentRow.push(currentField);
      if (currentRow.some((field) => field.trim().length > 0)) {
        rows.push(currentRow);
      }
    }

    if (rows.length < 2) {
      return [];
    }

    // Process headers: normalize to lowercase snake_case
    const rawHeaders = rows[0];
    const headers = rawHeaders.map((h) => this.normalizeHeader(h));

    const result: RawCsvRow[] = [];
    for (let r = 1; r < rows.length; r++) {
      const rowValues = rows[r];
      const rowObject: RawCsvRow = {
        row_number: r + 1, // 1-based indexing including header as row 1
      };

      for (let c = 0; c < headers.length; c++) {
        const headerName = headers[c];
        if (headerName) {
          const val = rowValues[c] !== undefined ? rowValues[c].trim() : "";
          rowObject[headerName] = val;
        }
      }

      result.push(rowObject);
    }

    return result;
  }

  /**
   * Normalizes header strings:
   * e.g. "Product Title" -> "product_title"
   * e.g. "Variant SKU" -> "sku"
   * e.g. "Price (INR)" -> "price"
   */
  public static normalizeHeader(rawHeader: string): string {
    const cleaned = rawHeader
      .trim()
      .toLowerCase()
      .replace(/[\(\)]/g, "")
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");

    // Common synonyms mappings
    const headerAliases: Record<string, string> = {
      title: "product_title",
      product_name: "product_title",
      name: "product_title",
      product_handle: "handle",
      product_sku: "sku",
      variant_sku: "sku",
      packet: "packet_size",
      variant_name: "variant_title",
      price_inr: "price",
      unit_price: "price",
      stock: "initial_inventory_quantity",
      inventory: "initial_inventory_quantity",
      inventory_quantity: "initial_inventory_quantity",
      stock_quantity: "initial_inventory_quantity",
      qty: "initial_inventory_quantity",
      image: "image_url",
      photo: "image_url",
      category_name: "category",
      category_handle: "category",
    };

    return headerAliases[cleaned] || cleaned;
  }
}

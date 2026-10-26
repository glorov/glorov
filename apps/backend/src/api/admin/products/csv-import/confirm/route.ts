import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ProductCsvImportService } from "../../../../../modules/csv-import/import-service";
import { sendSanitizedError } from "../../../../../utils/error-handler";

const MAX_CSV_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    let csvContent: string | undefined;
    let rawRows: any[] | undefined;
    let dryRun = false;
    let allowInventoryUpdates = false;

    if (req.body && typeof req.body === "object") {
      const body = req.body as Record<string, any>;
      csvContent = body.csv_content || body.csv || body.data;
      rawRows = Array.isArray(body.rows) ? body.rows : undefined;
      dryRun = Boolean(body.dry_run);
      allowInventoryUpdates = Boolean(body.allow_inventory_updates);
    } else if (typeof req.body === "string") {
      csvContent = req.body;
    }

    if (!csvContent && (!rawRows || rawRows.length === 0)) {
      res.status(400).json({
        message: "Request must include 'csv_content' string or 'rows' array.",
      });
      return;
    }

    if (csvContent && Buffer.byteLength(csvContent, "utf8") > MAX_CSV_SIZE_BYTES) {
      res.status(413).json({
        message: "CSV payload exceeds maximum allowed size of 5 MB.",
      });
      return;
    }

    const result = await ProductCsvImportService.executeImport(req.scope, {
      csvText: csvContent,
      rawRows,
      dryRun,
      allowInventoryUpdates,
    });

    if (!result.success && result.errors.length > 0) {
      res.status(422).json({
        message: "CSV validation failed. Proposed changes were not applied.",
        result,
      });
      return;
    }

    res.status(200).json({ result });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

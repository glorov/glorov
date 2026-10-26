import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ProductCsvImportService } from "../../../../../modules/csv-import/import-service";
import { sendSanitizedError } from "../../../../../utils/error-handler";

const MAX_CSV_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    let csvContent: string | undefined;
    let rawRows: any[] | undefined;

    if (typeof req.body === "string") {
      csvContent = req.body;
    } else if (req.body && typeof req.body === "object") {
      const body = req.body as Record<string, any>;
      csvContent = body.csv_content || body.csv || body.data;
      rawRows = Array.isArray(body.rows) ? body.rows : undefined;
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

    const preview = await ProductCsvImportService.preview(req.scope, {
      csvText: csvContent,
      rawRows,
    });

    res.status(200).json({ preview });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

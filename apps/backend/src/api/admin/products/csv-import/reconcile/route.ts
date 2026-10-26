import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { InventoryReconciler } from "../../../../../modules/csv-import/inventory-reconciler";
import { sendSanitizedError } from "../../../../../utils/error-handler";

const MAX_CSV_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    let csvContent: string | undefined;
    let rawRows: any[] | undefined;
    let locationId: string | undefined;
    let confirmAdjustment = false;

    if (req.body && typeof req.body === "object") {
      const body = req.body as Record<string, any>;
      csvContent = body.csv_content || body.csv || body.data;
      rawRows = Array.isArray(body.rows) ? body.rows : undefined;
      locationId = body.location_id;
      confirmAdjustment = Boolean(body.confirm_adjustment);
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

    const reconciliation = await InventoryReconciler.reconcile(req.scope, {
      csvText: csvContent,
      rawRows,
      locationId,
      confirmAdjustment,
    });

    res.status(200).json({ reconciliation });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

import { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";
import { updateInventoryLevelsWorkflow } from "@medusajs/medusa/core-flows";
import {
  InventoryReconciliationItem,
  InventoryReconciliationReport,
  RawCsvRow,
} from "./types";
import { CsvParser } from "./csv-parser";
import { CsvValidator } from "./csv-validator";

export class InventoryReconciler {
  /**
   * Compares imported inventory quantities against current Medusa stock levels.
   * Only mutates inventory if `confirmAdjustment` is explicitly true.
   */
  public static async reconcile(
    container: MedusaContainer,
    options: {
      csvText?: string;
      rawRows?: RawCsvRow[];
      locationId?: string;
      confirmAdjustment?: boolean;
    }
  ): Promise<InventoryReconciliationReport> {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

    // 1. Resolve target stock location
    const { data: stockLocations } = await query.graph({
      entity: "stock_location",
      fields: ["id", "name"],
    });

    let targetLocation = stockLocations.find((l) => l.id === options.locationId);
    if (!targetLocation) {
      // Default to Pune Central Nursery Hub
      targetLocation =
        stockLocations.find((l) => l.name.includes("Pune Central Nursery Hub")) ||
        stockLocations[0];
    }

    if (!targetLocation) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "No active stock location found for inventory reconciliation."
      );
    }

    // 2. Parse CSV if raw text was provided
    let rawRows = options.rawRows;
    if (!rawRows && options.csvText) {
      rawRows = CsvParser.parse(options.csvText);
    }
    if (!rawRows || rawRows.length === 0) {
      return {
        total_skus: 0,
        matched_skus: 0,
        unmatched_skus: 0,
        items_with_variance: 0,
        items_in_sync: 0,
        location_id: targetLocation.id,
        location_name: targetLocation.name,
        reconciliation_items: [],
        applied_adjustments_count: 0,
        adjustments_confirmed: false,
      };
    }

    // 3. Extract items that have an inventory quantity specified
    const itemsToReconcile: Array<{
      sku: string;
      importedQty: number;
      productTitle?: string;
      variantTitle?: string;
    }> = [];

    for (const row of rawRows) {
      const sku = String(row.sku || row.variant_sku || "").trim().toUpperCase();
      const rawQty = row.initial_inventory_quantity ?? row.stock_quantity ?? row.inventory_quantity ?? row.stock;

      if (sku && rawQty !== undefined && rawQty !== "") {
        const parsedQty = Number(rawQty);
        if (!isNaN(parsedQty) && parsedQty >= 0) {
          itemsToReconcile.push({
            sku,
            importedQty: Math.floor(parsedQty),
            productTitle: String(row.product_title || row.title || ""),
            variantTitle: String(row.variant_title || row.packet_size || ""),
          });
        }
      }
    }

    // 4. Query current inventory items and location levels
    const reconciliationItems: InventoryReconciliationItem[] = [];
    let itemsWithVariance = 0;
    let itemsInSync = 0;
    let matchedSkus = 0;
    let unmatchedSkus = 0;
    const inventoryUpdatesToApply: Array<{
      inventory_item_id: string;
      location_id: string;
      stocked_quantity: number;
    }> = [];

    for (const item of itemsToReconcile) {
      const { data: invItems } = await query.graph({
        entity: "inventory_item",
        fields: [
          "id",
          "sku",
          "title",
          "location_levels.*",
          "variants.product.handle",
          "variants.product.title",
          "variants.title",
        ],
        filters: { sku: item.sku },
      });

      const invItem = invItems?.[0];

      if (!invItem) {
        unmatchedSkus++;
        reconciliationItems.push({
          sku: item.sku,
          variant_title: item.variantTitle || "Unknown Variant",
          product_handle: "not_found",
          product_title: item.productTitle || "Not Found in Catalog",
          location_id: targetLocation.id,
          location_name: targetLocation.name,
          current_stocked_quantity: 0,
          current_reserved_quantity: 0,
          current_available_quantity: 0,
          imported_quantity: item.importedQty,
          variance: item.importedQty,
          action_required: "item_not_found",
        });
        continue;
      }

      matchedSkus++;
      const locLevel = invItem.location_levels?.find(
        (l: any) => l && l.location_id === targetLocation!.id
      );

      const currentStocked = Number(locLevel?.stocked_quantity || 0);
      const currentReserved = Number(locLevel?.reserved_quantity || 0);
      const currentAvailable = Number(locLevel?.available_quantity || Math.max(0, currentStocked - currentReserved));
      const variance = item.importedQty - currentStocked;

      let actionRequired: InventoryReconciliationItem["action_required"] = "no_change";
      if (variance > 0) {
        actionRequired = "surplus";
        itemsWithVariance++;
      } else if (variance < 0) {
        actionRequired = "shortage";
        itemsWithVariance++;
      } else {
        itemsInSync++;
      }

      const variant = invItem.variants?.[0];
      const product = variant?.product;

      reconciliationItems.push({
        sku: item.sku,
        variant_title: variant?.title || item.variantTitle || invItem.title || item.sku,
        product_handle: product?.handle || "unknown",
        product_title: product?.title || item.productTitle || "Unknown Product",
        location_id: targetLocation.id,
        location_name: targetLocation.name,
        current_stocked_quantity: currentStocked,
        current_reserved_quantity: currentReserved,
        current_available_quantity: currentAvailable,
        imported_quantity: item.importedQty,
        variance,
        action_required: actionRequired,
      });

      if (variance !== 0 && locLevel) {
        inventoryUpdatesToApply.push({
          inventory_item_id: invItem.id,
          location_id: targetLocation.id,
          stocked_quantity: item.importedQty,
        });
      }
    }

    let appliedCount = 0;

    // 5. Apply inventory adjustments ONLY if confirmAdjustment is explicitly true
    if (options.confirmAdjustment === true && inventoryUpdatesToApply.length > 0) {
      logger.info(
        `Applying ${inventoryUpdatesToApply.length} confirmed inventory reconciliations at ${targetLocation.name}...`
      );

      await updateInventoryLevelsWorkflow(container).run({
        input: {
          updates: inventoryUpdatesToApply,
        },
      });

      appliedCount = inventoryUpdatesToApply.length;
    }

    return {
      total_skus: itemsToReconcile.length,
      matched_skus: matchedSkus,
      unmatched_skus: unmatchedSkus,
      items_with_variance: itemsWithVariance,
      items_in_sync: itemsInSync,
      location_id: targetLocation.id,
      location_name: targetLocation.name,
      reconciliation_items: reconciliationItems,
      applied_adjustments_count: appliedCount,
      adjustments_confirmed: Boolean(options.confirmAdjustment),
    };
  }
}

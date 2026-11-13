import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

/**
 * Utility script to inspect and update stock locations & default store location.
 * Usage:
 *   npx medusa exec ./src/scripts/update-store-location.ts
 *   npx medusa exec ./src/scripts/update-store-location.ts "New Nursery Location Name"
 */
export default async function updateStoreLocation({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION);
  const storeModule = container.resolve(Modules.STORE);

  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "name", "default_location_id"],
  });

  const currentStore = stores?.[0];
  logger.info(`Store: ${currentStore?.name} (ID: ${currentStore?.id}) | Default Location ID: ${currentStore?.default_location_id}`);

  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name", "address.*"],
  });

  logger.info(`Configured Stock Locations (${stockLocations.length}):`);
  stockLocations.forEach((loc) => {
    const isDefault = loc.id === currentStore?.default_location_id ? " [DEFAULT]" : "";
    logger.info(`  • ${loc.name} (ID: ${loc.id})${isDefault} — City: ${loc.address?.city || "N/A"}`);
  });

  const requestedName = args?.[0] as string | undefined;
  if (requestedName && stockLocations.length > 0) {
    const targetId = currentStore?.default_location_id || stockLocations[0].id;
    await stockLocationModule.updateStockLocations(targetId, {
      name: requestedName,
    });
    logger.info(`✅ Successfully updated stock location name to: "${requestedName}"`);
  }
}

import type { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * Seed foundational Indian commerce primitives for GLOROV:
 * - Currency: INR (₹) as the primary/default store currency
 * - Store name: "GLOROV Botanicals"
 * - Region: "India" (country: IN, currency: inr)
 * - Tax Region: India (IN)
 * - Stock Location: "Pune Central Nursery" (PIN: 411001)
 * - Sales Channel: Default Web Store
 * - Publishable API Key: Verified and linked to sales channel
 */
export default async function seedIndiaRegion({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const link = container.resolve(ContainerRegistrationKeys.LINK);

  logger.info("🌿 Initializing GLOROV Indian regional configuration...");

  // 1. Ensure Sales Channel
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });

  const existingChannel = salesChannels.find(
    (sc) => sc.name === "Default Sales Channel" || sc.name === "GLOROV Web Store"
  );

  let defaultSalesChannelId: string;
  if (!existingChannel) {
    logger.info("Creating GLOROV Web Store sales channel...");
    const {
      result: [newChannel],
    } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          {
            name: "GLOROV Web Store",
            description: "Primary D2C Sales Channel for GLOROV India",
          },
        ],
      },
    });
    defaultSalesChannelId = newChannel.id;
  } else {
    defaultSalesChannelId = existingChannel.id;
  }

  // 2. Configure Store with INR as default currency
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "name", "supported_currencies.*"],
  });

  const store = stores[0];
  if (store) {
    logger.info(`Updating store "${store.id}" with INR currency and GLOROV branding...`);
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          name: "GLOROV Botanicals",
          supported_currencies: [
            {
              currency_code: "inr",
              is_default: true,
            },
          ],
          default_sales_channel_id: defaultSalesChannelId,
        },
      },
    });
  }

  // 3. Ensure Region "India" with currency "inr" and country "in"
  const { data: existingRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code", "countries.iso_2"],
  });

  const hasIndiaRegion = existingRegions.some(
    (r) => r.currency_code === "inr" || r.name.toLowerCase() === "india"
  );

  if (!hasIndiaRegion) {
    logger.info("Creating India region (Currency: INR, Country: IN)...");
    await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "India",
            currency_code: "inr",
            countries: ["in"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
  } else {
    logger.info("India region already exists.");
  }

  // Clean up non-Indian regions (e.g. template Europe region) so India is the default
  const nonIndiaRegions = existingRegions.filter(
    (r) => r.currency_code !== "inr" && r.name.toLowerCase() !== "india"
  );
  if (nonIndiaRegions.length > 0) {
    const { deleteRegionsWorkflow } = await import("@medusajs/medusa/core-flows");
    logger.info(`Removing ${nonIndiaRegions.length} legacy non-India regions...`);
    await deleteRegionsWorkflow(container).run({
      input: { ids: nonIndiaRegions.map((r) => r.id) },
    });
  }

  // 4. Ensure Tax Region for India (IN)
  const { data: existingTaxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code"],
  });

  const hasIndiaTax = existingTaxRegions.some((t) => t.country_code === "in");
  if (!hasIndiaTax) {
    logger.info("Creating India tax region...");
    await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: "in",
          provider_id: "tp_system",
        },
      ],
    });
  }

  // 5. Ensure Stock Location "Pune Central Nursery"
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });

  const existingPune = stockLocations.find((sl) => sl.name.includes("Pune"));
  let puneLocationId: string;
  if (!existingPune) {
    logger.info("Creating Pune Central Nursery stock location (PIN: 411001)...");
    const {
      result: [newLocation],
    } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "Pune Central Nursery Hub",
            address: {
              city: "Pune",
              country_code: "IN",
              address_1: "Nursery Road, Haveli",
              postal_code: "411001",
            },
          },
        ],
      },
    });
    puneLocationId = newLocation.id;

  } else {
    puneLocationId = existingPune.id;
  }

  // Ensure stock location is linked to the sales channel
  try {
    const { linkSalesChannelsToStockLocationWorkflow } = await import("@medusajs/medusa/core-flows");
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: puneLocationId,
        add: [defaultSalesChannelId],
      },
    });
  } catch (e: unknown) {
    logger.warn(`Stock location link to sales channel already active or skipped: ${e}`);
  }

  // 6. Ensure Publishable API Key exists and is linked to the Sales Channel
  const { data: apiKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "token", "title", "type"],
  });

  const existingApiKey = apiKeys.find((k) => k.type === "publishable");
  let publishableKeyId: string;
  let publishableKeyToken: string;

  if (!existingApiKey) {
    logger.info("Creating default publishable API key...");
    const {
      result: [newKey],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "GLOROV Web Storefront Key",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });
    publishableKeyId = newKey.id;
    publishableKeyToken = newKey.token;
  } else {
    publishableKeyId = existingApiKey.id;
    publishableKeyToken = existingApiKey.token;
  }

  try {
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: publishableKeyId,
        add: [defaultSalesChannelId],
      },
    });
  } catch {
    // Already linked
  }

  logger.info("✅ GLOROV India regional configuration completed successfully!");
  logger.info(`Storefront Publishable API Key: ${publishableKeyToken}`);
}

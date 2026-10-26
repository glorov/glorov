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

  // 6. Ensure Fulfillment Provider & Service Zones for India
  const {
    createLocationFulfillmentSetWorkflow,
    createServiceZonesWorkflow,
    createShippingOptionsWorkflow,
  } = await import("@medusajs/medusa/core-flows");
  const { ShippingOptionPriceType, RuleOperator } = await import("@medusajs/framework/utils");

  try {
    await link.create([
      {
        [Modules.STOCK_LOCATION]: { stock_location_id: puneLocationId },
        [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
      },
      {
        [Modules.STOCK_LOCATION]: { stock_location_id: puneLocationId },
        [Modules.FULFILLMENT]: { fulfillment_provider_id: "shiprocket_shiprocket" },
      },
    ]);
    logger.info("Linked Pune stock location to manual_manual & shiprocket_shiprocket fulfillment providers.");
  } catch (e: unknown) {
    logger.warn(`Stock location fulfillment provider link skipped or active: ${e}`);
  }

  const { data: existingFulfillmentSets } = await query.graph({
    entity: "fulfillment_set",
    fields: ["id", "name", "type", "service_zones.*", "service_zones.geo_zones.*"],
  });

  let puneFulfillmentSet = existingFulfillmentSets.find((fs) => fs.name.includes("Pune"));
  if (!puneFulfillmentSet) {
    logger.info("Creating fulfillment set for Pune location...");
    await createLocationFulfillmentSetWorkflow(container).run({
      input: {
        location_id: puneLocationId,
        fulfillment_set_data: {
          name: "Pune Central Nursery Delivery",
          type: "shipping",
        },
      },
    });
    const { data: updatedSets } = await query.graph({
      entity: "fulfillment_set",
      fields: ["id", "name", "type", "service_zones.*", "service_zones.geo_zones.*"],
    });
    puneFulfillmentSet = updatedSets.find((fs) => fs.name.includes("Pune"));
  }

  let indiaServiceZone: any = puneFulfillmentSet?.service_zones?.find(
    (sz: any) => sz.name.includes("India") || sz.geo_zones?.some((gz: any) => gz.country_code === "in")
  );

  if (!indiaServiceZone && puneFulfillmentSet) {
    logger.info("Creating India Domestic Zone...");
    const { result } = await createServiceZonesWorkflow(container).run({
      input: {
        data: [
          {
            fulfillment_set_id: puneFulfillmentSet.id,
            name: "India Domestic Delivery",
            geo_zones: [
              {
                type: "country",
                country_code: "in",
              },
            ],
          },
        ],
      },
    });
    indiaServiceZone = result[0];
  }

  // 7. Ensure Default Shipping Profile & Shipping Options for India
  const { data: profiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "name", "type"],
  });
  const defaultProfile = profiles.find((p) => p.type === "default") || profiles[0];

  if (indiaServiceZone && defaultProfile) {
    const { data: existingOptions } = await query.graph({
      entity: "shipping_option",
      fields: ["id", "name", "service_zone_id"],
    });

    const hasStandard = existingOptions.some((o) => o.name === "Standard Delivery (India)");
    const hasExpress = existingOptions.some((o) => o.name === "Express Botanical Delivery (Air)");
    const hasSrStandard = existingOptions.some((o) => o.name.includes("Shiprocket Standard"));
    const hasSrExpress = existingOptions.some((o) => o.name.includes("Shiprocket Express"));

    const optionsToCreate: any[] = [];
    if (!hasStandard) {
      optionsToCreate.push({
        name: "Standard Delivery (India)",
        service_zone_id: indiaServiceZone.id,
        shipping_profile_id: defaultProfile.id,
        provider_id: "manual_manual",
        price_type: ShippingOptionPriceType.FLAT,
        type: {
          label: "Standard Delivery",
          description: "Standard surface delivery across India (3-5 business days)",
          code: "standard",
        },
        prices: [{ currency_code: "inr", amount: 4900 }],
        rules: [
          { operator: RuleOperator.IN, attribute: "is_return", value: ["false"] },
          { operator: RuleOperator.IN, attribute: "enabled_in_store", value: ["true"] },
        ],
      });
    }

    if (!hasExpress) {
      optionsToCreate.push({
        name: "Express Botanical Delivery (Air)",
        service_zone_id: indiaServiceZone.id,
        shipping_profile_id: defaultProfile.id,
        provider_id: "manual_manual",
        price_type: ShippingOptionPriceType.FLAT,
        type: {
          label: "Express Botanical Delivery",
          description: "Priority air transit for live plants & perishable seeds (1-2 business days)",
          code: "express",
        },
        prices: [{ currency_code: "inr", amount: 9900 }],
        rules: [
          { operator: RuleOperator.IN, attribute: "is_return", value: ["false"] },
          { operator: RuleOperator.IN, attribute: "enabled_in_store", value: ["true"] },
        ],
      });
    }

    if (!hasSrStandard) {
      optionsToCreate.push({
        name: "Shiprocket Standard Delivery (Surface)",
        service_zone_id: indiaServiceZone.id,
        shipping_profile_id: defaultProfile.id,
        provider_id: "shiprocket_shiprocket",
        price_type: ShippingOptionPriceType.FLAT,
        data: { option_code: "shiprocket-standard" },
        type: {
          label: "Shiprocket Standard Surface",
          description: "Eco-friendly surface delivery via Shiprocket network across India",
          code: "shiprocket-standard",
        },
        prices: [{ currency_code: "inr", amount: 4900 }],
        rules: [
          { operator: RuleOperator.IN, attribute: "is_return", value: ["false"] },
          { operator: RuleOperator.IN, attribute: "enabled_in_store", value: ["true"] },
        ],
      });
    }

    if (!hasSrExpress) {
      optionsToCreate.push({
        name: "Shiprocket Express Botanical Delivery (Air)",
        service_zone_id: indiaServiceZone.id,
        shipping_profile_id: defaultProfile.id,
        provider_id: "shiprocket_shiprocket",
        price_type: ShippingOptionPriceType.FLAT,
        data: { option_code: "shiprocket-express" },
        type: {
          label: "Shiprocket Express Air",
          description: "Priority air transit with moisture-shield packaging for live plants",
          code: "shiprocket-express",
        },
        prices: [{ currency_code: "inr", amount: 9900 }],
        rules: [
          { operator: RuleOperator.IN, attribute: "is_return", value: ["false"] },
          { operator: RuleOperator.IN, attribute: "enabled_in_store", value: ["true"] },
        ],
      });
    }

    if (optionsToCreate.length > 0) {
      logger.info(`Creating ${optionsToCreate.length} Indian shipping options...`);
      await createShippingOptionsWorkflow(container).run({
        input: optionsToCreate,
      });
    }

    // Link existing products to default shipping profile
    const { data: allProds } = await query.graph({
      entity: "product",
      fields: ["id"],
    });
    if (allProds.length > 0) {
      try {
        const prodLinks = allProds.map((p) => ({
          [Modules.PRODUCT]: { product_id: p.id },
          [Modules.FULFILLMENT]: { shipping_profile_id: defaultProfile.id },
        }));
        await link.create(prodLinks);
        logger.info(`Linked ${prodLinks.length} products to default shipping profile.`);
      } catch (e: unknown) {
        logger.info(`Product shipping profile link skipped or active: ${e}`);
      }
    }
  }

  // 8. Ensure Publishable API Key exists and is linked to the Sales Channel
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

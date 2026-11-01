import { OfferService } from "../modules/offer/offer-service";

async function main() {
  console.log("Seeding GLOROV Botanical Promotional Offers...");
  const offers = await OfferService.seedDefaults(true);
  console.log(`Successfully seeded ${offers.length} offers:`);
  offers.forEach((o) => {
    console.log(` - [${o.code}] ${o.title} (${o.tag}) -> ${o.discount_badge} [active: ${o.is_active}, highlighted: ${o.is_highlighted}]`);
  });
}

main().catch((err) => {
  console.error("Failed to seed offers:", err);
  process.exit(1);
});

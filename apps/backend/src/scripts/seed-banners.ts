import { BannerService } from "../modules/banner/banner-service";

export default async function seedBanners() {
  console.log("🌱 Seeding GLOROV Hero Carousel Banners into database/persistence...");
  const banners = await BannerService.seedDefaults(true);
  console.log(`✅ Successfully seeded ${banners.length} carousel banners:`);
  for (const b of banners) {
    console.log(`   - [${b.display_order}] ${b.title} -> ${b.cta_route} (${b.desktop_image_url})`);
  }
}

// Allow direct execution: ts-node src/scripts/seed-banners.ts
if (require.main === module) {
  seedBanners()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Failed to seed banners:", err);
      process.exit(1);
    });
}

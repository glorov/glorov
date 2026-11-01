import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types";
import { Container, Heading, Text, Badge } from "@medusajs/ui";

const BotanicalDetailsWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const metadata = (data.metadata || {}) as Record<string, any>;

  const hasBotanicalData =
    metadata.common_name ||
    metadata.botanical_name ||
    metadata.seed_type ||
    metadata.variety ||
    metadata.approx_seeds_per_packet ||
    metadata.germination_time_range ||
    metadata.sowing_depth ||
    metadata.spacing ||
    metadata.sunlight ||
    metadata.watering ||
    metadata.season ||
    metadata.planting_instructions ||
    metadata.packaging_notes;

  if (!hasBotanicalData) {
    return (
      <Container className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h2" className="text-base font-semibold text-ui-fg-base">
              🌿 Botanical & Cultivation Specifications
            </Heading>
            <Text className="text-sm text-ui-fg-subtle mt-1">
              No seed or plant metadata configured for this product. You can add botanical attributes via the Metadata section below.
            </Text>
          </div>
        </div>
      </Container>
    );
  }

  const formatBadge = (val?: string) => {
    if (!val) return "Not specified";
    return val.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatSeason = (season?: string) => {
    if (!season) return "All Season";
    switch (season.toLowerCase()) {
      case "kharif":
        return "Kharif (Monsoon)";
      case "rabi":
        return "Rabi (Winter)";
      case "zaid":
        return "Zaid (Summer)";
      case "all_season":
        return "All Season";
      default:
        return formatBadge(season);
    }
  };

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Heading level="h2" className="text-base font-semibold text-ui-fg-base flex items-center gap-2">
            <span>🌿</span> Botanical & Cultivation Specifications
          </Heading>
          <Text className="text-sm text-ui-fg-subtle mt-1">
            Indian botanical parameters, viability specs, and growing guidelines.
          </Text>
        </div>
        <div>
          {metadata.is_perishable ? (
            <Badge color="orange">Live Perishable Plant</Badge>
          ) : (
            <Badge color="green">Viable Seed / Shelf Stable</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-3 border-t border-b border-ui-border-base text-sm">
        <div>
          <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
            Common Name
          </Text>
          <Text className="font-semibold text-ui-fg-base mt-1">
            {metadata.common_name || "—"}
          </Text>
        </div>
        <div>
          <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
            Botanical Name
          </Text>
          <Text className="font-semibold italic text-ui-fg-base mt-1">
            {metadata.botanical_name || "—"}
          </Text>
        </div>
        <div>
          <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
            Seed Type / Variety
          </Text>
          <Text className="font-semibold text-ui-fg-base mt-1">
            {metadata.seed_type ? `${metadata.seed_type}` : "—"}
            {metadata.variety ? ` (${metadata.variety})` : ""}
          </Text>
        </div>
        <div>
          <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
            Growing Season
          </Text>
          <div className="mt-1">
            <Badge color="green">{formatSeason(metadata.season)}</Badge>
          </div>
        </div>
        <div>
          <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
            Approx Seeds / Packet
          </Text>
          <Text className="font-semibold text-ui-fg-base mt-1">
            {metadata.approx_seeds_per_packet ? `${metadata.approx_seeds_per_packet} seeds` : "—"}
          </Text>
        </div>
        <div>
          <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
            Germination Time
          </Text>
          <Text className="font-semibold text-ui-fg-base mt-1">
            {metadata.germination_time_range || "—"}
          </Text>
        </div>
        <div>
          <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
            Sowing Depth
          </Text>
          <Text className="font-semibold text-ui-fg-base mt-1">
            {metadata.sowing_depth || "—"}
          </Text>
        </div>
        <div>
          <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
            Plant Spacing
          </Text>
          <Text className="font-semibold text-ui-fg-base mt-1">
            {metadata.spacing || "—"}
          </Text>
        </div>
        <div>
          <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
            Sunlight
          </Text>
          <div className="mt-1">
            <Badge color="blue">{formatBadge(metadata.sunlight)}</Badge>
          </div>
        </div>
        <div>
          <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
            Watering
          </Text>
          <div className="mt-1">
            <Badge color="purple">{formatBadge(metadata.watering)}</Badge>
          </div>
        </div>
      </div>

      {metadata.planting_instructions && (
        <div className="mt-4 pt-2">
          <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
            Sowing & Planting Instructions
          </Text>
          <Text className="text-sm text-ui-fg-subtle mt-1 leading-relaxed">
            {metadata.planting_instructions}
          </Text>
        </div>
      )}

      {metadata.packaging_notes && (
        <div className="mt-3">
          <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
            Packaging & Storage Notes
          </Text>
          <Text className="text-sm text-ui-fg-subtle mt-1 leading-relaxed">
            {metadata.packaging_notes}
          </Text>
        </div>
      )}

      {/* Storefront Product Card Badge Status */}
      <div className="mt-4 pt-3 border-t border-ui-border-base flex items-center justify-between">
        <div>
          <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
            🏷️ Storefront Product Card Tag
          </Text>
          <Text className="text-xs text-ui-fg-subtle mt-0.5">
            Live badge shown on mobile & web cards. If no tag is set in the dashboard database, the card renders cleanly without any badge.
          </Text>
        </div>
        <div>
          {(() => {
            const configuredBadge =
              (Array.isArray(data.tags) && data.tags[0]?.value) ||
              (Array.isArray(metadata.badges) && metadata.badges[0]) ||
              (typeof metadata.badge === "string" && metadata.badge) ||
              null;
            return configuredBadge ? (
              <Badge color="purple" size="small">
                ⚡ {String(configuredBadge).toUpperCase()}
              </Badge>
            ) : (
              <span className="text-xs text-ui-fg-muted italic">
                No Tag (Clean Card)
              </span>
            );
          })()}
        </div>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default BotanicalDetailsWidget;

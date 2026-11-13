import { defineRouteConfig } from "@medusajs/admin-sdk";
import React, { useState, useEffect } from "react";
import { adminFetch } from "../../utils/admin-client";
import { CloudinaryMediaPicker } from "../../components/cloudinary-media-picker";
import {
  Container,
  Heading,
  Text,
  Badge,
  Button,
  Input,
  Switch,
  Toaster,
  toast,
} from "@medusajs/ui";

export interface HeroTrustPill {
  icon: string;
  text: string;
}

export interface HeroConfig {
  id: string;
  tag: string;
  headline: string;
  description: string;
  cta_text: string;
  cta_route: string;
  secondary_cta_text: string;
  secondary_cta_route: string;
  desktop_image_url: string;
  mobile_image_url: string;
  plant_tag: string;
  plant_name: string;
  plant_route?: string;
  trust_pills: HeroTrustPill[];
  is_active: boolean;
  updated_at: string;
}

const AVAILABLE_ICONS = [
  { value: "local_shipping_outlined", label: "🚚 Shipping Truck" },
  { value: "ac_unit_rounded", label: "❄️ Winter / Snowflake" },
  { value: "eco_outlined", label: "🌱 Botanical Leaf" },
  { value: "verified", label: "🛡️ Safe / Verified Shield" },
  { value: "bolt", label: "⚡ Fast Dispatch" },
  { value: "spa", label: "🌿 Organic Spa" },
];

const SparklesIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const HeroAdminPage = () => {
  const [hero, setHero] = useState<HeroConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchHero = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch("/admin/hero");
      if (res.ok && res.data?.hero) {
        setHero(res.data.hero);
      } else {
        toast.error("Failed to load hero showcase configuration");
      }
    } catch {
      toast.error("Network error while connecting to hero API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHero();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hero) return;

    setIsSaving(true);
    try {
      const res = await adminFetch("/admin/hero", {
        method: "POST",
        body: hero,
      });

      if (res.ok) {
        toast.success("Hero showcase updated successfully!");
        if (res.data?.hero) {
          setHero(res.data.hero);
        }
      } else {
        toast.error(res.data?.message || "Failed to update hero config");
      }
    } catch {
      toast.error("Error saving hero configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePillChange = (index: number, field: keyof HeroTrustPill, val: string) => {
    if (!hero) return;
    const nextPills = [...hero.trust_pills];
    nextPills[index] = { ...nextPills[index], [field]: val };
    setHero({ ...hero, trust_pills: nextPills });
  };

  const handleAddPill = () => {
    if (!hero) return;
    const nextPills = [
      ...hero.trust_pills,
      { icon: "local_shipping_outlined", text: "Free Shipping for $4.99" },
    ];
    setHero({ ...hero, trust_pills: nextPills });
  };

  const handleRemovePill = (index: number) => {
    if (!hero) return;
    const nextPills = hero.trust_pills.filter((_, i) => i !== index);
    setHero({ ...hero, trust_pills: nextPills });
  };

  if (isLoading || !hero) {
    return (
      <Container className="p-8 space-y-4">
        <Toaster />
        <Heading level="h1">Hero Showcase & Trust Badges</Heading>
        <Text className="text-ui-fg-muted">Loading live hero configuration...</Text>
      </Container>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <Toaster />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ui-border-base pb-6">
        <div>
          <div className="flex items-center gap-3">
            <Heading level="h1" className="text-2xl font-bold tracking-tight text-ui-fg-base">
              Hero Showcase & Trust Pills
            </Heading>
            <Badge color="green" size="small">
              Storefront Dynamic
            </Badge>
          </div>
          <Text className="text-sm text-ui-fg-muted mt-1">
            Configure dynamic headline, CTAs, trust badges (e.g. Free Shipping), and highlighted botanicals across web and mobile.
          </Text>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={fetchHero} disabled={isSaving}>
            Refresh
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Live Visual Preview Card */}
        <Container className="p-6 bg-[#FAF7F2] border border-[#E0D8CB] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Text className="text-xs font-semibold tracking-wider text-[#2D6A4F] uppercase">
              Live Storefront Preview
            </Text>
            <Badge color={hero.is_active ? "green" : "grey"}>
              {hero.is_active ? "Visible on Storefront" : "Disabled"}
            </Badge>
          </div>

          <div className="p-6 bg-white rounded-xl border border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className={`space-y-4 ${hero.desktop_image_url ? "md:col-span-2" : "md:col-span-3"}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1B4332] text-white text-xs font-semibold rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#FFD51F]"></span>
                {hero.tag || "ORGANIC BOTANICAL COLLECTION"}
              </div>

              <h2 className="text-3xl font-extrabold text-[#1B4332] whitespace-pre-line leading-tight">
                {hero.headline || "Grow Something Beautiful."}
              </h2>

              <p className="text-sm text-stone-600 max-w-xl line-clamp-2">
                {hero.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  className="px-5 py-2.5 bg-[#1B4332] text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  {hero.cta_text} →
                </button>
                <button
                  type="button"
                  className="px-4 py-2.5 border border-[#1B4332] text-[#1B4332] text-xs font-semibold rounded-lg"
                >
                  {hero.secondary_cta_text}
                </button>
              </div>

              {/* Rendered Trust Pills in Preview */}
              <div className="pt-4 border-t border-stone-100">
                <Text className="text-xs font-medium text-stone-400 mb-2">Live Trust Pills:</Text>
                <div className="flex flex-wrap gap-2">
                  {hero.trust_pills.map((pill, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4F9F4] border border-[#D8EADB] text-xs font-semibold text-[#1B4332]"
                    >
                      <span>
                        {pill.icon.includes("shipping") ? "🚚" : pill.icon.includes("unit") ? "❄️" : "🌱"}
                      </span>
                      <span>{pill.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {hero.desktop_image_url && (
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-stone-200 bg-stone-50 flex items-center justify-center shadow-xs">
                <img
                  src={hero.desktop_image_url}
                  alt="Hero Showcase Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </Container>

        {/* Trust Pills Configuration Section */}
        <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl space-y-6">
          <div className="flex items-center justify-between border-b border-ui-border-base pb-4">
            <div>
              <Heading level="h2" className="text-lg font-semibold text-ui-fg-base">
                Trust Pills (Shipping & Guarantees)
              </Heading>
              <Text className="text-xs text-ui-fg-muted mt-0.5">
                Manage backend-controlled value propositions like Free Shipping and seasonal specials.
              </Text>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={handleAddPill}
              className="flex items-center gap-1.5"
            >
              <PlusIcon /> Add Pill
            </Button>
          </div>

          <div className="space-y-3">
            {hero.trust_pills.map((pill, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-ui-bg-subtle border border-ui-border-base rounded-lg"
              >
                <div className="w-1/3">
                  <label className="text-xs font-medium text-ui-fg-muted block mb-1">
                    Pill Icon
                  </label>
                  <select
                    className="w-full text-xs p-2 rounded border border-ui-border-base bg-ui-bg-field text-ui-fg-base"
                    value={pill.icon}
                    onChange={(e) => handlePillChange(idx, "icon", e.target.value)}
                  >
                    {AVAILABLE_ICONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="text-xs font-medium text-ui-fg-muted block mb-1">
                    Display Label (e.g. Free Shipping for $4.99)
                  </label>
                  <Input
                    value={pill.text}
                    onChange={(e) => handlePillChange(idx, "text", e.target.value)}
                    placeholder="Free Shipping for $4.99"
                  />
                </div>

                <div className="pt-5">
                  <Button
                    type="button"
                    variant="danger"
                    size="small"
                    onClick={() => handleRemovePill(idx)}
                    disabled={hero.trust_pills.length <= 1}
                  >
                    <TrashIcon />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Container>

        {/* Editorial Text & CTA Section */}
        <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl space-y-6">
          <Heading level="h2" className="text-lg font-semibold text-ui-fg-base border-b border-ui-border-base pb-3">
            Editorial Copy & Navigation Routes
          </Heading>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-ui-fg-base block mb-1">
                Category Tag / Pill
              </label>
              <Input
                value={hero.tag}
                onChange={(e) => setHero({ ...hero, tag: e.target.value })}
                placeholder="ORGANIC BOTANICAL COLLECTION 2026"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ui-fg-base block mb-1">
                Headline
              </label>
              <Input
                value={hero.headline}
                onChange={(e) => setHero({ ...hero, headline: e.target.value })}
                placeholder="Grow Something Beautiful."
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-ui-fg-base block mb-1">
                Description Paragraph
              </label>
              <textarea
                className="w-full text-xs p-3 rounded-lg border border-ui-border-base bg-ui-bg-field text-ui-fg-base resize-y min-h-[70px]"
                value={hero.description}
                onChange={(e) => setHero({ ...hero, description: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ui-fg-base block mb-1">
                Primary CTA Text
              </label>
              <Input
                value={hero.cta_text}
                onChange={(e) => setHero({ ...hero, cta_text: e.target.value })}
                placeholder="Shop Seeds & Plants"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ui-fg-base block mb-1">
                Primary CTA Route
              </label>
              <Input
                value={hero.cta_route}
                onChange={(e) => setHero({ ...hero, cta_route: e.target.value })}
                placeholder="/categories/seeds"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ui-fg-base block mb-1">
                Secondary CTA Text
              </label>
              <Input
                value={hero.secondary_cta_text}
                onChange={(e) => setHero({ ...hero, secondary_cta_text: e.target.value })}
                placeholder="Explore Care Guides"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ui-fg-base block mb-1">
                Secondary CTA Route
              </label>
              <Input
                value={hero.secondary_cta_route}
                onChange={(e) => setHero({ ...hero, secondary_cta_route: e.target.value })}
                placeholder="/plant-doctor"
              />
            </div>
          </div>
        </Container>

        {/* Hero Showcase Imagery (Desktop & Mobile) */}
        <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl space-y-6">
          <div className="border-b border-ui-border-base pb-3">
            <Heading level="h2" className="text-lg font-semibold text-ui-fg-base">
              Hero Showcase Imagery (Desktop & Mobile)
            </Heading>
            <Text className="text-xs text-ui-fg-muted mt-0.5">
              Directly upload new images to Cloudinary or select existing assets from your Cloudinary media library.
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CloudinaryMediaPicker
              label="Desktop Hero Background Image"
              value={hero.desktop_image_url || ""}
              onChange={(url) => setHero({ ...hero, desktop_image_url: url })}
              placeholder="https://res.cloudinary.com/... or image URL"
              folder="glorov/banners"
              aspectRatio="21:9 / 16:9"
              recommendedDimensions="2560 × 1080 px"
              helperText="High-resolution hero visual displayed on desktop storefront."
            />

            <CloudinaryMediaPicker
              label="Mobile Hero Image"
              value={hero.mobile_image_url || ""}
              onChange={(url) => setHero({ ...hero, mobile_image_url: url })}
              placeholder="https://res.cloudinary.com/... or image URL (Optional)"
              folder="glorov/banners"
              aspectRatio="3:4 Portrait"
              recommendedDimensions="1080 × 1440 px"
              helperText="Portrait hero visual optimized for mobile devices and tablets."
            />
          </div>
        </Container>

        {/* Botanical Specimen Spotlight */}
        <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl space-y-6">
          <Heading level="h2" className="text-lg font-semibold text-ui-fg-base border-b border-ui-border-base pb-3">
            Botanical Plant Spotlight Card
          </Heading>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-ui-fg-base block mb-1">
                Plant Tag
              </label>
              <Input
                value={hero.plant_tag}
                onChange={(e) => setHero({ ...hero, plant_tag: e.target.value })}
                placeholder="PLANT OF THE SEASON"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-ui-fg-base block mb-1">
                Plant Specimen Name
              </label>
              <Input
                value={hero.plant_name}
                onChange={(e) => setHero({ ...hero, plant_name: e.target.value })}
                placeholder="Monstera Deliciosa • Swiss Cheese"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-ui-border-base">
            <div className="flex items-center gap-3">
              <Switch
                checked={hero.is_active}
                onCheckedChange={(val) => setHero({ ...hero, is_active: val })}
              />
              <Text className="text-sm font-medium text-ui-fg-base">
                Hero Showcase Active on Storefront
              </Text>
            </div>

            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Hero Configuration"}
            </Button>
          </div>
        </Container>
      </form>
    </div>
  );
};

export const config = defineRouteConfig({
  label: "Hero Showcase",
  icon: SparklesIcon,
});

export default HeroAdminPage;

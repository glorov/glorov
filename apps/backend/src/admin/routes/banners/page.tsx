import { defineRouteConfig } from "@medusajs/admin-sdk";
import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Heading,
  Text,
  Badge,
  Button,
  Input,
  Switch,
  Table,
  Toaster,
  toast,
} from "@medusajs/ui";

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  desktop_image_url: string;
  mobile_image_url: string;
  cta_text: string;
  cta_route: string;
  cta_arguments?: Record<string, unknown>;
  display_order: number;
  is_active: boolean;
  bg_color?: string;
  created_at: string;
  updated_at: string;
}

const PAGE_CONNECTION_PRESETS = [
  { label: "Seeds & Live Plants", route: "/categories/seeds", tag: "seeds" },
  { label: "Live Houseplants", route: "/categories/live-plants", tag: "live-plants" },
  { label: "Flowering Plants & Seeds", route: "/categories/flowering", tag: "flowering" },
  { label: "Kitchen Garden Vegetable Seeds", route: "/categories/vegetables", tag: "vegetables" },
  { label: "Planters & Pots", route: "/categories/planters", tag: "planters" },
  { label: "Organic Plant Care & Soil", route: "/categories/plant-care", tag: "plant-care" },
  { label: "Festive Offers & Discounts", route: "/offers", tag: "offers" },
  { label: "All Botanical Storefront", route: "/store", tag: "store" },
];

const CarouselIcon = () => (
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
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const BannersAdminPage = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activePreviewTab, setActivePreviewTab] = useState<"desktop" | "mobile">("desktop");
  const [previewSlideIdx, setPreviewSlideIdx] = useState<number>(0);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch("/admin/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners || []);
      } else {
        toast.error("Error", { description: "Failed to load banners from backend API." });
      }
    } catch {
      toast.error("Connection Error", { description: "Could not reach /admin/banners endpoint." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const activeBanners = useMemo(() => banners.filter((b) => b.is_active), [banners]);

  // Handle direct status toggle
  const handleToggleActive = async (banner: Banner) => {
    try {
      const res = await fetch(`/admin/banners/${banner.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !banner.is_active }),
      });
      if (res.ok) {
        toast.success("Updated", {
          description: `Banner '${banner.title}' is now ${!banner.is_active ? "Active" : "Inactive"}.`,
        });
        fetchBanners();
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Network error while updating banner");
    }
  };

  // Handle delete
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete carousel slide "${title}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/admin/banners/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deleted", { description: "Carousel slide removed successfully." });
        fetchBanners();
      } else {
        toast.error("Failed to delete banner");
      }
    } catch {
      toast.error("Network error while deleting banner");
    }
  };

  // Re-seed default banners
  const handleSeedDefaults = async () => {
    if (!window.confirm("Reset and re-seed the 4 default botanical hero carousel slides?")) {
      return;
    }
    try {
      const res = await fetch("/admin/banners/seed", { method: "POST" });
      if (res.ok) {
        toast.success("Seeded", { description: "Default carousel banners seeded successfully." });
        fetchBanners();
      }
    } catch {
      toast.error("Network error while seeding default banners");
    }
  };

  // Save banner (Create or Update)
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner?.title || !editingBanner?.desktop_image_url) {
      toast.error("Validation Error", { description: "Title and Desktop Image URL are required." });
      return;
    }

    try {
      setIsSubmitting(true);
      const isUpdate = Boolean(editingBanner.id);
      const url = isUpdate ? `/admin/banners/${editingBanner.id}` : "/admin/banners";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingBanner.title,
          subtitle: editingBanner.subtitle,
          tag: editingBanner.tag,
          desktop_image_url: editingBanner.desktop_image_url,
          mobile_image_url: editingBanner.mobile_image_url || editingBanner.desktop_image_url,
          cta_text: editingBanner.cta_text || "SHOP NOW",
          cta_route: editingBanner.cta_route || "/categories/seeds",
          cta_arguments: editingBanner.cta_arguments || {},
          display_order: Number(editingBanner.display_order) || 1,
          is_active: editingBanner.is_active !== undefined ? editingBanner.is_active : true,
          bg_color: editingBanner.bg_color || "#1E3D2F",
        }),
      });

      if (res.ok) {
        toast.success("Success", {
          description: isUpdate ? "Banner updated successfully." : "New carousel slide added.",
        });
        setIsModalOpen(false);
        setEditingBanner(null);
        fetchBanners();
      } else {
        const err = await res.json();
        toast.error("Error", { description: err.message || "Failed to save banner." });
      }
    } catch {
      toast.error("Network Error", { description: "Failed to communicate with server." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openNewBannerModal = () => {
    setEditingBanner({
      title: "",
      subtitle: "",
      tag: "GROW WITH GLOROV",
      desktop_image_url: "/banners/banner_garden_begins_desktop.png",
      mobile_image_url: "/banners/banner_garden_begins_mobile.jpg",
      cta_text: "EXPLORE COLLECTION",
      cta_route: "/categories/seeds",
      display_order: banners.length + 1,
      is_active: true,
      bg_color: "#1E3D2F",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner({ ...banner });
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <Toaster />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6 border-ui-border-base">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-ui-bg-subtle rounded-lg text-ui-fg-subtle">
              <CarouselIcon />
            </span>
            <Heading level="h1" className="text-2xl font-semibold text-ui-fg-base">
              Hero Carousel Banners
            </Heading>
          </div>
          <Text className="text-ui-fg-subtle text-sm mt-1">
            Manage multi-device homepage promotional slides, set custom page connections, and preview live layouts.
          </Text>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="small" onClick={handleSeedDefaults}>
            Seed Default Banners
          </Button>
          <Button variant="primary" size="small" onClick={openNewBannerModal}>
            + Add New Slide
          </Button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Container className="p-5 flex items-center justify-between">
          <div>
            <Text className="text-ui-fg-subtle text-xs uppercase tracking-wider font-medium">Total Slides</Text>
            <Heading level="h2" className="text-3xl font-bold mt-1 text-ui-fg-base">{banners.length}</Heading>
          </div>
          <Badge color="grey">Configured</Badge>
        </Container>
        <Container className="p-5 flex items-center justify-between">
          <div>
            <Text className="text-ui-fg-subtle text-xs uppercase tracking-wider font-medium">Live on Storefront</Text>
            <Heading level="h2" className="text-3xl font-bold mt-1 text-ui-fg-base text-emerald-600">{activeBanners.length}</Heading>
          </div>
          <Badge color="green">Active</Badge>
        </Container>
        <Container className="p-5 flex items-center justify-between">
          <div>
            <Text className="text-ui-fg-subtle text-xs uppercase tracking-wider font-medium">Auto-Scroll Cadence</Text>
            <Heading level="h2" className="text-2xl font-bold mt-1 text-ui-fg-base">6.0s</Heading>
          </div>
          <Badge color="blue">Pause on Hover</Badge>
        </Container>
      </div>

      {/* Interactive Carousel Preview */}
      {activeBanners.length > 0 && (
        <Container className="p-6 bg-ui-bg-subtle/40 border border-ui-border-base rounded-2xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <Heading level="h3" className="text-base font-semibold text-ui-fg-base">
                Live Storefront Preview
              </Heading>
              <Text className="text-ui-fg-subtle text-xs">
                Switch between Desktop (Landscape 2.75:1) and Mobile (Portrait 3:4) viewports.
              </Text>
            </div>

            <div className="flex items-center gap-2 bg-ui-bg-base p-1 rounded-lg border border-ui-border-base">
              <Button
                variant={activePreviewTab === "desktop" ? "primary" : "transparent"}
                size="small"
                onClick={() => setActivePreviewTab("desktop")}
              >
                Desktop (1280px)
              </Button>
              <Button
                variant={activePreviewTab === "mobile" ? "primary" : "transparent"}
                size="small"
                onClick={() => setActivePreviewTab("mobile")}
              >
                Mobile (390px)
              </Button>
            </div>
          </div>

          {/* Active Preview Viewport */}
          <div className="flex justify-center p-4 bg-ui-bg-base rounded-xl border border-ui-border-base overflow-hidden">
            {activePreviewTab === "desktop" ? (
              <div className="w-full max-w-4xl relative rounded-xl overflow-hidden shadow-md bg-stone-900 border border-ui-border-base" style={{ aspectRatio: "2.75 / 1" }}>
                <img
                  src={activeBanners[previewSlideIdx % activeBanners.length]?.desktop_image_url}
                  alt={activeBanners[previewSlideIdx % activeBanners.length]?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
                  {activeBanners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPreviewSlideIdx(i)}
                      className={`h-2 rounded-full transition-all ${
                        previewSlideIdx % activeBanners.length === i
                          ? "w-8 bg-white shadow"
                          : "w-2 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-[300px] relative rounded-2xl overflow-hidden shadow-lg bg-stone-900 border-4 border-stone-800" style={{ aspectRatio: "3 / 4" }}>
                <img
                  src={
                    activeBanners[previewSlideIdx % activeBanners.length]?.mobile_image_url ||
                    activeBanners[previewSlideIdx % activeBanners.length]?.desktop_image_url
                  }
                  alt={activeBanners[previewSlideIdx % activeBanners.length]?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {activeBanners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPreviewSlideIdx(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        previewSlideIdx % activeBanners.length === i
                          ? "w-6 bg-white shadow"
                          : "w-1.5 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Container>
      )}

      {/* Carousel Banners Table */}
      <Container className="p-0 overflow-hidden border border-ui-border-base rounded-xl">
        <div className="p-4 border-b border-ui-border-base flex items-center justify-between">
          <Heading level="h2" className="text-base font-semibold">Configured Carousel Slides</Heading>
          <Text className="text-xs text-ui-fg-muted">Items ordered by display position</Text>
        </div>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell className="w-12 text-center">Order</Table.HeaderCell>
              <Table.HeaderCell className="w-24">Desktop Asset</Table.HeaderCell>
              <Table.HeaderCell className="w-20">Mobile Asset</Table.HeaderCell>
              <Table.HeaderCell>Campaign Title &amp; Tag</Table.HeaderCell>
              <Table.HeaderCell>Connected Page</Table.HeaderCell>
              <Table.HeaderCell className="w-28 text-center">Status</Table.HeaderCell>
              <Table.HeaderCell className="w-32 text-right">Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading ? (
              <Table.Row>
                <td className="text-center py-8 text-ui-fg-muted text-sm" colSpan={7}>
                  Loading carousel slides...
                </td>
              </Table.Row>
            ) : banners.length === 0 ? (
              <Table.Row>
                <td className="text-center py-12 text-ui-fg-muted text-sm" colSpan={7}>
                  No carousel slides found. Click &quot;Seed Default Banners&quot; to restore the 4 default campaigns.
                </td>
              </Table.Row>
            ) : (
              banners.map((b) => (
                <Table.Row key={b.id}>
                  <Table.Cell className="text-center font-semibold text-ui-fg-muted">
                    #{b.display_order}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="w-20 h-10 rounded overflow-hidden bg-ui-bg-subtle border border-ui-border-base">
                      <img src={b.desktop_image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="w-10 h-12 rounded overflow-hidden bg-ui-bg-subtle border border-ui-border-base">
                      <img src={b.mobile_image_url || b.desktop_image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {b.tag}
                      </span>
                      <p className="font-medium text-sm text-ui-fg-base">{b.title}</p>
                      <p className="text-xs text-ui-fg-subtle line-clamp-1">{b.subtitle}</p>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-1.5">
                      <code className="text-xs font-mono bg-ui-bg-subtle px-2 py-1 rounded text-ui-fg-base">
                        {b.cta_route}
                      </code>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={b.is_active}
                        onCheckedChange={() => handleToggleActive(b)}
                      />
                      <Badge color={b.is_active ? "green" : "grey"} size="small">
                        {b.is_active ? "Active" : "Hidden"}
                      </Badge>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="secondary" size="small" onClick={() => openEditModal(b)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="small" onClick={() => handleDelete(b.id, b.title)}>
                        Delete
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </Container>

      {/* Edit / Create Modal */}
      {isModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-ui-bg-base rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-ui-border-base space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <Heading level="h2" className="text-lg font-semibold">
                {editingBanner.id ? "Edit Carousel Slide" : "Add New Carousel Slide"}
              </Heading>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-ui-fg-subtle hover:text-ui-fg-base text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-ui-fg-subtle mb-1 block">Title *</label>
                  <Input
                    required
                    value={editingBanner.title || ""}
                    onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                    placeholder="e.g. Plant a Seed. Grow a Dream."
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ui-fg-subtle mb-1 block">Tag / Badge</label>
                  <Input
                    value={editingBanner.tag || ""}
                    onChange={(e) => setEditingBanner({ ...editingBanner, tag: e.target.value })}
                    placeholder="e.g. GROW WITH GLOROV"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-ui-fg-subtle mb-1 block">Subtitle / Description</label>
                <Input
                  value={editingBanner.subtitle || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  placeholder="e.g. A greener tomorrow begins with what you plant today."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-ui-fg-subtle mb-1 block">Desktop Image URL * (2.75:1 Landscape)</label>
                  <Input
                    required
                    value={editingBanner.desktop_image_url || ""}
                    onChange={(e) => setEditingBanner({ ...editingBanner, desktop_image_url: e.target.value })}
                    placeholder="/banners/banner_plant_seed_desktop.png"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-ui-fg-subtle mb-1 block">Mobile Image URL (3:4 Portrait)</label>
                  <Input
                    value={editingBanner.mobile_image_url || ""}
                    onChange={(e) => setEditingBanner({ ...editingBanner, mobile_image_url: e.target.value })}
                    placeholder="/banners/banner_plant_seed_mobile.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-ui-fg-subtle mb-1 block">CTA Button Text</label>
                  <Input
                    value={editingBanner.cta_text || "SHOP NOW"}
                    onChange={(e) => setEditingBanner({ ...editingBanner, cta_text: e.target.value })}
                    placeholder="SHOP NOW"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-ui-fg-subtle mb-1 block">Connected Store Page</label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-ui-border-base bg-ui-bg-field text-sm text-ui-fg-base"
                    value={editingBanner.cta_route || "/categories/seeds"}
                    onChange={(e) => setEditingBanner({ ...editingBanner, cta_route: e.target.value })}
                  >
                    {PAGE_CONNECTION_PRESETS.map((p) => (
                      <option key={p.route} value={p.route}>
                        {p.label} ({p.route})
                      </option>
                    ))}
                    <option value="/custom">Custom Route...</option>
                  </select>
                </div>
              </div>

              {editingBanner.cta_route === "/custom" && (
                <div>
                  <label className="text-xs font-medium text-ui-fg-subtle mb-1 block">Custom Route / Path</label>
                  <Input
                    value={editingBanner.cta_route || ""}
                    onChange={(e) => setEditingBanner({ ...editingBanner, cta_route: e.target.value })}
                    placeholder="/products/sample-product"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="text-xs font-medium text-ui-fg-subtle mb-1 block">Display Order</label>
                  <Input
                    type="number"
                    value={editingBanner.display_order ?? 1}
                    onChange={(e) => setEditingBanner({ ...editingBanner, display_order: Number(e.target.value) })}
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Switch
                    checked={editingBanner.is_active ?? true}
                    onCheckedChange={(checked) => setEditingBanner({ ...editingBanner, is_active: checked })}
                  />
                  <Text className="text-sm font-medium">Active on Storefront</Text>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-ui-border-base">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Carousel Slide"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const config = defineRouteConfig({
  label: "Hero Banners",
  icon: CarouselIcon,
});

export default BannersAdminPage;

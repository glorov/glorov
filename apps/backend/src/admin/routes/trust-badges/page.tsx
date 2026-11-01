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
import { TrustBadgeIconKey } from "../../../modules/trust-badge/types";

export interface TrustBadgeItem {
  id: string;
  title: string;
  subtitle?: string;
  icon_key: TrustBadgeIconKey;
  custom_icon_svg?: string;
  cta_route?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrustSectionSettings {
  bg_color: string;
  text_color: string;
  icon_bg_color: string;
  icon_color: string;
  divider_color: string;
  border_radius: number;
  is_visible: boolean;
  section_title?: string;
  section_subtitle?: string;
  updated_at: string;
}

// Built-in Botanical Custom Icons SVG Map
export const ICON_SVGS: Record<string, React.ReactNode> = {
  "fertilized-soil": (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 10v6" />
      <path d="M9 13c0-2.5 3-4 3-4s3 1.5 3 4" />
      <path d="M12 12c-2-1.5-4 0-4 2" />
      <circle cx="12" cy="16" r="5" strokeDasharray="1.5 2" />
      <path d="M5 20c1.5-1 3.5-1 5 0 1.5-1 3.5-1 5 0 1.5-1 3.5-1 5 0" />
    </svg>
  ),
  "potted-plant": (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 13h10l-1.2 8H8.2L7 13z" />
      <path d="M6 13h12" />
      <path d="M12 13V8" />
      <path d="M12 9c-2-3-6-2-6 1 2 1 5 0 6-1z" />
      <path d="M12 8c2-3 6-2 6 1-2 1-5 0-6-1z" />
    </svg>
  ),
  "replacement-arrows": (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  ),
  "support-hand": (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 15h6a3 3 0 0 1 3 3v2" />
      <path d="M7 14l2-4a2 2 0 0 1 2.5-1l2 .8a2 2 0 0 1 1.2 2.2L14 17" />
      <path d="M17 6c0-2.2 1.8-4 4-4 0 2.2-1.8 4-4 4z" />
      <path d="M17 6c0 2.2-1.8 4-4 4 0-2.2 1.8-4 4-4z" />
      <path d="M17 6v5" />
    </svg>
  ),
  "support-chat": (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <path d="M9.5 11.5c.5 1 1.5 2 2.5 2.5l1.2-1.2a1 1 0 0 1 1-.2c1 .4 2 .5 3 .5a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1C11.5 17.1 6.9 12.5 6.9 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1c0 1 .1 2 .5 3a1 1 0 0 1-.2 1l-1.2 1.2z" />
    </svg>
  ),
  "organic-shield": (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  "transit-truck": (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  "eco-leaf": (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  ),
  "water-drop": (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),
};

const THEME_GREEN_PRESETS = [
  { name: "Deep Botanical Green", hex: "#1B4332", text: "#FFFFFF", note: "Signature GLOROV Forest" },
  { name: "Rich Emerald", hex: "#2D6A4F", text: "#FFFFFF", note: "Fresh Nursery Tint" },
  { name: "Classic Ugaoo Green", hex: "#0A4C36", text: "#FFFFFF", note: "Deep Botanical Standard" },
  { name: "Evergreen Olive", hex: "#243E2C", text: "#FFFFFF", note: "Earth & Foliage" },
  { name: "Sage Light Green", hex: "#E8F5E9", text: "#1B4332", note: "Soft Mint Pastel" },
];

const ROUTE_PRESETS = [
  { label: "Plant Care & Soil", route: "/categories/plant-care" },
  { label: "Shipping Policy", route: "/policies/shipping-policy" },
  { label: "Transit Damage / Refund Policy", route: "/policies/refund-policy" },
  { label: "Plant Doctor & Care Support", route: "/plant-doctor" },
  { label: "Seeds Catalog", route: "/categories/seeds" },
  { label: "Live Houseplants", route: "/categories/live-plants" },
  { label: "Botanical Storefront", route: "/store" },
];

const TrustRibbonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const TrustBadgesAdminPage = () => {
  const [badges, setBadges] = useState<TrustBadgeItem[]>([]);
  const [settings, setSettings] = useState<TrustSectionSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingBadge, setEditingBadge] = useState<Partial<TrustBadgeItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/admin/trust-badges");
      if (res.ok) {
        const data = await res.json();
        setBadges(data.badges || []);
        setSettings(data.settings || null);
      } else {
        toast.error("Error", { description: "Failed to load trust badges from backend." });
      }
    } catch {
      toast.error("Connection Error", { description: "Could not reach /admin/trust-badges endpoint." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeBadges = useMemo(() => badges.filter((b) => b.is_active), [badges]);

  // Direct toggle active
  const handleToggleActive = async (badge: TrustBadgeItem) => {
    try {
      const res = await fetch(`/admin/trust-badges/${badge.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !badge.is_active }),
      });
      if (res.ok) {
        toast.success(badge.is_active ? "Badge Disabled" : "Badge Activated");
        fetchData();
      }
    } catch {
      toast.error("Toggle Failed");
    }
  };

  // Reorder
  const handleMove = async (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= badges.length) return;

    const copy = [...badges];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;

    const ids = copy.map((b) => b.id);
    try {
      const res = await fetch("/admin/trust-badges/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        toast.success("Order Updated");
        fetchData();
      }
    } catch {
      toast.error("Reorder Failed");
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trust badge?")) return;
    try {
      const res = await fetch(`/admin/trust-badges/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Badge Deleted");
        fetchData();
      }
    } catch {
      toast.error("Delete Failed");
    }
  };

  // Save Badge
  const handleSaveBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBadge?.title?.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(editingBadge.id);
      const url = isEdit ? `/admin/trust-badges/${editingBadge.id}` : "/admin/trust-badges";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBadge),
      });

      if (res.ok) {
        toast.success(isEdit ? "Badge Updated" : "Badge Created");
        setIsModalOpen(false);
        setEditingBadge(null);
        fetchData();
      } else {
        toast.error("Save Failed");
      }
    } catch {
      toast.error("Save Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/admin/trust-badges/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success("Section Theme Settings Saved");
        setIsSettingsOpen(false);
        fetchData();
      } else {
        toast.error("Settings Update Failed");
      }
    } catch {
      toast.error("Settings Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Defaults
  const handleResetDefaults = async () => {
    if (!confirm("Reset all trust badges and green theme settings to botanical defaults?")) return;
    try {
      const res = await fetch("/admin/trust-badges/seed", { method: "POST" });
      if (res.ok) {
        toast.success("Reset to Defaults Successfully");
        fetchData();
      }
    } catch {
      toast.error("Reset Failed");
    }
  };

  const renderBadgeIcon = (key: string, customSvg?: string) => {
    if (customSvg) {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: customSvg }}
          style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}
        />
      );
    }
    return ICON_SVGS[key] || ICON_SVGS["fertilized-soil"];
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Toaster />

      {/* Top Header Card */}
      <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Heading level="h1" className="text-xl font-bold">
                Trust Badges &amp; Value Guarantee Ribbon
              </Heading>
              <Badge color="green" size="small">
                {activeBadges.length} Active Badges
              </Badge>
            </div>
            <Text className="text-sm text-ui-fg-subtle mt-1">
              Control the unified horizontal trust banner (Image 2 style) shown across Storefront and Flutter apps. Customize botanical guarantees, custom icons, and theme green palette.
            </Text>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="secondary" onClick={handleResetDefaults} size="small">
              Reset to Defaults
            </Button>
            <Button variant="secondary" onClick={() => setIsSettingsOpen(true)} size="small">
              Theme Settings
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setEditingBadge({
                  title: "",
                  subtitle: "",
                  icon_key: "fertilized-soil",
                  cta_route: "/categories/plant-care",
                  display_order: badges.length + 1,
                  is_active: true,
                });
                setIsModalOpen(true);
              }}
              size="small"
            >
              + Add Badge
            </Button>
          </div>
        </div>
      </Container>

      {/* Live Interactive Preview Card */}
      <Container className="p-6 bg-ui-bg-subtle border border-ui-border-base rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Heading level="h2" className="text-base font-semibold">
              Live Storefront Preview
            </Heading>
            <Text className="text-xs text-ui-fg-subtle">
              Live representation of how shoppers view this green trust ribbon on mobile &amp; desktop.
            </Text>
          </div>

          <div className="flex items-center bg-ui-bg-base border border-ui-border-base rounded-lg p-1">
            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              className={`px-3 py-1 text-xs font-medium rounded ${
                previewDevice === "desktop" ? "bg-ui-bg-component text-ui-fg-base shadow-sm" : "text-ui-fg-subtle"
              }`}
            >
              Desktop View (Full)
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={`px-3 py-1 text-xs font-medium rounded ${
                previewDevice === "mobile" ? "bg-ui-bg-component text-ui-fg-base shadow-sm" : "text-ui-fg-subtle"
              }`}
            >
              Mobile View (375px)
            </button>
          </div>
        </div>

        {/* Live Banner Container */}
        <div className="flex justify-center py-4 bg-ui-bg-base rounded-xl border border-dashed border-ui-border-base overflow-x-auto p-4">
          <div
            style={{
              width: previewDevice === "mobile" ? "375px" : "100%",
              maxWidth: previewDevice === "mobile" ? "375px" : "1100px",
              transition: "all 0.3s ease",
            }}
          >
            <div
              style={{
                backgroundColor: settings?.bg_color || "#1B4332",
                color: settings?.text_color || "#FFFFFF",
                borderRadius: `${settings?.border_radius || 20}px`,
                padding: previewDevice === "mobile" ? "14px 10px" : "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
              }}
            >
              {activeBadges.map((badge, idx) => (
                <React.Fragment key={badge.id}>
                  {idx > 0 && (
                    <div
                      style={{
                        width: "1px",
                        height: previewDevice === "mobile" ? "36px" : "48px",
                        backgroundColor: settings?.divider_color || "rgba(255, 255, 255, 0.22)",
                        margin: previewDevice === "mobile" ? "0 4px" : "0 12px",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      padding: "0 4px",
                    }}
                  >
                    <div
                      style={{
                        width: previewDevice === "mobile" ? "38px" : "46px",
                        height: previewDevice === "mobile" ? "38px" : "46px",
                        borderRadius: "50%",
                        backgroundColor: settings?.icon_bg_color || "#FFFFFF",
                        color: settings?.icon_color || "#1B4332",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: previewDevice === "mobile" ? "6px" : "8px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                        flexShrink: 0,
                      }}
                    >
                      {renderBadgeIcon(badge.icon_key, badge.custom_icon_svg)}
                    </div>
                    <span
                      style={{
                        fontSize: previewDevice === "mobile" ? "11px" : "13px",
                        fontWeight: 600,
                        lineHeight: 1.25,
                        color: settings?.text_color || "#FFFFFF",
                        fontFamily: "Outfit, system-ui, sans-serif",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {badge.title}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* Badges Table Card */}
      <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl">
        <Heading level="h2" className="text-base font-semibold mb-4">
          All Trust Badges ({badges.length})
        </Heading>

        {loading ? (
          <div className="py-8 text-center text-ui-fg-muted">Loading botanical trust badges...</div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell className="w-12">Order</Table.HeaderCell>
                <Table.HeaderCell className="w-16">Icon</Table.HeaderCell>
                <Table.HeaderCell>Title &amp; Subtitle</Table.HeaderCell>
                <Table.HeaderCell>Route</Table.HeaderCell>
                <Table.HeaderCell className="w-24">Status</Table.HeaderCell>
                <Table.HeaderCell className="text-right w-36">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {badges.map((badge, index) => (
                <Table.Row key={badge.id} className={!badge.is_active ? "opacity-60 bg-ui-bg-subtle" : ""}>
                  <Table.Cell>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-xs text-ui-fg-subtle">#{badge.display_order}</span>
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => handleMove(index, "up")}
                          disabled={index === 0}
                          className="text-xs hover:text-ui-fg-base disabled:opacity-20 px-1"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, "down")}
                          disabled={index === badges.length - 1}
                          className="text-xs hover:text-ui-fg-base disabled:opacity-20 px-1"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        backgroundColor: "#1B4332",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {renderBadgeIcon(badge.icon_key, badge.custom_icon_svg)}
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{badge.title}</span>
                      {badge.subtitle && (
                        <span className="text-xs text-ui-fg-subtle line-clamp-1">{badge.subtitle}</span>
                      )}
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <span className="text-xs font-mono text-ui-fg-muted">{badge.cta_route || "—"}</span>
                  </Table.Cell>

                  <Table.Cell>
                    <Switch
                      checked={badge.is_active}
                      onCheckedChange={() => handleToggleActive(badge)}
                    />
                  </Table.Cell>

                  <Table.Cell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => {
                          setEditingBadge({ ...badge });
                          setIsModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleDelete(badge.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>

      {/* Modal: Add / Edit Trust Badge */}
      {isModalOpen && editingBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-ui-bg-base border border-ui-border-base rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-ui-border-base pb-3">
              <Heading level="h2" className="text-base font-bold">
                {editingBadge.id ? "Edit Trust Badge" : "Add Botanical Trust Badge"}
              </Heading>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-ui-fg-muted hover:text-ui-fg-base text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBadge} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Badge Title *</label>
                <Input
                  placeholder="e.g., 90-Day Pre Fertilised Soil"
                  value={editingBadge.title || ""}
                  onChange={(e) => setEditingBadge({ ...editingBadge, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Subtitle / Tooltip (Optional)</label>
                <Input
                  placeholder="e.g., Organic soil blend tested for 98%+ germination vigor"
                  value={editingBadge.subtitle || ""}
                  onChange={(e) => setEditingBadge({ ...editingBadge, subtitle: e.target.value })}
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="text-xs font-semibold block mb-2">Custom Icon Style</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {Object.keys(ICON_SVGS).map((key) => {
                    const isSelected = editingBadge.icon_key === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setEditingBadge({ ...editingBadge, icon_key: key as TrustBadgeIconKey })}
                        className={`p-2.5 rounded-lg border flex flex-col items-center gap-1.5 transition ${
                          isSelected
                            ? "border-green-600 bg-green-50 text-green-900 font-semibold"
                            : "border-ui-border-base hover:bg-ui-bg-subtle text-ui-fg-muted"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border shadow-xs">
                          {ICON_SVGS[key]}
                        </div>
                        <span className="text-[10px] text-center capitalize leading-tight">
                          {key.replace("-", " ")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom SVG textarea if key is custom */}
              {editingBadge.icon_key === "custom" && (
                <div>
                  <label className="text-xs font-semibold block mb-1">Custom SVG Code</label>
                  <textarea
                    rows={3}
                    placeholder="<svg viewBox='0 0 24 24'>...</svg>"
                    value={editingBadge.custom_icon_svg || ""}
                    onChange={(e) => setEditingBadge({ ...editingBadge, custom_icon_svg: e.target.value })}
                    className="w-full text-xs font-mono p-2 border border-ui-border-base rounded-md"
                  />
                </div>
              )}

              {/* Route Destination */}
              <div>
                <label className="text-xs font-semibold block mb-1">Tap Destination Route</label>
                <Input
                  placeholder="/policies/shipping-policy"
                  value={editingBadge.cta_route || ""}
                  onChange={(e) => setEditingBadge({ ...editingBadge, cta_route: e.target.value })}
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {ROUTE_PRESETS.map((p) => (
                    <button
                      key={p.route}
                      type="button"
                      onClick={() => setEditingBadge({ ...editingBadge, cta_route: p.route })}
                      className="text-[10px] px-2 py-0.5 rounded bg-ui-bg-subtle hover:bg-ui-bg-component text-ui-fg-subtle border border-ui-border-base"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold block mb-1">Display Order</label>
                  <Input
                    type="number"
                    value={editingBadge.display_order ?? 1}
                    onChange={(e) => setEditingBadge({ ...editingBadge, display_order: Number(e.target.value) })}
                  />
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <Switch
                    checked={editingBadge.is_active ?? true}
                    onCheckedChange={(checked) => setEditingBadge({ ...editingBadge, is_active: checked })}
                  />
                  <Text className="text-xs font-semibold">Active on Store</Text>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-ui-border-base">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Badge"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Section Theme & Appearance Settings */}
      {isSettingsOpen && settings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-ui-bg-base border border-ui-border-base rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-ui-border-base pb-3">
              <Heading level="h2" className="text-base font-bold">
                Section Theme &amp; Color Customization
              </Heading>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-ui-fg-muted hover:text-ui-fg-base text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* Botanical Green Presets */}
              <div>
                <label className="text-xs font-semibold block mb-1">Theme Green Presets</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  {THEME_GREEN_PRESETS.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() =>
                        setSettings({
                          ...settings,
                          bg_color: preset.hex,
                          text_color: preset.text,
                          icon_color: preset.hex === "#E8F5E9" ? "#1B4332" : preset.hex,
                        })
                      }
                      className="flex items-center gap-2 p-2 rounded-lg border border-ui-border-base hover:border-ui-border-strong text-left"
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          backgroundColor: preset.hex,
                          border: "1px solid rgba(0,0,0,0.1)",
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">{preset.name}</span>
                        <span className="text-[10px] text-ui-fg-subtle">{preset.hex}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Hex Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Banner Background (Hex)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.bg_color}
                      onChange={(e) => setSettings({ ...settings, bg_color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border"
                    />
                    <Input
                      value={settings.bg_color}
                      onChange={(e) => setSettings({ ...settings, bg_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">Text Color (Hex)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.text_color}
                      onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border"
                    />
                    <Input
                      value={settings.text_color}
                      onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Icon Circle Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.icon_bg_color}
                      onChange={(e) => setSettings({ ...settings, icon_bg_color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border"
                    />
                    <Input
                      value={settings.icon_bg_color}
                      onChange={(e) => setSettings({ ...settings, icon_bg_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">Icon Stroke Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.icon_color}
                      onChange={(e) => setSettings({ ...settings, icon_color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border"
                    />
                    <Input
                      value={settings.icon_color}
                      onChange={(e) => setSettings({ ...settings, icon_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Corner Border Radius (px)</label>
                  <Input
                    type="number"
                    value={settings.border_radius}
                    onChange={(e) => setSettings({ ...settings, border_radius: Number(e.target.value) })}
                  />
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <Switch
                    checked={settings.is_visible}
                    onCheckedChange={(checked) => setSettings({ ...settings, is_visible: checked })}
                  />
                  <Text className="text-xs font-semibold">Section Visible</Text>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-ui-border-base">
                <Button variant="secondary" onClick={() => setIsSettingsOpen(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Settings"}
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
  label: "Trust Guarantees",
  icon: TrustRibbonIcon,
});

export default TrustBadgesAdminPage;

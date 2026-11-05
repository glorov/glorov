import { defineRouteConfig } from "@medusajs/admin-sdk";
import React, { useState, useEffect, useMemo } from "react";
import { adminFetch } from "../../utils/admin-client";
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

export interface AnnouncementItem {
  id: string;
  text: string;
  highlight_text?: string;
  badge_color?: string; // Optional custom inside/badge background color e.g. "#D48B46"
  badge_text_color?: string; // Optional custom badge text & icon color e.g. "#111827" or "#FFFFFF"
  icon?: string;
  link_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementBarConfig {
  is_enabled: boolean;
  speed_seconds: number;
  bg_color: string;
  text_color: string;
  highlight_color: string;
  pause_on_hover: boolean;
  updated_at: string;
}

const THEME_PRESETS = [
  {
    name: "Botanical Forest Green (Glorov Signature)",
    bg: "#1B4332",
    text: "#FFFFFF",
    highlight: "#FFD51F",
  },
  {
    name: "Festive Crimson Wine (Diwali / Festive Sale)",
    bg: "#7A1C2E",
    text: "#FFFFFF",
    highlight: "#FFD51F",
  },
  {
    name: "Midnight Botanical Emerald",
    bg: "#081C15",
    text: "#D8F3DC",
    highlight: "#52B788",
  },
  {
    name: "Harvest Earth Terracotta",
    bg: "#4E342E",
    text: "#FFF8E1",
    highlight: "#FFB300",
  },
];

export const BADGE_COLOR_PRESETS = [
  { name: "Terracotta Orange (Signature)", bg: "#D48B46", text: "#111827" },
  { name: "Golden Honey (Warm Glow)", bg: "#FFD51F", text: "#111827" },
  { name: "Botanical Emerald", bg: "#2D6A4F", text: "#FFFFFF" },
  { name: "Warm Amber", bg: "#EAA22E", text: "#111827" },
  { name: "Festive Crimson Wine", bg: "#7A1C2E", text: "#FFFFFF" },
  { name: "Blossom Coral", bg: "#E07A5F", text: "#FFFFFF" },
  { name: "Oceanic Blue", bg: "#0284C7", text: "#FFFFFF" },
  { name: "Royal Orchid", bg: "#7E22CE", text: "#FFFFFF" },
];

export const getContrastColor = (hex?: string): string => {
  if (!hex) return "#111827";
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 6 && cleanHex.length !== 3) return "#111827";
  const r = parseInt(cleanHex.length === 3 ? cleanHex[0] + cleanHex[0] : cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.length === 3 ? cleanHex[1] + cleanHex[1] : cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.length === 3 ? cleanHex[2] + cleanHex[2] : cleanHex.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 135 ? "#111827" : "#FFFFFF";
};

export const AdminAnnouncementIcon = ({
  icon,
  className = "w-3 h-3 shrink-0",
}: {
  icon?: string;
  className?: string;
}) => {
  switch (icon) {
    case "truck":
    case "local_shipping":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
          />
        </svg>
      );
    case "sprout":
    case "spa":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M12 22v-9m0 0a4 4 0 00-4-4H4a8 8 0 018-8v12zm0 0a4 4 0 014-4h4a8 8 0 00-8-8v12z"
          />
        </svg>
      );
    case "star":
    case "sparkle":
    case "sparkles":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      );
    case "shield":
    case "verified":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      );
    case "bolt":
    case "zap":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      );
    case "percent":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M19 5L5 19M7.5 7.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm9 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
          />
        </svg>
      );
    case "winter":
    case "ac_unit":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14"
          />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      );
  }
};

const MegaphoneIcon = () => (
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
    <path d="M3 11l19-9-9 19-2-8-8-2z" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
  </svg>
);

export const AnnouncementsAdminPage = () => {
  const [configData, setConfigData] = useState<AnnouncementBarConfig>({
    is_enabled: true,
    speed_seconds: 30,
    bg_color: "#1B4332",
    text_color: "#FFFFFF",
    highlight_color: "#FFD51F",
    pause_on_hover: true,
    updated_at: new Date().toISOString(),
  });
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);
  const [formData, setFormData] = useState({
    text: "",
    highlight_text: "",
    badge_color: "#D48B46", // Terracotta orange signature
    badge_text_color: "#111827",
    icon: "local_shipping",
    link_url: "/store",
    display_order: 1,
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch<{ config: AnnouncementBarConfig; items: AnnouncementItem[] }>("/admin/announcements");
      if (!res.ok) throw new Error(res.error || "Failed to load announcements");
      const data = res.data;
      if (data.config) setConfigData(data.config);
      if (Array.isArray(data.items)) setItems(data.items);
    } catch {
      // Fallback defaults
      setItems([
        {
          id: "ann_free_shipping_499",
          text: "Free express botanical delivery on all orders over ₹499",
          highlight_text: "₹499 FREE DELIVERY",
          badge_color: "#D48B46",
          badge_text_color: "#111827",
          icon: "local_shipping",
          link_url: "/store",
          display_order: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "ann_grow_more",
          text: "Grow More. Live Greener. Hand-conditioned plants & pure seeds",
          highlight_text: "GLOROV BOTANICALS",
          badge_color: "#2D6A4F",
          badge_text_color: "#FFFFFF",
          icon: "spa",
          link_url: "/store",
          display_order: 2,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const res = await adminFetch<{ config: AnnouncementBarConfig }>("/admin/announcements/config", {
        method: "PUT",
        body: JSON.stringify(configData),
      });
      if (!res.ok) throw new Error(res.error || "Failed to save configuration");
      if (res.data?.config) setConfigData(res.data.config);
      toast.success("Success", { description: "Announcement bar settings saved." });
    } catch (err: any) {
      toast.error("Error", { description: err.message || "Failed to update announcement bar settings." });
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleToggleItemStatus = async (item: AnnouncementItem) => {
    const updatedStatus = !item.is_active;
    try {
      const res = await adminFetch<{ item: AnnouncementItem }>(`/admin/announcements/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: updatedStatus }),
      });
      if (!res.ok) throw new Error(res.error || "Failed to toggle status");
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_active: updatedStatus } : i))
      );
      toast.success("Updated", {
        description: `Announcement set to ${updatedStatus ? "Active" : "Inactive"}.`,
      });
    } catch (err: any) {
      toast.error("Error", { description: err.message || "Failed to update item status." });
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement item?")) return;
    try {
      const res = await adminFetch(`/admin/announcements/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(res.error || "Failed to delete");
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Deleted", { description: "Announcement removed successfully." });
    } catch (err: any) {
      toast.error("Error", { description: err.message || "Failed to delete announcement." });
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      text: "",
      highlight_text: "",
      badge_color: "#D48B46",
      badge_text_color: "#111827",
      icon: "local_shipping",
      link_url: "/store",
      display_order: items.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: AnnouncementItem) => {
    setEditingItem(item);
    const badgeBg = item.badge_color || configData.highlight_color || "#D48B46";
    setFormData({
      text: item.text,
      highlight_text: item.highlight_text || "",
      badge_color: badgeBg,
      badge_text_color: item.badge_text_color || getContrastColor(badgeBg),
      icon: item.icon || "local_shipping",
      link_url: item.link_url || "/store",
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      toast.error("Validation Error", { description: "Message text is required." });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        const res = await adminFetch<{ item: AnnouncementItem }>(`/admin/announcements/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error(res.error || "Failed to update");
        const updated = res.data;
        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? updated.item : i)).sort((a, b) => a.display_order - b.display_order)
        );
        toast.success("Success", { description: "Announcement updated." });
      } else {
        const res = await adminFetch<{ item: AnnouncementItem }>("/admin/announcements", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error(res.error || "Failed to create");
        const created = res.data;
        setItems((prev) => [...prev, created.item].sort((a, b) => a.display_order - b.display_order));
        toast.success("Success", { description: "Announcement item created." });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error("Error", { description: err.message || "Failed to save announcement." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeItems = useMemo(
    () => items.filter((i) => i.is_active).sort((a, b) => a.display_order - b.display_order),
    [items]
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 font-sans">
      <Toaster />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 border-ui-border-base">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-ui-bg-subtle border border-ui-border-base text-ui-fg-base">
              <MegaphoneIcon />
            </span>
            <Heading level="h1" className="text-2xl font-semibold tracking-tight text-ui-fg-base">
              Announcement Marquee Bar
            </Heading>
          </div>
          <Text className="text-sm text-ui-fg-muted mt-1">
            Configure dynamic auto-scrolling ticker messages, custom badge colors per announcement, and scroll speed.
          </Text>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={fetchAnnouncements} disabled={isLoading}>
            Refresh
          </Button>
          <Button variant="primary" onClick={openCreateModal}>
            + Add Announcement Message
          </Button>
        </div>
      </div>

      {/* Live Marquee Preview Banner */}
      <Container className="p-0 overflow-hidden border border-ui-border-base rounded-xl shadow-sm bg-ui-bg-base">
        <div className="p-4 border-b border-ui-border-base bg-ui-bg-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparkleIcon />
            <Text className="text-xs font-semibold uppercase tracking-wider text-ui-fg-subtle">
              Live Storefront Ticker Preview
            </Text>
          </div>
          <Badge color={configData.is_enabled ? "green" : "grey"} size="small">
            {configData.is_enabled ? "BAR VISIBLE" : "BAR HIDDEN"}
          </Badge>
        </div>

        {configData.is_enabled ? (
          <div
            style={{
              backgroundColor: configData.bg_color,
              color: configData.text_color,
              height: "40px",
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
              position: "relative",
              userSelect: "none",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                whiteSpace: "nowrap",
                alignItems: "center",
                gap: "2.5rem",
                animation: `marquee ${configData.speed_seconds}s linear infinite`,
                transform: "translate3d(0, 0, 0)",
                willChange: "transform",
              }}
            >
              {[...(activeItems.length ? activeItems : items), ...(activeItems.length ? activeItems : items), ...(activeItems.length ? activeItems : items)].map(
                (item, idx) => {
                  const itemBadgeBg = item.badge_color || configData.highlight_color || "#D48B46";
                  const itemBadgeText = item.badge_text_color || getContrastColor(itemBadgeBg);

                  return (
                    <div key={`${item.id}-${idx}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                      {item.highlight_text ? (
                        <span
                          style={{
                            backgroundColor: itemBadgeBg,
                            color: itemBadgeText,
                            padding: "2.5px 7px",
                            borderRadius: "4px",
                            fontWeight: 800,
                            fontSize: "10px",
                            letterSpacing: "0.4px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            textTransform: "uppercase",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                          }}
                        >
                          {item.icon && <AdminAnnouncementIcon icon={item.icon} />}
                          <span>{item.highlight_text}</span>
                        </span>
                      ) : (
                        item.icon && (
                          <span
                            style={{
                              backgroundColor: itemBadgeBg,
                              color: itemBadgeText,
                              width: "20px",
                              height: "20px",
                              borderRadius: "4px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <AdminAnnouncementIcon icon={item.icon} />
                          </span>
                        )
                      )}
                      <span style={{ fontSize: "11.5px", fontWeight: 600, letterSpacing: "0.02em" }}>
                        {item.text}
                      </span>
                      <span style={{ opacity: 0.35, fontSize: "14px" }}>•</span>
                    </div>
                  );
                }
              )}
            </div>
            <style>{`
              @keyframes marquee {
                0% { transform: translate3d(0, 0, 0); }
                100% { transform: translate3d(-50%, 0, 0); }
              }
            `}</style>
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-ui-fg-muted bg-ui-bg-subtle">
            Announcement bar is currently toggled OFF in settings.
          </div>
        )}
      </Container>

      {/* Global Bar Settings */}
      <Container className="p-6 border border-ui-border-base rounded-xl shadow-sm bg-ui-bg-base space-y-6">
        <Heading level="h2" className="text-lg font-medium text-ui-fg-base">
          Global Bar Theme &amp; Speed Settings
        </Heading>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle space-y-3">
            <div className="flex items-center justify-between">
              <Text className="text-sm font-medium text-ui-fg-base">Enable Announcement Bar</Text>
              <Switch
                checked={configData.is_enabled}
                onCheckedChange={(val) => setConfigData({ ...configData, is_enabled: val })}
              />
            </div>
            <Text className="text-xs text-ui-fg-muted">
              Display or hide the top banner across all storefront and Flutter app pages.
            </Text>
          </div>

          <div className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle space-y-3">
            <div className="flex items-center justify-between">
              <Text className="text-sm font-medium text-ui-fg-base">Pause on Hover / Tap</Text>
              <Switch
                checked={configData.pause_on_hover}
                onCheckedChange={(val) => setConfigData({ ...configData, pause_on_hover: val })}
              />
            </div>
            <Text className="text-xs text-ui-fg-muted">
              Pause scrolling when user hovers cursor or touches ticker.
            </Text>
          </div>

          <div className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle space-y-3">
            <Text className="text-sm font-medium text-ui-fg-base">
              Scroll Speed: <span className="font-bold">{configData.speed_seconds}s</span>
            </Text>
            <Input
              type="range"
              min="10"
              max="60"
              step="5"
              value={configData.speed_seconds}
              onChange={(e) =>
                setConfigData({ ...configData, speed_seconds: Number(e.target.value) })
              }
            />
            <div className="flex justify-between text-[11px] text-ui-fg-muted">
              <span>Faster (10s)</span>
              <span>Smooth (30s)</span>
              <span>Slower (60s)</span>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle space-y-3">
            <Text className="text-sm font-medium text-ui-fg-base">Global Theme Presets</Text>
            <div className="flex flex-wrap gap-2">
              {THEME_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() =>
                    setConfigData({
                      ...configData,
                      bg_color: p.bg,
                      text_color: p.text,
                      highlight_color: p.highlight,
                    })
                  }
                  title={p.name}
                  className="w-7 h-7 rounded-full border border-ui-border-base transition hover:scale-110 shadow-sm"
                  style={{ backgroundColor: p.bg }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Custom Color Codes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-ui-border-base">
          <div>
            <label className="text-xs font-medium text-ui-fg-subtle mb-1 block">Bar Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={configData.bg_color}
                onChange={(e) => setConfigData({ ...configData, bg_color: e.target.value })}
                className="w-9 h-9 p-0 rounded border cursor-pointer shrink-0"
              />
              <Input
                value={configData.bg_color}
                onChange={(e) => setConfigData({ ...configData, bg_color: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ui-fg-subtle mb-1 block">Ticker Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={configData.text_color}
                onChange={(e) => setConfigData({ ...configData, text_color: e.target.value })}
                className="w-9 h-9 p-0 rounded border cursor-pointer shrink-0"
              />
              <Input
                value={configData.text_color}
                onChange={(e) => setConfigData({ ...configData, text_color: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ui-fg-subtle mb-1 block">Default Fallback Badge Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={configData.highlight_color}
                onChange={(e) => setConfigData({ ...configData, highlight_color: e.target.value })}
                className="w-9 h-9 p-0 rounded border cursor-pointer shrink-0"
              />
              <Input
                value={configData.highlight_color}
                onChange={(e) => setConfigData({ ...configData, highlight_color: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={handleSaveConfig} disabled={isSavingConfig}>
            {isSavingConfig ? "Saving..." : "Save Global Bar Settings"}
          </Button>
        </div>
      </Container>

      {/* Announcements Table */}
      <Container className="p-6 border border-ui-border-base rounded-xl shadow-sm bg-ui-bg-base space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h2" className="text-lg font-medium text-ui-fg-base">
              Announcement Messages ({items.length})
            </Heading>
            <Text className="text-xs text-ui-fg-muted mt-0.5">
              Each message can have its own custom inside badge color and embedded icon.
            </Text>
          </div>
          <Button variant="secondary" size="small" onClick={openCreateModal}>
            + Add New
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell className="w-16">Order</Table.HeaderCell>
                <Table.HeaderCell className="w-56">Highlight Badge &amp; Inside Color</Table.HeaderCell>
                <Table.HeaderCell>Message Text</Table.HeaderCell>
                <Table.HeaderCell className="w-32">Link URL</Table.HeaderCell>
                <Table.HeaderCell className="w-24">Status</Table.HeaderCell>
                <Table.HeaderCell className="w-36 text-right">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {items.length === 0 ? (
                <Table.Row>
                  <Table.Cell className="text-center py-6 text-ui-fg-muted" colSpan={6}>
                    No announcement messages configured. Click &quot;+ Add Announcement Message&quot; above.
                  </Table.Cell>
                </Table.Row>
              ) : (
                items.map((item) => {
                  const badgeBg = item.badge_color || configData.highlight_color || "#D48B46";
                  const badgeText = item.badge_text_color || getContrastColor(badgeBg);

                  return (
                    <Table.Row key={item.id}>
                      <Table.Cell className="font-mono text-xs">{item.display_order}</Table.Cell>
                      <Table.Cell>
                        {item.highlight_text ? (
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10.5px] font-extrabold uppercase shadow-sm"
                              style={{
                                backgroundColor: badgeBg,
                                color: badgeText,
                              }}
                            >
                              {item.icon && <AdminAnnouncementIcon icon={item.icon} />}
                              <span>{item.highlight_text}</span>
                            </span>
                            <span className="font-mono text-[10px] text-ui-fg-muted">
                              {badgeBg}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {item.icon && (
                              <span
                                className="w-6 h-6 rounded flex items-center justify-center text-xs"
                                style={{
                                  backgroundColor: badgeBg,
                                  color: badgeText,
                                }}
                              >
                                <AdminAnnouncementIcon icon={item.icon} />
                              </span>
                            )}
                            <span className="text-ui-fg-muted text-xs">—</span>
                          </div>
                        )}
                      </Table.Cell>
                      <Table.Cell className="font-medium text-ui-fg-base">{item.text}</Table.Cell>
                      <Table.Cell className="text-xs text-ui-fg-muted font-mono">{item.link_url || "/"}</Table.Cell>
                      <Table.Cell>
                        <Switch
                          checked={item.is_active}
                          onCheckedChange={() => handleToggleItemStatus(item)}
                        />
                      </Table.Cell>
                      <Table.Cell className="text-right space-x-2">
                        <Button variant="secondary" size="small" onClick={() => openEditModal(item)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="small" onClick={() => handleDeleteItem(item.id)}>
                          Delete
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              )}
            </Table.Body>
          </Table>
        </div>
      </Container>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-ui-bg-base border border-ui-border-base rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b pb-3 border-ui-border-base">
              <div>
                <Heading level="h2" className="text-lg font-semibold text-ui-fg-base">
                  {editingItem ? "Edit Announcement Message" : "Add Announcement Message"}
                </Heading>
                <Text className="text-xs text-ui-fg-muted mt-0.5">
                  Customize the message, highlight text, embedded icon, and inside badge color.
                </Text>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-ui-fg-muted hover:text-ui-fg-base text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ui-fg-subtle mb-1 block">
                  Message Text *
                </label>
                <Input
                  required
                  placeholder="e.g. Free express botanical delivery on all orders over ₹499"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ui-fg-subtle mb-1 block">
                  Highlight Badge Text (Inside Pill)
                </label>
                <Input
                  placeholder="e.g. ₹499 FREE DELIVERY or 98% GERMINATION"
                  value={formData.highlight_text}
                  onChange={(e) => setFormData({ ...formData, highlight_text: e.target.value })}
                />
              </div>

              {/* Inside Badge Color Control */}
              <div className="p-3.5 rounded-lg border border-ui-border-base bg-ui-bg-subtle space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-ui-fg-subtle">
                      Inside Badge Color (Background)
                    </label>
                    <span className="text-[11px] font-mono text-ui-fg-muted">{formData.badge_color}</span>
                  </div>

                  {/* Preset Swatches */}
                  <div className="flex flex-wrap gap-2 mb-2.5">
                    {BADGE_COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            badge_color: preset.bg,
                            badge_text_color: preset.text,
                          })
                        }
                        title={preset.name}
                        className={`w-7 h-7 rounded-md border transition-all flex items-center justify-center ${
                          formData.badge_color.toLowerCase() === preset.bg.toLowerCase()
                            ? "ring-2 ring-ui-border-interactive scale-110 shadow-sm"
                            : "border-ui-border-base hover:scale-105 opacity-90 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: preset.bg }}
                      >
                        {formData.badge_color.toLowerCase() === preset.bg.toLowerCase() && (
                          <span style={{ color: preset.text }} className="text-[10px] font-bold">✓</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom Color Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.badge_color}
                      onChange={(e) => {
                        const newBg = e.target.value;
                        setFormData({
                          ...formData,
                          badge_color: newBg,
                          badge_text_color: getContrastColor(newBg),
                        });
                      }}
                      className="w-8 h-8 p-0 rounded border cursor-pointer shrink-0"
                    />
                    <Input
                      placeholder="#D48B46"
                      value={formData.badge_color}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          badge_color: val,
                          badge_text_color: getContrastColor(val),
                        });
                      }}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Badge Text & Icon Color */}
                <div className="pt-2 border-t border-ui-border-base flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ui-fg-subtle">
                    Icon &amp; Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, badge_text_color: "#111827" })}
                      className={`px-2.5 py-1 text-xs rounded border transition ${
                        formData.badge_text_color === "#111827"
                          ? "bg-stone-900 text-white font-bold border-stone-900"
                          : "bg-white text-stone-900 border-ui-border-base"
                      }`}
                    >
                      Dark (#111827)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, badge_text_color: "#FFFFFF" })}
                      className={`px-2.5 py-1 text-xs rounded border transition ${
                        formData.badge_text_color === "#FFFFFF"
                          ? "bg-white text-stone-900 font-bold border-stone-900 ring-1 ring-stone-900"
                          : "bg-stone-100 text-stone-700 border-ui-border-base"
                      }`}
                    >
                      Light (#FFFFFF)
                    </button>
                    <input
                      type="color"
                      value={formData.badge_text_color}
                      onChange={(e) => setFormData({ ...formData, badge_text_color: e.target.value })}
                      className="w-7 h-7 p-0 rounded border cursor-pointer shrink-0"
                      title="Custom text/icon color"
                    />
                  </div>
                </div>
              </div>

              {/* Icon & Display Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ui-fg-subtle mb-1 block">
                    Inside Icon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full h-10 px-3 text-sm bg-ui-bg-field border border-ui-border-base rounded-md"
                  >
                    <option value="local_shipping">🚚 Shipping Truck (local_shipping)</option>
                    <option value="spa">🌱 Sprout / Plant (spa)</option>
                    <option value="star">✨ Sparkles / Star (star)</option>
                    <option value="bolt">⚡ Flash / Thunder (bolt)</option>
                    <option value="percent">% Discount (percent)</option>
                    <option value="verified">🛡️ Verified Organic (verified)</option>
                    <option value="shield">🔒 Trust &amp; Shield (shield)</option>
                    <option value="ac_unit">❄️ Winter / Snowflake (ac_unit)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ui-fg-subtle mb-1 block">
                    Display Order
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ui-fg-subtle mb-1 block">
                  Storefront Link URL
                </label>
                <Input
                  placeholder="e.g. /store or /categories/seeds"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                />
              </div>

              {/* Real-time Preview Inside Modal */}
              <div className="p-3.5 rounded-lg border border-ui-border-base bg-[#1E392A] text-white flex flex-col gap-1.5 shadow-inner">
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/60">
                  Live Preview in Storefront Bar
                </span>
                <div className="flex items-center gap-2 overflow-hidden">
                  {formData.highlight_text ? (
                    <span
                      style={{
                        backgroundColor: formData.badge_color,
                        color: formData.badge_text_color,
                        padding: "2.5px 7px",
                        borderRadius: "4px",
                        fontWeight: 800,
                        fontSize: "10px",
                        letterSpacing: "0.4px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        textTransform: "uppercase",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                        flexShrink: 0,
                      }}
                    >
                      {formData.icon && <AdminAnnouncementIcon icon={formData.icon} />}
                      <span>{formData.highlight_text}</span>
                    </span>
                  ) : null}
                  <span className="text-[11.5px] font-semibold text-white truncate">
                    {formData.text || "Announcement message text will appear here..."}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(val) => setFormData({ ...formData, is_active: val })}
                />
                <Text className="text-sm text-ui-fg-base">Active on storefront marquee ticker</Text>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-ui-border-base">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Message"}
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
  label: "Announcement Bar",
  icon: MegaphoneIcon,
});

export default AnnouncementsAdminPage;

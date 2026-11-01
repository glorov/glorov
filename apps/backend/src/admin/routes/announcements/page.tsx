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
      icon: "local_shipping",
      link_url: "/store",
      display_order: items.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: AnnouncementItem) => {
    setEditingItem(item);
    setFormData({
      text: item.text,
      highlight_text: item.highlight_text || "",
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
            Configure dynamic auto-scrolling ticker messages, scroll speed, theme colors, and delivery thresholds.
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
              }}
            >
              {[...(activeItems.length ? activeItems : items), ...(activeItems.length ? activeItems : items), ...(activeItems.length ? activeItems : items)].map(
                (item, idx) => (
                  <div key={`${item.id}-${idx}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                    {item.highlight_text && (
                      <span
                        style={{
                          backgroundColor: configData.highlight_color,
                          color: "#111827",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          fontWeight: 800,
                          fontSize: "10.5px",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {item.highlight_text}
                      </span>
                    )}
                    <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.02em" }}>
                      {item.text}
                    </span>
                    <span style={{ opacity: 0.4, fontSize: "14px" }}>•</span>
                  </div>
                )
              )}
            </div>
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
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
          Bar Display &amp; Speed Settings
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
            <Text className="text-sm font-medium text-ui-fg-base">Theme Quick Presets</Text>
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
            <label className="text-xs font-medium text-ui-fg-subtle mb-1 block">Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={configData.bg_color}
                onChange={(e) => setConfigData({ ...configData, bg_color: e.target.value })}
                className="w-9 h-9 p-0 rounded border cursor-pointer"
              />
              <Input
                value={configData.bg_color}
                onChange={(e) => setConfigData({ ...configData, bg_color: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ui-fg-subtle mb-1 block">Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={configData.text_color}
                onChange={(e) => setConfigData({ ...configData, text_color: e.target.value })}
                className="w-9 h-9 p-0 rounded border cursor-pointer"
              />
              <Input
                value={configData.text_color}
                onChange={(e) => setConfigData({ ...configData, text_color: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ui-fg-subtle mb-1 block">Highlight Badge Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={configData.highlight_color}
                onChange={(e) => setConfigData({ ...configData, highlight_color: e.target.value })}
                className="w-9 h-9 p-0 rounded border cursor-pointer"
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
            {isSavingConfig ? "Saving..." : "Save Bar Settings"}
          </Button>
        </div>
      </Container>

      {/* Announcements Table */}
      <Container className="p-6 border border-ui-border-base rounded-xl shadow-sm bg-ui-bg-base space-y-4">
        <div className="flex items-center justify-between">
          <Heading level="h2" className="text-lg font-medium text-ui-fg-base">
            Announcement Messages ({items.length})
          </Heading>
          <Text className="text-xs text-ui-fg-muted">
            Messages scroll continuously in order from lowest to highest display order.
          </Text>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell className="w-16">Order</Table.HeaderCell>
                <Table.HeaderCell className="w-36">Highlight Badge</Table.HeaderCell>
                <Table.HeaderCell>Message Text</Table.HeaderCell>
                <Table.HeaderCell className="w-28">Link URL</Table.HeaderCell>
                <Table.HeaderCell className="w-24">Status</Table.HeaderCell>
                <Table.HeaderCell className="w-36 text-right">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {items.length === 0 ? (
                <Table.Row>
                  <Table.Cell className="text-center py-6 text-ui-fg-muted">
                    No announcement messages configured. Click &quot;+ Add Announcement Message&quot; above.
                  </Table.Cell>
                </Table.Row>
              ) : (
                items.map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell className="font-mono text-xs">{item.display_order}</Table.Cell>
                    <Table.Cell>
                      {item.highlight_text ? (
                        <Badge color="orange" size="small">
                          {item.highlight_text}
                        </Badge>
                      ) : (
                        <span className="text-ui-fg-muted text-xs">—</span>
                      )}
                    </Table.Cell>
                    <Table.Cell className="font-medium text-ui-fg-base">{item.text}</Table.Cell>
                    <Table.Cell className="text-xs text-ui-fg-muted">{item.link_url || "/"}</Table.Cell>
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
                ))
              )}
            </Table.Body>
          </Table>
        </div>
      </Container>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-ui-bg-base border border-ui-border-base rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-ui-border-base">
              <Heading level="h2" className="text-lg font-semibold text-ui-fg-base">
                {editingItem ? "Edit Announcement Message" : "Add Announcement Message"}
              </Heading>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-ui-fg-muted hover:text-ui-fg-base text-lg font-bold"
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
                  Highlight Badge Text (Optional)
                </label>
                <Input
                  placeholder="e.g. ₹499 FREE DELIVERY or 10% OFF"
                  value={formData.highlight_text}
                  onChange={(e) => setFormData({ ...formData, highlight_text: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ui-fg-subtle mb-1 block">
                    Icon Role
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full h-10 px-3 text-sm bg-ui-bg-field border border-ui-border-base rounded-md"
                  >
                    <option value="local_shipping">Shipping Truck (local_shipping)</option>
                    <option value="spa">Sprout / Plant (spa)</option>
                    <option value="bolt">Flash / Thunder (bolt)</option>
                    <option value="percent">Discount % (percent)</option>
                    <option value="verified">Verified Organic (verified)</option>
                    <option value="shield">Trust &amp; Shield (shield)</option>
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
                  placeholder="e.g. /store or /store?category=seeds"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
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

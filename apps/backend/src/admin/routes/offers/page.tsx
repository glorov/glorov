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
  usePrompt,
} from "@medusajs/ui";

export interface Offer {
  id: string;
  code: string;
  title: string;
  tag: string;
  description: string;
  discount_badge: string;
  discount_type: "percentage" | "fixed" | "free_shipping";
  discount_value: number;
  min_spend?: number;
  min_spend_text?: string;
  expiry_text?: string;
  category: "welcome" | "sitewide" | "seeds" | "plants" | "bank";
  bg_color?: string;
  text_color?: string;
  accent_color?: string;
  icon: "card_giftcard" | "local_offer" | "percent" | "spa" | "local_shipping" | "auto_awesome";
  is_highlighted: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const THEME_PRESETS = [
  {
    name: "Mint & Forest (Original)",
    bg: "#EAF4EE",
    text: "#1B3B2B",
    accent: "#1E3D2F",
  },
  {
    name: "Deep Forest Emerald",
    bg: "#E8F5E9",
    text: "#1B3B2B",
    accent: "#2E7D32",
  },
  {
    name: "Harvest Gold & Sunshine",
    bg: "#FFF8E1",
    text: "#5D4037",
    accent: "#F57F17",
  },
  {
    name: "Sky Courier Blue",
    bg: "#E1F5FE",
    text: "#01579B",
    accent: "#0288D1",
  },
  {
    name: "Botanical Terracotta",
    bg: "#FBE9E7",
    text: "#4E342E",
    accent: "#D84315",
  },
];

const TagIcon = () => (
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
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const GiftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
  </svg>
);

const SpaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 21l7.03-3.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9Z" />
    <path d="M12 10v6" />
    <path d="M9 13l3 3 3-3" />
  </svg>
);

const TruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const PercentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

function renderIcon(icon: string) {
  switch (icon) {
    case "card_giftcard":
      return <GiftIcon />;
    case "auto_awesome":
      return <SparkleIcon />;
    case "spa":
      return <SpaIcon />;
    case "local_shipping":
      return <TruckIcon />;
    case "percent":
    default:
      return <PercentIcon />;
  }
}

const OffersAdminPage = () => {
  const prompt = usePrompt();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [previewOfferId, setPreviewOfferId] = useState<string | null>(null);
  const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await adminFetch<any>("/admin/offers");
      if (res.ok) {
        const data = res.data;
        setOffers(data.offers || []);
        if (data.highlighted_offer && data.highlighted_offer.is_active) {
          setPreviewOfferId(data.highlighted_offer.id);
        } else {
          setPreviewOfferId(null);
        }
      } else {
        toast.error("Error", { description: res.error || "Failed to load offers from backend API." });
      }
    } catch {
      toast.error("Connection Error", { description: "Could not reach /admin/offers endpoint." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const activeOffers = useMemo(() => offers.filter((o) => o.is_active), [offers]);

  // Find preview offer or fallback
  const previewOffer = useMemo(() => {
    if (previewOfferId) {
      const found = offers.find((o) => o.id === previewOfferId);
      if (found) return found;
    }
    const highlighted = offers.find((o) => o.is_highlighted && o.is_active);
    if (highlighted) return highlighted;
    return null;
  }, [offers, previewOfferId]);

  // Handle active status toggle
  const handleToggleActive = async (offer: Offer) => {
    try {
      const willBeActive = !offer.is_active;
      const res = await adminFetch<any>(`/admin/offers/${offer.id}`, {
        method: "POST",
        body: {
          is_active: willBeActive,
          // When deactivating, ensure is_highlighted is cleared so inactive offers cannot be featured
          is_highlighted: willBeActive ? offer.is_highlighted : false,
        },
      });
      if (res.ok) {
        await fetchOffers();
        toast.success("Updated", {
          description: `Offer ${offer.code} is now ${willBeActive ? "Active" : "Inactive"}.`,
        });
      } else {
        toast.error("Error", { description: res.error || "Failed to update offer status." });
      }
    } catch {
      toast.error("Network Error", { description: "Could not update offer status." });
    }
  };

  // Handle highlighted toggle (featured on homepage welcome section)
  const handleToggleHighlighted = async (offer: Offer) => {
    try {
      const willBeHighlighted = !offer.is_highlighted;
      // An offer must be active to be featured as a banner
      const willBeActive = willBeHighlighted ? true : offer.is_active;

      const res = await adminFetch<any>(`/admin/offers/${offer.id}`, {
        method: "POST",
        body: {
          is_highlighted: willBeHighlighted,
          is_active: willBeActive,
        },
      });
      if (res.ok) {
        await fetchOffers();
        toast.success("Featured Offer Updated", {
          description: willBeHighlighted
            ? `Offer ${offer.code} is now set as the Homepage Welcome Banner.`
            : `Offer ${offer.code} removed from Homepage Welcome Banner.`,
        });
      } else {
        toast.error("Error", { description: res.error || "Failed to update featured offer." });
      }
    } catch {
      toast.error("Network Error", { description: "Could not update featured offer." });
    }
  };

  // Handle delete offer
  const handleDeleteOffer = async (id: string, code: string) => {
    const userConfirmed = await prompt({
      title: "Delete Promotional Offer",
      description: `Are you sure you want to delete promotional offer '${code}'?`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!userConfirmed) {
      return;
    }
    try {
      const res = await adminFetch<any>(`/admin/offers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setOffers((prev) => prev.filter((o) => o.id !== id));
        toast.success("Deleted", { description: `Offer ${code} has been deleted.` });
      } else {
        toast.error("Error", { description: res.error || "Failed to delete offer." });
      }
    } catch {
      toast.error("Network Error", { description: "Could not delete offer." });
    }
  };

  // Handle seed defaults
  const handleSeedDefaults = async () => {
    const userConfirmed = await prompt({
      title: "Restore Default Campaigns",
      description: "Restore default botanical campaigns? This will reset all promotional offers.",
      confirmText: "Restore Defaults",
      cancelText: "Cancel",
    });
    if (!userConfirmed) {
      return;
    }
    try {
      setLoading(true);
      const res = await adminFetch<any>("/admin/offers/seed", { method: "POST" });
      if (res.ok) {
        const data = res.data;
        setOffers(data.offers || []);
        toast.success("Restored", { description: "Default promotional offers restored." });
      } else {
        toast.error("Error", { description: res.error || "Could not seed default offers." });
      }
    } catch {
      toast.error("Error", { description: "Could not seed default offers." });
    } finally {
      setLoading(false);
    }
  };

  // Save new or edited offer
  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;

    if (!editingOffer.code || !editingOffer.title || !editingOffer.description) {
      toast.error("Validation Error", { description: "Code, Title, and Description are required." });
      return;
    }

    try {
      setIsSubmitting(true);
      const isEdit = Boolean(editingOffer.id);
      const url = isEdit ? `/admin/offers/${editingOffer.id}` : "/admin/offers";

      const res = await adminFetch<any>(url, {
        method: "POST",
        body: editingOffer,
      });

      if (res.ok) {
        const data = res.data;
        toast.success(isEdit ? "Offer Updated" : "Offer Created", {
          description: `Offer ${data.offer.code} saved successfully.`,
        });
        setIsModalOpen(false);
        setEditingOffer(null);
        await fetchOffers();
      } else {
        toast.error("Save Failed", { description: res.error || "Failed to save offer." });
      }
    } catch {
      toast.error("Network Error", { description: "Failed to save offer." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setEditingOffer({
      code: "",
      title: "",
      tag: "SPECIAL WELCOME OFFER",
      description: "",
      discount_badge: "10% OFF",
      discount_type: "percentage",
      discount_value: 10,
      min_spend: 499,
      min_spend_text: "Min Order: ₹499",
      expiry_text: "Valid on botanical orders",
      category: "welcome",
      bg_color: "#EAF4EE",
      text_color: "#1B3B2B",
      accent_color: "#1E3D2F",
      icon: "card_giftcard",
      is_highlighted: offers.length === 0,
      is_active: true,
      display_order: offers.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (offer: Offer) => {
    setEditingOffer({ ...offer });
    setIsModalOpen(true);
  };

  const handleSimulateCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="flex flex-col gap-y-6 p-6 max-w-7xl mx-auto">
      <Toaster />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-ui-border-base">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              %
            </div>
            <Heading level="h1" className="text-2xl font-bold tracking-tight text-ui-fg-base">
              Offer Section &amp; Promo Control
            </Heading>
          </div>
          <Text className="text-ui-fg-subtle text-sm mt-1">
            Dynamic control for the homepage promotional offer banner, coupon codes, and discount thresholds.
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleSeedDefaults} disabled={loading}>
            Restore Defaults
          </Button>
          <Button variant="primary" onClick={openCreateModal}>
            + Create New Offer
          </Button>
        </div>
      </div>

      {/* Live Storefront Visual Preview (The Exact Screenshot Design) */}
      <Container className="p-6 bg-ui-bg-subtle border border-ui-border-base rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-ui-border-base">
          <div>
            <div className="flex items-center gap-2">
              <Heading level="h2" className="text-base font-semibold">
                Storefront Live Offer Card Preview
              </Heading>
              {previewOffer?.is_highlighted && (
                <Badge color="green" size="small">
                  ★ Primary Homepage Banner
                </Badge>
              )}
              {previewOffer?.is_active ? (
                <Badge color="green" size="small">
                  Live on Storefront
                </Badge>
              ) : (
                <Badge color="grey" size="small">
                  Inactive / Hidden
                </Badge>
              )}
            </div>
            <Text className="text-xs text-ui-fg-muted mt-0.5">
              Matches the exact botanical offer banner seen on the homepage and mobile app.
            </Text>
          </div>

          <div className="flex items-center gap-2">
            <Text className="text-xs font-medium text-ui-fg-subtle">Previewing:</Text>
            <select
              value={previewOfferId || ""}
              onChange={(e) => setPreviewOfferId(e.target.value)}
              className="text-xs bg-ui-bg-base border border-ui-border-base rounded-md px-2 py-1 text-ui-fg-base"
            >
              {offers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.code} — {o.title} {o.is_highlighted ? "(★ Welcome)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* The Card Rendered Exactly Like the Screenshot */}
        {previewOffer ? (
          <div className="p-4 sm:p-6 bg-white rounded-xl border border-ui-border-base shadow-sm">
            <div
              style={{
                backgroundColor: previewOffer.bg_color || "#EAF4EE",
                borderColor: `${previewOffer.accent_color || "#1E3D2F"}33`,
              }}
              className="w-full rounded-2xl p-5 sm:p-6 border transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Circular Icon (Matches Screenshot Circle & Icon) */}
                  <div
                    style={{
                      backgroundColor: previewOffer.accent_color || "#1E3D2F",
                      color: "#FFFFFF",
                    }}
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                  >
                    {renderIcon(previewOffer.icon)}
                  </div>

                  {/* Text Details */}
                  <div className="flex flex-col">
                    <span
                      style={{
                        color: previewOffer.accent_color || "#1E3D2F",
                        fontFamily: "Inter, sans-serif",
                      }}
                      className="text-xs font-bold tracking-wider uppercase"
                    >
                      {previewOffer.tag || "SPECIAL WELCOME OFFER"}
                    </span>
                    <p
                      style={{
                        color: previewOffer.text_color || "#1B3B2B",
                        fontFamily: "Inter, sans-serif",
                      }}
                      className="text-sm sm:text-base font-semibold mt-0.5 leading-snug"
                    >
                      {previewOffer.description}
                    </p>
                  </div>
                </div>

                {/* Right Interactive Coupon Code Pill & Copy Button */}
                <div className="flex items-center gap-2 self-start sm:self-center pl-16 sm:pl-0">
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs border border-emerald-900/15 rounded-xl px-3 py-1.5 shadow-2xs">
                    <span className="font-mono font-bold text-xs sm:text-sm tracking-wider text-emerald-900">
                      {previewOffer.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSimulateCopy(previewOffer.code)}
                      className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-900 text-white hover:bg-emerald-800 transition-colors"
                    >
                      {copiedCode === previewOffer.code ? "COPIED! ✓" : "Copy"}
                    </button>
                  </div>

                  <span className="text-xs font-medium text-emerald-900/70 bg-emerald-900/10 px-2.5 py-1 rounded-lg">
                    {previewOffer.discount_badge}
                  </span>
                </div>
              </div>

              {/* Extra micro-details */}
              <div className="mt-3 pt-3 border-t border-emerald-900/10 flex flex-wrap items-center gap-4 text-xs text-emerald-950/70">
                {previewOffer.min_spend_text && <span>• {previewOffer.min_spend_text}</span>}
                {previewOffer.expiry_text && <span>• {previewOffer.expiry_text}</span>}
                <span>• Category: {previewOffer.category}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-ui-fg-muted text-sm bg-ui-bg-subtle/50 rounded-xl border border-dashed border-ui-border-base p-6">
            <p className="font-medium text-ui-fg-base mb-1">No Active Homepage Banner Selected</p>
            <p className="text-xs text-ui-fg-subtle">
              Click &quot;Set Banner&quot; on any active offer in the table below to feature it on the storefront homepage.
            </p>
          </div>
        )}
      </Container>

      {/* Offers Management Table */}
      <Container className="p-0 overflow-hidden border border-ui-border-base rounded-xl">
        <div className="p-4 flex items-center justify-between border-b border-ui-border-base bg-ui-bg-subtle">
          <div>
            <Heading level="h2" className="text-base font-semibold">
              All Configured Offers ({offers.length})
            </Heading>
            <Text className="text-xs text-ui-fg-muted">
              {activeOffers.length} active on storefront • {offers.filter((o) => o.is_highlighted && o.is_active).length} featured homepage banner
            </Text>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell className="w-16">Active</Table.HeaderCell>
                <Table.HeaderCell className="w-24">Banner</Table.HeaderCell>
                <Table.HeaderCell>Code</Table.HeaderCell>
                <Table.HeaderCell>Tag / Eyebrow</Table.HeaderCell>
                <Table.HeaderCell>Description</Table.HeaderCell>
                <Table.HeaderCell>Discount</Table.HeaderCell>
                <Table.HeaderCell>Min Spend</Table.HeaderCell>
                <Table.HeaderCell>Order</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {offers.map((offer) => (
                <Table.Row key={offer.id} className="hover:bg-ui-bg-subtle/50 transition-colors">
                  {/* Active Switch */}
                  <Table.Cell>
                    <Switch
                      checked={offer.is_active}
                      onCheckedChange={() => handleToggleActive(offer)}
                    />
                  </Table.Cell>

                  {/* Featured Welcome Banner */}
                  <Table.Cell>
                    <button
                      type="button"
                      onClick={() => handleToggleHighlighted(offer)}
                      className={`text-xs px-2 py-0.5 rounded-md font-medium transition-colors ${
                        offer.is_highlighted
                          ? "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
                          : "bg-ui-bg-base text-ui-fg-muted hover:bg-ui-bg-subtle border border-ui-border-base"
                      }`}
                      title={
                        offer.is_highlighted
                          ? "Currently featured as primary Homepage Welcome Banner"
                          : "Click to set as primary Homepage Welcome Banner"
                      }
                    >
                      {offer.is_highlighted ? "★ Featured" : "Set Banner"}
                    </button>
                  </Table.Cell>

                  {/* Code */}
                  <Table.Cell>
                    <span className="font-mono font-bold text-xs bg-ui-bg-base px-2 py-1 rounded border border-ui-border-base">
                      {offer.code}
                    </span>
                  </Table.Cell>

                  {/* Tag */}
                  <Table.Cell>
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {offer.tag}
                    </span>
                  </Table.Cell>

                  {/* Description */}
                  <Table.Cell className="max-w-xs truncate text-xs text-ui-fg-subtle">
                    {offer.description}
                  </Table.Cell>

                  {/* Discount */}
                  <Table.Cell>
                    <Badge color="green" size="small">
                      {offer.discount_badge}
                    </Badge>
                  </Table.Cell>

                  {/* Min Spend */}
                  <Table.Cell className="text-xs text-ui-fg-subtle">
                    {offer.min_spend_text || `₹${offer.min_spend || 0}`}
                  </Table.Cell>

                  {/* Order */}
                  <Table.Cell className="text-xs font-medium text-ui-fg-muted">
                    #{offer.display_order}
                  </Table.Cell>

                  {/* Actions */}
                  <Table.Cell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => setPreviewOfferId(offer.id)}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => openEditModal(offer)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleDeleteOffer(offer.id, offer.code)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </Container>

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && editingOffer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-ui-bg-base border border-ui-border-base rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-ui-border-base">
              <div>
                <Heading level="h2" className="text-lg font-bold">
                  {editingOffer.id ? `Edit Offer (${editingOffer.code})` : "Create New Promotional Offer"}
                </Heading>
                <Text className="text-xs text-ui-fg-subtle">
                  Configure promo code, badge, copy text, thresholds, and card color scheme.
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

            <form onSubmit={handleSaveOffer} className="space-y-5 pt-4">
              {/* Live Mini Preview inside modal */}
              <div
                style={{
                  backgroundColor: editingOffer.bg_color || "#EAF4EE",
                  borderColor: `${editingOffer.accent_color || "#1E3D2F"}33`,
                }}
                className="p-4 rounded-xl border flex items-center gap-3 transition-colors"
              >
                <div
                  style={{
                    backgroundColor: editingOffer.accent_color || "#1E3D2F",
                    color: "#FFFFFF",
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                >
                  {renderIcon(editingOffer.icon || "card_giftcard")}
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    style={{ color: editingOffer.accent_color || "#1E3D2F" }}
                    className="text-[10px] font-bold tracking-wider uppercase block"
                  >
                    {editingOffer.tag || "OFFER EYEBROW"}
                  </span>
                  <p
                    style={{ color: editingOffer.text_color || "#1B3B2B" }}
                    className="text-xs font-semibold truncate"
                  >
                    {editingOffer.description || "Enter description below..."}
                  </p>
                </div>
                <div className="font-mono text-xs font-bold bg-white/80 px-2 py-1 rounded border border-emerald-900/10">
                  {editingOffer.code || "CODE"}
                </div>
              </div>

              {/* Code & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-ui-fg-base block mb-1">
                    Coupon Code *
                  </label>
                  <Input
                    placeholder="e.g. GLOROV10"
                    value={editingOffer.code || ""}
                    onChange={(e) =>
                      setEditingOffer({ ...editingOffer, code: e.target.value.toUpperCase() })
                    }
                    required
                  />
                  <span className="text-[10px] text-ui-fg-muted">Auto-capitalized for customers.</span>
                </div>

                <div>
                  <label className="text-xs font-medium text-ui-fg-base block mb-1">
                    Internal Offer Title *
                  </label>
                  <Input
                    placeholder="e.g. Special Welcome Offer"
                    value={editingOffer.title || ""}
                    onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Eyebrow Tag & Discount Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-ui-fg-base block mb-1">
                    Eyebrow / Badge Text (Top Line)
                  </label>
                  <Input
                    placeholder="e.g. SPECIAL WELCOME OFFER"
                    value={editingOffer.tag || ""}
                    onChange={(e) => setEditingOffer({ ...editingOffer, tag: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-ui-fg-base block mb-1">
                    Discount Badge Tag
                  </label>
                  <Input
                    placeholder="e.g. 10% OFF or ₹100 OFF"
                    value={editingOffer.discount_badge || ""}
                    onChange={(e) =>
                      setEditingOffer({ ...editingOffer, discount_badge: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Main Headline Description */}
              <div>
                <label className="text-xs font-medium text-ui-fg-base block mb-1">
                  Full Headline / Banner Description *
                </label>
                <textarea
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-ui-border-base bg-ui-bg-base text-ui-fg-base focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
                  placeholder="e.g. Use code GLOROV10 at checkout for an extra 10% off your entire botanical order."
                  value={editingOffer.description || ""}
                  onChange={(e) =>
                    setEditingOffer({ ...editingOffer, description: e.target.value })
                  }
                  required
                />
              </div>

              {/* Discount Type, Value, Min Spend */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-ui-fg-base block mb-1">
                    Discount Type
                  </label>
                  <select
                    className="w-full text-xs p-2 rounded-lg border border-ui-border-base bg-ui-bg-base text-ui-fg-base"
                    value={editingOffer.discount_type || "percentage"}
                    onChange={(e) =>
                      setEditingOffer({
                        ...editingOffer,
                        discount_type: e.target.value as any,
                      })
                    }
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-ui-fg-base block mb-1">
                    Discount Value
                  </label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={editingOffer.discount_value ?? 10}
                    onChange={(e) =>
                      setEditingOffer({
                        ...editingOffer,
                        discount_value: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-ui-fg-base block mb-1">
                    Min Order Spend (₹)
                  </label>
                  <Input
                    type="number"
                    placeholder="499"
                    value={editingOffer.min_spend ?? 499}
                    onChange={(e) =>
                      setEditingOffer({
                        ...editingOffer,
                        min_spend: Number(e.target.value),
                        min_spend_text: `Min Order: ₹${e.target.value}`,
                      })
                    }
                  />
                </div>
              </div>

              {/* Category & Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-ui-fg-base block mb-1">
                    Campaign Category
                  </label>
                  <select
                    className="w-full text-xs p-2 rounded-lg border border-ui-border-base bg-ui-bg-base text-ui-fg-base"
                    value={editingOffer.category || "welcome"}
                    onChange={(e) =>
                      setEditingOffer({
                        ...editingOffer,
                        category: e.target.value as any,
                      })
                    }
                  >
                    <option value="welcome">Welcome Offer</option>
                    <option value="sitewide">Sitewide Sale</option>
                    <option value="seeds">0% GST Seeds</option>
                    <option value="plants">Live Houseplants</option>
                    <option value="bank">UPI / Bank Offer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-ui-fg-base block mb-1">
                    Left Circular Icon
                  </label>
                  <select
                    className="w-full text-xs p-2 rounded-lg border border-ui-border-base bg-ui-bg-base text-ui-fg-base"
                    value={editingOffer.icon || "card_giftcard"}
                    onChange={(e) =>
                      setEditingOffer({
                        ...editingOffer,
                        icon: e.target.value as any,
                      })
                    }
                  >
                    <option value="card_giftcard">🎁 Gift Card / Present</option>
                    <option value="auto_awesome">✨ Sparkles / Premium</option>
                    <option value="spa">🌱 Botanical Sprout / Seed</option>
                    <option value="local_shipping">🚚 Delivery Truck</option>
                    <option value="percent">% Percent Badge</option>
                  </select>
                </div>
              </div>

              {/* Color Presets */}
              <div>
                <label className="text-xs font-medium text-ui-fg-base block mb-1.5">
                  Visual Theme Color Palette
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() =>
                        setEditingOffer({
                          ...editingOffer,
                          bg_color: preset.bg,
                          text_color: preset.text,
                          accent_color: preset.accent,
                        })
                      }
                      className="flex items-center gap-2 p-2 rounded-lg border border-ui-border-base hover:border-emerald-600 transition-colors text-left"
                    >
                      <div
                        style={{ backgroundColor: preset.bg, borderColor: preset.accent }}
                        className="w-6 h-6 rounded-full border-2 shrink-0"
                      />
                      <span className="text-[11px] font-medium truncate text-ui-fg-base">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-ui-bg-subtle border border-ui-border-base">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={editingOffer.is_highlighted ?? false}
                    onCheckedChange={(checked) =>
                      setEditingOffer({ ...editingOffer, is_highlighted: checked })
                    }
                  />
                  <div>
                    <span className="text-xs font-semibold block text-ui-fg-base">
                      Feature as Homepage Welcome Banner
                    </span>
                    <span className="text-[10px] text-ui-fg-muted">
                      Shows as the primary card above the value pillars.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={editingOffer.is_active ?? true}
                    onCheckedChange={(checked) =>
                      setEditingOffer({ ...editingOffer, is_active: checked })
                    }
                  />
                  <div>
                    <span className="text-xs font-semibold block text-ui-fg-base">
                      Active on Storefront
                    </span>
                    <span className="text-[10px] text-ui-fg-muted">
                      Published and usable by customers.
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-ui-border-base">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Promotional Offer"}
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
  label: "Offers & Promos",
  icon: TagIcon,
});

export default OffersAdminPage;

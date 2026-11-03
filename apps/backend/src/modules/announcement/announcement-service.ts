import fs from "node:fs";
import path from "node:path";
import {
  AnnouncementItem,
  AnnouncementBarConfig,
  AnnouncementStoreResponse,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
  UpdateAnnouncementConfigInput,
} from "./types";

const DATA_DIR = path.resolve(process.cwd(), "data");
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, "announcements.json");

export const DEFAULT_ANNOUNCEMENT_CONFIG: AnnouncementBarConfig = {
  is_enabled: true,
  speed_seconds: 30,
  bg_color: "#1B4332", // Forest Deep botanical luxury
  text_color: "#FFFFFF",
  highlight_color: "#FFD51F", // Golden yellow badge
  pause_on_hover: true,
  updated_at: new Date("2026-10-31T00:00:00Z").toISOString(),
};

export const DEFAULT_ANNOUNCEMENT_ITEMS: AnnouncementItem[] = [
  {
    id: "ann_free_shipping_499",
    text: "Free express botanical delivery on all orders over ₹499 • Pan-India safe transit",
    highlight_text: "₹499 FREE DELIVERY",
    badge_color: "#D48B46",
    badge_text_color: "#111827",
    icon: "local_shipping",
    link_url: "/policies/shipping",
    display_order: 1,
    is_active: true,
    created_at: new Date("2026-11-03T00:00:00Z").toISOString(),
    updated_at: new Date("2026-11-03T00:00:00Z").toISOString(),
  },
  {
    id: "ann_germination_guarantee",
    text: "Heirloom & Indigenous Indian Desi Seeds Tested for Vigorous Growth",
    highlight_text: "98% GERMINATION",
    badge_color: "#D48B46",
    badge_text_color: "#111827",
    icon: "spa",
    link_url: "/categories/seeds",
    display_order: 2,
    is_active: true,
    created_at: new Date("2026-11-03T00:00:00Z").toISOString(),
    updated_at: new Date("2026-11-03T00:00:00Z").toISOString(),
  },
  {
    id: "ann_nursery_fresh_live_plants",
    text: "Air-Purifying & Rare Cultivars Direct From Our Pune & Bengaluru Nurseries",
    highlight_text: "NURSERY FRESH",
    badge_color: "#D48B46",
    badge_text_color: "#111827",
    icon: "star",
    link_url: "/categories/live-plants",
    display_order: 3,
    is_active: true,
    created_at: new Date("2026-11-03T00:00:00Z").toISOString(),
    updated_at: new Date("2026-11-03T00:00:00Z").toISOString(),
  },
  {
    id: "ann_artisan_planters",
    text: "Handcrafted Terracotta & Ceramic Planters with Optimal Root Aeration",
    highlight_text: "ARTISAN CRAFT",
    badge_color: "#7A1C2E",
    badge_text_color: "#FFFFFF",
    icon: "shield",
    link_url: "/categories/planters",
    display_order: 4,
    is_active: true,
    created_at: new Date("2026-11-03T00:00:00Z").toISOString(),
    updated_at: new Date("2026-11-03T00:00:00Z").toISOString(),
  },
  {
    id: "ann_code_glorov10",
    text: "Use code GLOROV10 at checkout for an extra 10% off your botanical order",
    highlight_text: "USE CODE GLOROV10",
    badge_color: "#2D6A4F",
    badge_text_color: "#FFFFFF",
    icon: "percent",
    link_url: "/store",
    display_order: 5,
    is_active: true,
    created_at: new Date("2026-11-03T00:00:00Z").toISOString(),
    updated_at: new Date("2026-11-03T00:00:00Z").toISOString(),
  },
];

interface AnnouncementStoragePayload {
  config: AnnouncementBarConfig;
  items: AnnouncementItem[];
}

export class AnnouncementService {
  private static ensureDataFile(): AnnouncementStoragePayload {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(ANNOUNCEMENTS_FILE)) {
      const initial: AnnouncementStoragePayload = {
        config: DEFAULT_ANNOUNCEMENT_CONFIG,
        items: DEFAULT_ANNOUNCEMENT_ITEMS,
      };
      fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }

    try {
      const raw = fs.readFileSync(ANNOUNCEMENTS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (!parsed.config || !Array.isArray(parsed.items)) {
        throw new Error("Invalid format");
      }
      return parsed;
    } catch {
      const fallback: AnnouncementStoragePayload = {
        config: DEFAULT_ANNOUNCEMENT_CONFIG,
        items: DEFAULT_ANNOUNCEMENT_ITEMS,
      };
      fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(fallback, null, 2), "utf-8");
      return fallback;
    }
  }

  private static saveData(payload: AnnouncementStoragePayload): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(payload, null, 2), "utf-8");
  }

  public static async getStoreAnnouncements(): Promise<AnnouncementStoreResponse> {
    const data = this.ensureDataFile();
    const activeItems = data.items
      .filter((item) => item.is_active)
      .sort((a, b) => a.display_order - b.display_order);

    return {
      config: data.config,
      items: activeItems,
    };
  }

  public static async getAllAdminAnnouncements(): Promise<AnnouncementStoragePayload> {
    const data = this.ensureDataFile();
    data.items.sort((a, b) => a.display_order - b.display_order);
    return data;
  }

  public static async updateConfig(input: UpdateAnnouncementConfigInput): Promise<AnnouncementBarConfig> {
    const data = this.ensureDataFile();
    data.config = {
      ...data.config,
      ...input,
      speed_seconds:
        input.speed_seconds !== undefined
          ? Math.max(10, Math.min(120, Number(input.speed_seconds)))
          : data.config.speed_seconds,
      updated_at: new Date().toISOString(),
    };
    this.saveData(data);
    return data.config;
  }

  public static async getAnnouncementById(id: string): Promise<AnnouncementItem | null> {
    const data = this.ensureDataFile();
    return data.items.find((item) => item.id === id) || null;
  }

  public static async createAnnouncement(input: CreateAnnouncementInput): Promise<AnnouncementItem> {
    const data = this.ensureDataFile();
    const now = new Date().toISOString();
    const id = `ann_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newItem: AnnouncementItem = {
      id,
      text: input.text.trim(),
      highlight_text: input.highlight_text?.trim(),
      badge_color: input.badge_color?.trim() || "#D48B46",
      badge_text_color: input.badge_text_color?.trim() || "#111827",
      icon: input.icon || "local_shipping",
      link_url: input.link_url?.trim() || "/store",
      display_order: input.display_order ?? (data.items.length + 1),
      is_active: input.is_active ?? true,
      created_at: now,
      updated_at: now,
    };

    data.items.push(newItem);
    this.saveData(data);
    return newItem;
  }

  public static async updateAnnouncement(id: string, input: UpdateAnnouncementInput): Promise<AnnouncementItem> {
    const data = this.ensureDataFile();
    const index = data.items.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error(`Announcement with id '${id}' not found`);
    }

    const current = data.items[index];
    const updated: AnnouncementItem = {
      ...current,
      ...input,
      text: input.text !== undefined ? input.text.trim() : current.text,
      highlight_text:
        input.highlight_text !== undefined ? input.highlight_text.trim() : current.highlight_text,
      badge_color:
        input.badge_color !== undefined ? input.badge_color.trim() : current.badge_color,
      badge_text_color:
        input.badge_text_color !== undefined ? input.badge_text_color.trim() : current.badge_text_color,
      icon: input.icon !== undefined ? input.icon : current.icon,
      link_url: input.link_url !== undefined ? input.link_url.trim() : current.link_url,
      display_order: input.display_order !== undefined ? Number(input.display_order) : current.display_order,
      is_active: input.is_active !== undefined ? Boolean(input.is_active) : current.is_active,
      updated_at: new Date().toISOString(),
    };

    data.items[index] = updated;
    this.saveData(data);
    return updated;
  }

  public static async deleteAnnouncement(id: string): Promise<boolean> {
    const data = this.ensureDataFile();
    const initialLength = data.items.length;
    data.items = data.items.filter((item) => item.id !== id);

    if (data.items.length === initialLength) {
      return false;
    }

    this.saveData(data);
    return true;
  }

  public static async seedDefaults(force = false): Promise<AnnouncementStoragePayload> {
    if (force || !fs.existsSync(ANNOUNCEMENTS_FILE)) {
      const payload: AnnouncementStoragePayload = {
        config: DEFAULT_ANNOUNCEMENT_CONFIG,
        items: DEFAULT_ANNOUNCEMENT_ITEMS,
      };
      this.saveData(payload);
      return payload;
    }
    return this.ensureDataFile();
  }
}

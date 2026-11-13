import { defineRouteConfig } from "@medusajs/admin-sdk";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { adminFetch } from "../../utils/admin-client";
import {
  Container,
  Heading,
  Text,
  Badge,
  Button,
  Input,
  Toaster,
  toast,
  Copy,
  usePrompt,
} from "@medusajs/ui";

export interface MediaAsset {
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  folder?: string;
  secure_url: string;
}

export interface QueueItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  slug: string;
  folder: string;
  sizeFormatted: string;
  status: "idle" | "uploading" | "success" | "error";
  error?: string;
  uploadedUrl?: string;
}

const FOLDER_OPTIONS = [
  { label: "Products (glorov/products)", value: "glorov/products" },
  { label: "Banners (glorov/banners)", value: "glorov/banners" },
  { label: "Categories (glorov/categories)", value: "glorov/categories" },
  { label: "General Uploads (glorov/uploads)", value: "glorov/uploads" },
];

/**
 * Auto-generates a clean slug from a file name.
 * Strips file extension, replaces spaces with hyphens ("-"),
 * removes invalid characters, and collapses consecutive hyphens.
 */
export const generateSlugFromFilename = (filename: string): string => {
  if (!filename) return `asset-${Date.now()}`;
  const lastDot = filename.lastIndexOf(".");
  const nameWithoutExt = lastDot > 0 ? filename.substring(0, lastDot) : filename;

  const slug = nameWithoutExt
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")          // Replace all whitespace with "-"
    .replace(/[^a-z0-9-]/g, "-")   // Replace special characters with "-"
    .replace(/-+/g, "-")          // Collapse consecutive hyphens
    .replace(/^-+|-+$/g, "");      // Trim leading/trailing hyphens

  return slug || `asset-${Date.now()}`;
};

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// --- Icons ---
const CloudUploadIcon = () => (
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
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    <polyline points="12 13 12 7 9 10" />
    <polyline points="12 7 15 10" />
  </svg>
);

const ClipboardIcon = () => (
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
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-emerald-600"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const MediaAdminPage = () => {
  const prompt = usePrompt();
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string>("glorov");
  const [defaultUploadFolder, setDefaultUploadFolder] = useState<string>("glorov/products");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadQueue, setUploadQueue] = useState<QueueItem[]>([]);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch(`/admin/media?folder=${encodeURIComponent(selectedFolder)}&limit=100`);
      if (res.ok) {
        const data = res.data;
        setMediaList(data?.media || []);
      } else {
        toast.error("Cloudinary Error", {
          description: "Failed to load media assets from Cloudinary.",
        });
      }
    } catch {
      toast.error("Network Error", {
        description: "Could not connect to media API.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [selectedFolder]);

  // Read file into Base64 data URL
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Add files to the upload queue with auto-generated slugs
  const addFilesToQueue = useCallback(
    async (files: File[]) => {
      const validFiles = files.filter((f) => f.type.startsWith("image/"));
      if (validFiles.length === 0) {
        toast.error("Invalid file type", {
          description: "Please provide valid image files (JPG, PNG, WebP, SVG, GIF).",
        });
        return;
      }

      const newItems: QueueItem[] = [];
      for (const file of validFiles) {
        try {
          const previewUrl = await readFileAsDataUrl(file);
          const autoSlug = generateSlugFromFilename(file.name);
          newItems.push({
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            file,
            previewUrl,
            name: file.name,
            slug: autoSlug,
            folder: defaultUploadFolder,
            sizeFormatted: formatBytes(file.size),
            status: "idle",
          });
        } catch (err) {
          console.error("Failed to read file preview:", err);
        }
      }

      setUploadQueue((prev) => [...prev, ...newItems]);
      toast.success("Added to Queue", {
        description: `${newItems.length} image(s) ready for upload with auto-generated slugs.`,
      });
    },
    [defaultUploadFolder]
  );

  // File input change handler (multiple support)
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(Array.from(e.target.files));
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Drag and drop handler
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(Array.from(e.dataTransfer.files));
    }
  };

  // Clipboard Paste handler (Cmd+V / Ctrl+V anywhere on window)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      // Do not hijack typing inside text inputs unless clipboard explicitly contains images
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");

      const items = e.clipboardData?.items;
      if (!items || items.length === 0) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (file) {
            const ext = item.type.split("/")[1] || "png";
            const cleanName =
              file.name && file.name !== "image.png"
                ? file.name
                : `clipboard-image-${Date.now()}.${ext}`;
            const namedFile = new File([file], cleanName, { type: item.type });
            imageFiles.push(namedFile);
          }
        }
      }

      if (imageFiles.length > 0) {
        if (!isInput) {
          e.preventDefault();
        }
        addFilesToQueue(imageFiles);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [addFilesToQueue]);

  // Clickable "Paste from Clipboard" button handler
  const handleClipboardButton = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        const imageFiles: File[] = [];
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith("image/"));
          if (imageType) {
            const blob = await item.getType(imageType);
            const ext = imageType.split("/")[1] || "png";
            const filename = `clipboard-image-${Date.now()}.${ext}`;
            imageFiles.push(new File([blob], filename, { type: imageType }));
          }
        }
        if (imageFiles.length > 0) {
          addFilesToQueue(imageFiles);
          return;
        }
      }
      toast.info("Clipboard Shortcut", {
        description: "Copy any image or screenshot, then press Cmd+V (Mac) or Ctrl+V directly.",
      });
    } catch {
      toast.info("Paste Shortcut", {
        description: "Press Cmd+V (Mac) or Ctrl+V anywhere on this page to paste your image.",
      });
    }
  };

  // Upload a single item from the queue
  const uploadSingleItem = async (item: QueueItem): Promise<boolean> => {
    setUploadQueue((prev) =>
      prev.map((q) => (q.id === item.id ? { ...q, status: "uploading", error: undefined } : q))
    );

    try {
      const payload = {
        file: item.previewUrl,
        folder: item.folder,
        public_id: item.slug.trim() || undefined,
      };

      const res = await adminFetch("/admin/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = res.data;
        const uploadedUrl = data?.asset?.secure_url || data?.secure_url;
        setUploadQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: "success", uploadedUrl } : q
          )
        );
        return true;
      } else {
        const errMsg = res.error || res.data?.message || "Upload failed";
        setUploadQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: "error", error: errMsg } : q))
        );
        return false;
      }
    } catch (err: any) {
      setUploadQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? { ...q, status: "error", error: err.message || "Network error" }
            : q
        )
      );
      return false;
    }
  };

  // Batch upload all pending items
  const handleUploadAll = async () => {
    const pendingItems = uploadQueue.filter((q) => q.status === "idle" || q.status === "error");
    if (pendingItems.length === 0) {
      toast.info("Nothing to upload", {
        description: "All images in queue are already uploaded or queue is empty.",
      });
      return;
    }

    setIsBulkUploading(true);
    let successCount = 0;

    for (const item of pendingItems) {
      const ok = await uploadSingleItem(item);
      if (ok) successCount++;
    }

    setIsBulkUploading(false);

    if (successCount > 0) {
      toast.success("Upload Complete", {
        description: `Successfully uploaded ${successCount} image(s) to Cloudinary.`,
      });
      fetchMedia();
    } else {
      toast.error("Upload Failed", {
        description: "Could not upload pending images. Please inspect error messages below.",
      });
    }
  };

  // Remove individual item from queue
  const removeQueueItem = (id: string) => {
    setUploadQueue((prev) => prev.filter((q) => q.id !== id));
  };

  // Update slug for item
  const updateItemSlug = (id: string, newSlug: string) => {
    setUploadQueue((prev) =>
      prev.map((q) => (q.id === id ? { ...q, slug: newSlug } : q))
    );
  };

  // Update target folder for item
  const updateItemFolder = (id: string, newFolder: string) => {
    setUploadQueue((prev) =>
      prev.map((q) => (q.id === id ? { ...q, folder: newFolder } : q))
    );
  };

  // Clear completed uploads from queue
  const clearCompleted = () => {
    setUploadQueue((prev) => prev.filter((q) => q.status !== "success"));
  };

  // Clear entire queue
  const clearAllQueue = () => {
    setUploadQueue([]);
  };

  // Delete asset from Cloudinary
  const handleDelete = async (publicId: string) => {
    const userConfirmed = await prompt({
      title: "Delete Cloudinary Asset",
      description: `Are you sure you want to delete "${publicId}" from Cloudinary?`,
      confirmText: "Delete Asset",
      cancelText: "Cancel",
    });
    if (!userConfirmed) return;

    try {
      const res = await adminFetch(`/admin/media?public_id=${encodeURIComponent(publicId)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Deleted", {
          description: `Asset ${publicId} deleted from Cloudinary.`,
        });
        setMediaList((prev) => prev.filter((m) => m.public_id !== publicId));
      } else {
        toast.error("Delete failed", {
          description: res.error || res.data?.message || "Could not delete asset.",
        });
      }
    } catch {
      toast.error("Error", {
        description: "Failed to communicate with media server.",
      });
    }
  };

  const filteredMedia = useMemo(() => {
    if (!searchQuery.trim()) return mediaList;
    const q = searchQuery.toLowerCase();
    return mediaList.filter(
      (m) =>
        m.public_id.toLowerCase().includes(q) ||
        (m.format && m.format.toLowerCase().includes(q))
    );
  }, [mediaList, searchQuery]);

  const pendingCount = uploadQueue.filter((q) => q.status === "idle" || q.status === "error").length;

  return (
    <div className="flex flex-col gap-y-6 max-w-7xl mx-auto py-4 px-2">
      <Toaster />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ui-border-base pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
              <CloudUploadIcon />
            </span>
            <Heading level="h1" className="text-2xl font-bold tracking-tight text-ui-fg-base">
              Cloudinary Image Store & Media Hub
            </Heading>
          </div>
          <Text className="text-ui-fg-subtle text-sm">
            Upload single or multiple images, paste directly from clipboard, auto-generate hyphenated slugs, and manage high-res GLOROV botanical assets.
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <Badge color="green" size="small">
            CDN: naodmm8w
          </Badge>
          <Button variant="secondary" size="small" onClick={fetchMedia} disabled={isLoading}>
            Refresh Library
          </Button>
        </div>
      </div>

      {/* Multi-Image & Clipboard Upload Zone */}
      <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <Heading level="h2" className="text-lg font-semibold text-ui-fg-base">
              Upload Images (Multi-File & Clipboard Paste)
            </Heading>
            <Text className="text-xs text-ui-fg-muted">
              Select multiple files, paste with <kbd className="px-1 py-0.5 bg-ui-bg-subtle rounded border text-[11px] font-mono">Cmd+V</kbd> / <kbd className="px-1 py-0.5 bg-ui-bg-subtle rounded border text-[11px] font-mono">Ctrl+V</kbd>, or drop files below. Slugs are automatically hyphenated from filenames.
            </Text>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="small"
              type="button"
              onClick={handleClipboardButton}
              className="flex items-center gap-1.5"
            >
              <ClipboardIcon />
              <span>Paste from Clipboard</span>
            </Button>
          </div>
        </div>

        {/* Global Default Folder Select */}
        <div className="mb-4 max-w-sm">
          <label className="block text-xs font-medium text-ui-fg-subtle mb-1.5">
            Default Cloudinary Folder for New Items
          </label>
          <select
            value={defaultUploadFolder}
            onChange={(e) => setDefaultUploadFolder(e.target.value)}
            className="w-full h-9 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-sm text-ui-fg-base focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {FOLDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-ui-border-base hover:border-emerald-600 bg-ui-bg-subtle/40 hover:bg-emerald-50/10 rounded-xl p-6 text-center cursor-pointer transition-colors"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/*"
            multiple
            className="hidden"
          />

          <div className="flex flex-col items-center gap-2 py-4">
            <div className="p-3 bg-ui-bg-base rounded-full shadow-xs border border-ui-border-base text-ui-fg-subtle">
              <CloudUploadIcon />
            </div>
            <Text className="text-sm font-medium text-ui-fg-base">
              Drag & drop multiple images here, or <span className="text-emerald-700 font-semibold underline">browse files</span>
            </Text>
            <Text className="text-xs text-ui-fg-muted">
              Supports JPG, PNG, WebP, SVG, GIF up to 50MB. Tip: You can also paste screenshots directly with <strong>Cmd+V / Ctrl+V</strong>.
            </Text>
          </div>
        </div>

        {/* Upload Queue Section */}
        {uploadQueue.length > 0 && (
          <div className="mt-6 pt-6 border-t border-ui-border-base flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Heading level="h3" className="text-sm font-semibold text-ui-fg-base">
                  Upload Queue ({uploadQueue.length})
                </Heading>
                {pendingCount > 0 && (
                  <Badge color="blue" size="small">
                    {pendingCount} Pending
                  </Badge>
                )}
                {uploadQueue.length - pendingCount > 0 && (
                  <Badge color="green" size="small">
                    {uploadQueue.length - pendingCount} Uploaded
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                {uploadQueue.some((q) => q.status === "success") && (
                  <Button variant="secondary" size="small" type="button" onClick={clearCompleted}>
                    Clear Uploaded
                  </Button>
                )}
                <Button variant="secondary" size="small" type="button" onClick={clearAllQueue}>
                  Clear All
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  type="button"
                  onClick={handleUploadAll}
                  disabled={pendingCount === 0 || isBulkUploading}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  {isBulkUploading ? "Uploading Queue..." : `Upload All (${pendingCount})`}
                </Button>
              </div>
            </div>

            {/* Queue Item Cards */}
            <div className="flex flex-col gap-3">
              {uploadQueue.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col md:flex-row items-start md:items-center gap-4 p-3 rounded-lg border transition-all ${
                    item.status === "success"
                      ? "bg-emerald-50/20 border-emerald-300"
                      : item.status === "error"
                      ? "bg-rose-50/20 border-rose-300"
                      : item.status === "uploading"
                      ? "bg-blue-50/20 border-blue-300"
                      : "bg-ui-bg-subtle/30 border-ui-border-base"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 shrink-0 bg-ui-bg-base border border-ui-border-base rounded-md overflow-hidden flex items-center justify-center">
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  {/* File Info & Slug Input */}
                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                    <div>
                      <Text className="text-xs font-semibold text-ui-fg-base truncate" title={item.name}>
                        {item.name}
                      </Text>
                      <Text className="text-[11px] text-ui-fg-muted">{item.sizeFormatted}</Text>
                    </div>

                    {/* Auto-generated editable Slug */}
                    <div>
                      <label className="block text-[10px] font-medium text-ui-fg-subtle mb-1">
                        Public ID / Slug (Auto-hyphenated)
                      </label>
                      <Input
                        size="small"
                        value={item.slug}
                        disabled={item.status === "success" || item.status === "uploading"}
                        onChange={(e) => updateItemSlug(item.id, e.target.value)}
                        placeholder="slug-with-hyphens"
                      />
                    </div>

                    {/* Folder selector */}
                    <div>
                      <label className="block text-[10px] font-medium text-ui-fg-subtle mb-1">
                        Folder
                      </label>
                      <select
                        value={item.folder}
                        disabled={item.status === "success" || item.status === "uploading"}
                        onChange={(e) => updateItemFolder(item.id, e.target.value)}
                        className="w-full h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2 text-xs text-ui-fg-base focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      >
                        {FOLDER_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label.split(" ")[0]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {item.status === "success" && (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
                          <CheckCircleIcon /> Uploaded
                        </span>
                        {item.uploadedUrl && <Copy content={item.uploadedUrl} />}
                      </div>
                    )}

                    {item.status === "uploading" && (
                      <Badge color="blue" size="small">
                        Uploading...
                      </Badge>
                    )}

                    {item.status === "error" && (
                      <div className="flex items-center gap-2">
                        <Badge color="red" size="small" title={item.error}>
                          Failed
                        </Badge>
                        <Button
                          variant="secondary"
                          size="small"
                          type="button"
                          onClick={() => uploadSingleItem(item)}
                        >
                          Retry
                        </Button>
                      </div>
                    )}

                    {item.status === "idle" && (
                      <Button
                        variant="secondary"
                        size="small"
                        type="button"
                        onClick={() => uploadSingleItem(item)}
                      >
                        Upload
                      </Button>
                    )}

                    <Button
                      variant="danger"
                      size="small"
                      type="button"
                      onClick={() => removeQueueItem(item.id)}
                      className="p-1 h-7 w-7"
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>

      {/* Media Library View */}
      <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <Heading level="h2" className="text-lg font-semibold text-ui-fg-base">
              Cloudinary Media Gallery
            </Heading>
            <Text className="text-xs text-ui-fg-muted">
              Showing {filteredMedia.length} assets stored in Cloudinary CDN.
            </Text>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2 text-xs text-ui-fg-base focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="glorov">All Glorov Assets (glorov/*)</option>
              <option value="glorov/products">Products (glorov/products)</option>
              <option value="glorov/banners">Banners (glorov/banners)</option>
              <option value="glorov/categories">Categories (glorov/categories)</option>
              <option value="glorov/uploads">Uploads (glorov/uploads)</option>
            </select>

            <Input
              size="small"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-ui-fg-muted text-sm">
            Loading Cloudinary media library...
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="py-16 text-center text-ui-fg-muted text-sm border border-dashed rounded-lg">
            No assets found in selected folder. Upload an image above to get started.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredMedia.map((asset) => (
              <div
                key={asset.public_id}
                className="group relative flex flex-col bg-ui-bg-subtle/40 border border-ui-border-base rounded-lg overflow-hidden hover:border-emerald-600 hover:shadow-xs transition-all"
              >
                {/* Thumbnail container */}
                <div className="relative aspect-square w-full bg-ui-bg-base flex items-center justify-center p-2 border-b border-ui-border-base overflow-hidden">
                  <img
                    src={asset.secure_url}
                    alt={asset.public_id}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDelete(asset.public_id)}
                      className="p-1 h-6 w-6"
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-2.5 flex flex-col gap-1.5 text-left">
                  <Text
                    className="text-xs font-semibold text-ui-fg-base truncate"
                    title={asset.public_id}
                  >
                    {asset.public_id.split("/").pop()}
                  </Text>
                  <div className="flex items-center justify-between text-[10px] text-ui-fg-muted">
                    <span>
                      {asset.width}×{asset.height}
                    </span>
                    <span>{formatBytes(asset.bytes)}</span>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono px-1 py-0.5 bg-ui-bg-base border rounded text-ui-fg-subtle">
                      {asset.format}
                    </span>
                    <Copy content={asset.secure_url} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export const config = defineRouteConfig({
  label: "Media & Cloudinary",
  icon: CloudUploadIcon,
});

export default MediaAdminPage;

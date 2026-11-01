import { defineRouteConfig } from "@medusajs/admin-sdk";
import React, { useState, useEffect, useMemo, useRef } from "react";
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

const FOLDER_OPTIONS = [
  { label: "Products (glorov/products)", value: "glorov/products" },
  { label: "Banners (glorov/banners)", value: "glorov/banners" },
  { label: "Categories (glorov/categories)", value: "glorov/categories" },
  { label: "General Uploads (glorov/uploads)", value: "glorov/uploads" },
];

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

export const MediaAdminPage = () => {
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string>("glorov");
  const [uploadFolder, setUploadFolder] = useState<string>("glorov/products");
  const [customPublicId, setCustomPublicId] = useState<string>("");
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file", {
        description: "Please select an image file (PNG, JPG, WebP, SVG).",
      });
      return;
    }

    setPreviewFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewDataUrl) {
      toast.error("No image selected", {
        description: "Please choose or drop an image file first.",
      });
      return;
    }

    setIsUploading(true);
    try {
      const payload: Record<string, any> = {
        file: previewDataUrl,
        folder: uploadFolder,
      };

      if (customPublicId.trim()) {
        payload.public_id = customPublicId.trim();
      }

      const res = await adminFetch("/admin/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = res.data;
        toast.success("Upload successful", {
          description: `Uploaded to ${data?.asset?.secure_url}`,
        });
        setPreviewDataUrl(null);
        setPreviewFileName("");
        setCustomPublicId("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchMedia();
      } else {
        toast.error("Upload failed", {
          description: res.error || res.data?.message || "Failed to upload to Cloudinary.",
        });
      }
    } catch (err: any) {
      toast.error("Upload error", {
        description: err.message || "Unexpected error occurred during upload.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (publicId: string) => {
    if (!window.confirm(`Are you sure you want to delete "${publicId}" from Cloudinary?`)) {
      return;
    }

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

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

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
            Manage, upload, preview, and organize official GLOROV botanical assets, product photography, and banners.
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <Badge color="green" size="small">
            Cloud: naodmm8w
          </Badge>
          <Button variant="secondary" size="small" onClick={fetchMedia} disabled={isLoading}>
            Refresh Library
          </Button>
        </div>
      </div>

      {/* Upload Zone & Controls */}
      <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl shadow-xs">
        <Heading level="h2" className="text-lg font-semibold mb-4 text-ui-fg-base">
          Upload New Botanical Image
        </Heading>

        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ui-fg-subtle mb-1.5">
                Target Cloudinary Folder
              </label>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                className="w-full h-9 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-sm text-ui-fg-base focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                {FOLDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-ui-fg-subtle mb-1.5">
                Custom Public ID / Slug (Optional)
              </label>
              <Input
                placeholder="e.g. heirloom-tomato-seeds-pack"
                value={customPublicId}
                onChange={(e) => setCustomPublicId(e.target.value)}
              />
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              previewDataUrl
                ? "border-emerald-500 bg-emerald-50/20"
                : "border-ui-border-base hover:border-emerald-600 bg-ui-bg-subtle/50"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              accept="image/*"
              className="hidden"
            />

            {previewDataUrl ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={previewDataUrl}
                  alt="Preview"
                  className="max-h-48 rounded-lg object-contain border border-ui-border-base shadow-xs"
                />
                <div className="flex items-center gap-2">
                  <Badge color="blue" size="small">
                    {previewFileName}
                  </Badge>
                  <Text className="text-xs text-ui-fg-muted">Click or drop another file to change</Text>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="p-3 bg-ui-bg-base rounded-full shadow-xs border border-ui-border-base text-ui-fg-subtle">
                  <CloudUploadIcon />
                </div>
                <Text className="text-sm font-medium text-ui-fg-base">
                  Drag and drop your product or banner image here, or <span className="text-emerald-700 font-semibold underline">browse</span>
                </Text>
                <Text className="text-xs text-ui-fg-muted">
                  Supports high-resolution JPG, PNG, WebP, SVG (Auto-compressed on Cloudinary CDN)
                </Text>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {previewDataUrl && (
              <Button
                variant="secondary"
                size="small"
                type="button"
                onClick={() => {
                  setPreviewDataUrl(null);
                  setPreviewFileName("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Clear Selection
              </Button>
            )}
            <Button
              variant="primary"
              size="small"
              type="submit"
              disabled={!previewDataUrl || isUploading}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {isUploading ? "Uploading to Cloudinary..." : "Upload to Cloudinary"}
            </Button>
          </div>
        </form>
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

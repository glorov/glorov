import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { adminFetch } from "../utils/admin-client";
import {
  Button,
  Input,
  Badge,
  Text,
  toast,
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

export interface CloudinaryMediaPickerProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  folder?: string;
  aspectRatio?: string;
  recommendedDimensions?: string;
  helperText?: string;
  required?: boolean;
}

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

const FOLDER_OPTIONS = [
  { label: "All Glorov Assets", value: "glorov" },
  { label: "Banners (glorov/banners)", value: "glorov/banners" },
  { label: "Products (glorov/products)", value: "glorov/products" },
  { label: "Categories (glorov/categories)", value: "glorov/categories" },
  { label: "Uploads (glorov/uploads)", value: "glorov/uploads" },
];

export const CloudinaryMediaPicker: React.FC<CloudinaryMediaPickerProps> = ({
  label,
  value,
  onChange,
  placeholder = "https://res.cloudinary.com/... or image URL",
  folder = "glorov/banners",
  aspectRatio,
  recommendedDimensions,
  helperText,
  required = false,
}) => {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>(folder);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewError, setPreviewError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 12;

  // Reset preview error when value changes
  useEffect(() => {
    setPreviewError(false);
  }, [value]);

  // Fetch library assets
  const fetchLibrary = useCallback(async () => {
    setLibraryLoading(true);
    try {
      const res = await adminFetch(`/admin/media?folder=${encodeURIComponent(selectedFolder)}&limit=100`);
      if (res.ok && res.data?.media) {
        setMediaList(res.data.media);
      } else {
        toast.error("Failed to load Cloudinary media assets.");
      }
    } catch {
      toast.error("Network error while connecting to Cloudinary API.");
    } finally {
      setLibraryLoading(false);
    }
  }, [selectedFolder]);

  useEffect(() => {
    if (isLibraryOpen) {
      fetchLibrary();
      setCurrentPage(1);
    }
  }, [isLibraryOpen, fetchLibrary]);

  // Filter library assets
  const filteredMedia = useMemo(() => {
    if (!searchQuery.trim()) return mediaList;
    const q = searchQuery.toLowerCase();
    return mediaList.filter(
      (m) =>
        m.public_id.toLowerCase().includes(q) ||
        (m.format && m.format.toLowerCase().includes(q))
    );
  }, [mediaList, searchQuery]);

  // Paginated library items
  const totalPages = Math.max(1, Math.ceil(filteredMedia.length / itemsPerPage));
  const pagedMedia = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMedia.slice(start, start + itemsPerPage);
  }, [filteredMedia, currentPage, itemsPerPage]);

  // Handle direct file upload to Cloudinary
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please select an image file (JPG, PNG, WebP, SVG, GIF).",
      });
      return;
    }

    setIsUploading(true);
    try {
      // 1. Read file as Base64 data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      // 2. Generate slug from file name
      const slug = generateSlugFromFilename(file.name);

      // 3. Upload to Cloudinary backend endpoint
      const res = await adminFetch("/admin/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: dataUrl,
          folder: folder,
          public_id: slug,
        }),
      });

      if (res.ok) {
        const uploadedUrl = res.data?.asset?.secure_url || res.data?.secure_url;
        if (uploadedUrl) {
          onChange(uploadedUrl);
          toast.success("Uploaded to Cloudinary!", {
            description: `File saved as "${slug}" in ${folder}.`,
          });
        } else {
          toast.error("Upload succeeded but URL was not returned.");
        }
      } else {
        const msg = res.error || res.data?.message || "Failed to upload image to Cloudinary.";
        toast.error("Upload Failed", { description: msg });
      }
    } catch (err: any) {
      toast.error("Upload Error", {
        description: err.message || "Could not complete image upload.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Select asset from modal
  const handleSelectAsset = (asset: MediaAsset) => {
    onChange(asset.secure_url);
    setIsLibraryOpen(false);
    toast.success("Image Selected", {
      description: `Selected ${asset.public_id.split("/").pop()} from Cloudinary.`,
    });
  };

  return (
    <div className="space-y-2">
      {/* Label and Badge Row */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-ui-fg-base block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="flex items-center gap-1.5">
          {aspectRatio && (
            <Badge color="grey" size="small">
              {aspectRatio}
            </Badge>
          )}
          {recommendedDimensions && (
            <span className="text-[10px] text-ui-fg-muted font-mono">
              {recommendedDimensions}
            </span>
          )}
        </div>
      </div>

      {/* Input Row with Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Hidden File Input for Direct Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelected}
        />

        {/* Text Input for URL */}
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="pr-8 text-xs font-mono"
            required={required}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ui-fg-muted hover:text-ui-fg-base p-1 text-xs"
              title="Clear URL"
            >
              ✕
            </button>
          )}
        </div>

        {/* Direct Upload Button */}
        <Button
          type="button"
          variant="secondary"
          size="small"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 flex items-center gap-1.5"
          title="Upload image directly from your computer to Cloudinary"
        >
          {isUploading ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Direct Upload</span>
            </>
          )}
        </Button>

        {/* Choose from Cloudinary Library Button */}
        <Button
          type="button"
          variant="secondary"
          size="small"
          onClick={() => setIsLibraryOpen(true)}
          className="shrink-0 flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
          title="Choose an existing image from your Cloudinary media library"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <span>Cloudinary Library</span>
        </Button>
      </div>

      {helperText && (
        <Text className="text-[11px] text-ui-fg-muted">{helperText}</Text>
      )}

      {/* Live Thumbnail Preview */}
      {value && !previewError && (
        <div className="relative mt-2 p-2 bg-ui-bg-subtle/50 rounded-lg border border-ui-border-base flex items-center gap-3">
          <div className="w-16 h-12 rounded bg-ui-bg-base border border-ui-border-base overflow-hidden flex items-center justify-center shrink-0">
            <img
              src={value}
              alt="Preview"
              className="max-w-full max-h-full object-cover"
              onError={() => setPreviewError(true)}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-ui-fg-base truncate" title={value}>
              {value}
            </p>
            <div className="flex items-center gap-3 mt-0.5">
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-700 hover:underline inline-flex items-center gap-1"
              >
                Open full image ↗
              </a>
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-[11px] text-rose-600 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloudinary Media Library Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-ui-bg-base rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-ui-border-base flex flex-col max-h-[88vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-ui-border-base pb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                    <polyline points="12 13 12 7 9 10" />
                    <polyline points="12 7 15 10" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-base font-bold text-ui-fg-base">
                    Select from Cloudinary Media Library
                  </h3>
                  <Text className="text-xs text-ui-fg-muted">
                    Click any image below to automatically select its high-resolution CDN URL.
                  </Text>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="p-1 text-ui-fg-subtle hover:text-ui-fg-base text-lg font-bold rounded-md"
              >
                ✕
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-ui-border-base shrink-0">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-ui-fg-subtle whitespace-nowrap">Folder:</span>
                <select
                  value={selectedFolder}
                  onChange={(e) => {
                    setSelectedFolder(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2 text-xs text-ui-fg-base focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  {FOLDER_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input
                  size="small"
                  placeholder="Search assets by name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-64 text-xs"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={fetchLibrary}
                  disabled={libraryLoading}
                >
                  Refresh
                </Button>
              </div>
            </div>

            {/* Library Grid (Scrollable) */}
            <div className="flex-1 overflow-y-auto py-4 min-h-[300px]">
              {libraryLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-ui-fg-muted text-sm gap-2 py-16">
                  <svg className="animate-spin h-6 w-6 text-emerald-600" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Loading Cloudinary assets...</span>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-ui-fg-muted text-sm gap-2 py-16 border border-dashed rounded-xl">
                  <span>No assets found matching your filter.</span>
                  <Text className="text-xs">Use &quot;Direct Upload&quot; to upload a new image directly.</Text>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {pagedMedia.map((asset) => {
                    const isSelected = value === asset.secure_url;
                    return (
                      <div
                        key={asset.public_id}
                        onClick={() => handleSelectAsset(asset)}
                        className={`group relative flex flex-col rounded-lg border cursor-pointer transition-all overflow-hidden ${
                          isSelected
                            ? "border-emerald-600 ring-2 ring-emerald-500/30 bg-emerald-50/20"
                            : "border-ui-border-base bg-ui-bg-subtle/30 hover:border-emerald-500 hover:shadow-xs"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-[4/3] w-full bg-ui-bg-base flex items-center justify-center p-1 border-b border-ui-border-base overflow-hidden">
                          <img
                            src={asset.secure_url}
                            alt={asset.public_id}
                            loading="lazy"
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-150"
                          />
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded shadow">
                              SELECTED
                            </span>
                          )}
                        </div>

                        {/* Metadata */}
                        <div className="p-2 flex flex-col gap-0.5">
                          <p
                            className="text-xs font-semibold text-ui-fg-base truncate"
                            title={asset.public_id}
                          >
                            {asset.public_id.split("/").pop()}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-ui-fg-muted">
                            <span>
                              {asset.width}×{asset.height}
                            </span>
                            <span>{formatBytes(asset.bytes)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination & Footer */}
            <div className="pt-3 border-t border-ui-border-base flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-ui-fg-muted">
                Showing {filteredMedia.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredMedia.length)} of {filteredMedia.length} assets
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 2 + i;
                      if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        type="button"
                        variant={currentPage === pageNum ? "primary" : "secondary"}
                        size="small"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}

              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={() => setIsLibraryOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudinaryMediaPicker;

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { v2 as cloudinary } from "cloudinary";
import { sendSanitizedError } from "../../../../utils/error-handler";

const initCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
    api_key: process.env.CLOUDINARY_API_KEY || "",
    api_secret: process.env.CLOUDINARY_API_SECRET || "",
    secure: true,
  });
};

const setCorsHeaders = (req: MedusaRequest, res: MedusaResponse) => {
  const origin = (req.headers.origin as string) || "https://admin.glorov.com";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, HEAD, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-medusa-access-token, x-correlation-id"
  );
};

/**
 * OPTIONS /admin/media/upload
 * Handles browser preflight checks cleanly.
 */
export const OPTIONS = async (req: MedusaRequest, res: MedusaResponse) => {
  setCorsHeaders(req, res);
  res.status(204).end();
};

interface UploadItemInput {
  file: string;
  folder?: string;
  public_id?: string;
  tags?: string[];
}

/**
 * POST /admin/media/upload
 * Accepts single or multiple images (Base64 data URI, HTTP URL, or raw string content)
 * and uploads them directly to Cloudinary into designated folders.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  setCorsHeaders(req, res);

  try {
    initCloudinary();
    const body = (req.body || {}) as Record<string, any>;

    const itemsToUpload: UploadItemInput[] = [];

    if (Array.isArray(body.items)) {
      itemsToUpload.push(...body.items);
    } else if (Array.isArray(body.files)) {
      itemsToUpload.push(...body.files);
    } else if (body.file) {
      itemsToUpload.push({
        file: body.file,
        folder: body.folder,
        public_id: body.public_id,
        tags: body.tags,
      });
    }

    if (itemsToUpload.length === 0) {
      res.status(400).json({
        message:
          "No media payload provided. Provide 'file' (string) or 'files'/'items' (array).",
      });
      return;
    }

    const uploadedAssets = [];

    for (const item of itemsToUpload) {
      if (!item.file || typeof item.file !== "string") {
        continue;
      }

      const folder = item.folder
        ? `glorov/${item.folder.replace(/^glorov\/?/, "")}`
        : body.folder
        ? `glorov/${body.folder.replace(/^glorov\/?/, "")}`
        : "glorov/uploads";

      const publicId = item.public_id ? item.public_id.trim() : undefined;
      const tags = Array.isArray(item.tags)
        ? item.tags
        : Array.isArray(body.tags)
        ? body.tags
        : ["glorov", "admin-upload"];

      const uploadOptions: Record<string, any> = {
        folder,
        resource_type: "auto",
        overwrite: true,
        tags,
      };

      if (publicId) {
        uploadOptions.public_id = publicId;
      }

      const result = await cloudinary.uploader.upload(item.file, uploadOptions);

      uploadedAssets.push({
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        created_at: result.created_at,
        folder: result.folder,
      });
    }

    if (uploadedAssets.length === 0) {
      res.status(400).json({
        message: "No valid images could be uploaded from the provided payload.",
      });
      return;
    }

    res.status(201).json({
      message:
        uploadedAssets.length === 1
          ? "Image uploaded successfully to Cloudinary."
          : `Successfully uploaded ${uploadedAssets.length} images to Cloudinary.`,
      asset: uploadedAssets[0],
      assets: uploadedAssets,
      count: uploadedAssets.length,
    });
  } catch (error: unknown) {
    sendSanitizedError(res, error, {
      req,
      operation: "POST /admin/media/upload",
    });
  }
};

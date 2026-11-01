import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { v2 as cloudinary } from "cloudinary";
import { sendSanitizedError } from "../../../../utils/error-handler";

const initCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "naodmm8w",
    api_key: process.env.CLOUDINARY_API_KEY || "179253354861549",
    api_secret: process.env.CLOUDINARY_API_SECRET || "0FkMyyEi9taeWd2f8nEN55zqOUM",
    secure: true,
  });
};

/**
 * POST /admin/media/upload
 * Accepts an image (Base64 data URI, HTTP URL, or raw string content)
 * and uploads it directly to Cloudinary into the designated folder.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    initCloudinary();
    const body = req.body as Record<string, any>;

    if (!body || !body.file) {
      res.status(400).json({
        message: "Field 'file' (Base64 Data URI or Image URL) is required.",
      });
      return;
    }

    const folder = body.folder ? `glorov/${body.folder.replace(/^glorov\/?/, "")}` : "glorov/uploads";
    const publicId = body.public_id || undefined;
    const tags = Array.isArray(body.tags) ? body.tags : ["glorov", "admin-upload"];

    const uploadOptions: Record<string, any> = {
      folder,
      resource_type: "auto",
      overwrite: true,
      tags,
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const result = await cloudinary.uploader.upload(body.file, uploadOptions);

    res.status(201).json({
      message: "Image uploaded successfully to Cloudinary.",
      asset: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        created_at: result.created_at,
        folder: result.folder,
      },
    });
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500);
  }
};

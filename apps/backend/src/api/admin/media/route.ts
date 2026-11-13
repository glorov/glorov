import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { v2 as cloudinary } from "cloudinary";
import { sendSanitizedError } from "../../../utils/error-handler";

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

export const OPTIONS = async (req: MedusaRequest, res: MedusaResponse) => {
  setCorsHeaders(req, res);
  res.status(204).end();
};

/**
 * GET /admin/media
 * Lists images stored in Cloudinary under the 'glorov' folder structure.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  setCorsHeaders(req, res);
  try {
    initCloudinary();
    const folder = (req.query?.folder as string) || "glorov";
    const maxResults = Math.min(Number(req.query?.limit) || 50, 100);

    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folder,
      max_results: maxResults,
      direction: "desc",
    });

    const resources = (result.resources || []).map((r: any) => ({
      public_id: r.public_id,
      format: r.format,
      version: r.version,
      resource_type: r.resource_type,
      created_at: r.created_at,
      bytes: r.bytes,
      width: r.width,
      height: r.height,
      folder: r.folder,
      secure_url: r.secure_url,
    }));

    res.status(200).json({
      media: resources,
      next_cursor: result.next_cursor || null,
      total_count: result.resources?.length || 0,
    });
  } catch (error: unknown) {
    sendSanitizedError(res, error, {
      req,
      operation: "GET /admin/media",
    });
  }
};

/**
 * DELETE /admin/media
 * Deletes an image from Cloudinary by public_id.
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  setCorsHeaders(req, res);
  try {
    initCloudinary();
    const publicId =
      (req.query?.public_id as string) || (req.body as any)?.public_id;

    if (!publicId) {
      res
        .status(400)
        .json({ message: "Parameter 'public_id' is required for deletion." });
      return;
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok" && result.result !== "not found") {
      res.status(400).json({ message: `Cloudinary error: ${result.result}` });
      return;
    }

    res.status(200).json({
      message: `Asset ${publicId} deleted successfully.`,
      result: result.result,
    });
  } catch (error: unknown) {
    sendSanitizedError(res, error, {
      req,
      operation: "DELETE /admin/media",
    });
  }
};

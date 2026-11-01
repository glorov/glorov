import { AbstractFileProviderService, MedusaError } from "@medusajs/framework/utils"
import type { Logger } from "@medusajs/framework/types"
import { v2 as cloudinary } from "cloudinary"
import type { CloudinaryModuleOptions } from "./types"
import { Readable } from "stream"

type InjectedDependencies = {
  logger?: Logger
}

export class CloudinaryFileService extends AbstractFileProviderService {
  public static identifier = "cloudinary"

  protected readonly logger_?: Logger
  protected readonly options_: CloudinaryModuleOptions

  constructor(
    dependencies: InjectedDependencies = {},
    options?: CloudinaryModuleOptions
  ) {
    super()
    this.logger_ = dependencies.logger
    this.options_ = options || {}

    const cloudName = this.options_.cloud_name || process.env.CLOUDINARY_CLOUD_NAME || "naodmm8w"
    const apiKey = this.options_.api_key || process.env.CLOUDINARY_API_KEY || "179253354861549"
    const apiSecret = this.options_.api_secret || process.env.CLOUDINARY_API_SECRET || "0FkMyyEi9taeWd2f8nEN55zqOUM"

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    })
  }

  async upload(file: any): Promise<{ url: string; key: string }> {
    if (!file) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No file provided")
    }

    const folder = this.options_.folder || "glorov/uploads"

    let buffer: Buffer
    if (Buffer.isBuffer(file.content)) {
      buffer = file.content
    } else if (typeof file.content === "string") {
      buffer = Buffer.from(file.content, "base64")
    } else {
      buffer = Buffer.from(file.content)
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error || !result) {
            this.logger_?.error?.(`[CloudinaryFileService] Upload failed: ${error?.message || "Unknown error"}`)
            return reject(new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Cloudinary upload failed: ${error?.message}`))
          }
          resolve({
            url: result.secure_url,
            key: result.public_id,
          })
        }
      )

      const readableStream = new Readable()
      readableStream.push(buffer)
      readableStream.push(null)
      readableStream.pipe(uploadStream)
    })
  }

  async delete(files: any): Promise<void> {
    const fileList = Array.isArray(files) ? files : [files]
    for (const file of fileList) {
      const key = typeof file === "string" ? file : file?.fileKey || file?.key
      if (!key) continue
      try {
        await cloudinary.uploader.destroy(key)
      } catch (err: any) {
        this.logger_?.warn?.(`[CloudinaryFileService] Failed to destroy ${key}: ${err?.message}`)
      }
    }
  }

  async getPresignedDownloadUrl(fileData: any): Promise<string> {
    const key = typeof fileData === "string" ? fileData : fileData?.fileKey || fileData?.key
    if (!key) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No fileKey provided")
    }
    if (key.startsWith("http://") || key.startsWith("https://")) {
      return key
    }
    return cloudinary.url(key, { secure: true })
  }
}

import { CloudinaryFileService } from "../modules/file-cloudinary/service";
import { v2 as cloudinary } from "cloudinary";

jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn((options, callback) => {
        const stream = new (require("stream").Writable)({
          write(_chunk, _encoding, next) {
            next();
          },
        });
        stream.on("finish", () => {
          callback(null, {
            secure_url: "https://res.cloudinary.com/naodmm8w/image/upload/v12345/glorov/test.jpg",
            public_id: "glorov/test",
            format: "jpg",
            width: 800,
            height: 600,
          });
        });
        return stream;
      }),
      destroy: jest.fn().mockResolvedValue({ result: "ok" }),
      upload: jest.fn().mockResolvedValue({
        secure_url: "https://res.cloudinary.com/naodmm8w/image/upload/v12345/glorov/test.jpg",
        public_id: "glorov/test",
      }),
    },
    url: jest.fn((key) => `https://res.cloudinary.com/naodmm8w/image/upload/${key}`),
    api: {
      ping: jest.fn((cb) => cb(null, { status: "ok" })),
      resources: jest.fn().mockResolvedValue({
        resources: [
          {
            public_id: "glorov/test",
            secure_url: "https://res.cloudinary.com/naodmm8w/image/upload/v12345/glorov/test.jpg",
            format: "jpg",
            bytes: 1024,
            width: 800,
            height: 600,
          },
        ],
      }),
    },
  },
}));

describe("Cloudinary File Provider & Media Operations", () => {
  let service: CloudinaryFileService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CloudinaryFileService(
      {
        logger: {
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
          debug: jest.fn(),
          activity: jest.fn(),
          progress: jest.fn(),
          failure: jest.fn(),
          success: jest.fn(),
          log: jest.fn(),
          panic: jest.fn(),
          shouldLog: jest.fn(),
          setLogLevel: jest.fn(),
          unsetLogLevel: jest.fn(),
        } as any,
      },
      {
        cloud_name: "naodmm8w",
        api_key: "179253354861549",
        api_secret: "0FkMyyEi9taeWd2f8nEN55zqOUM",
        folder: "glorov/test",
      }
    );
  });

  it("configures Cloudinary credentials on initialization", () => {
    expect(cloudinary.config).toHaveBeenCalledWith(
      expect.objectContaining({
        cloud_name: "naodmm8w",
        api_key: "179253354861549",
        api_secret: "0FkMyyEi9taeWd2f8nEN55zqOUM",
        secure: true,
      })
    );
  });

  it("uploads a buffer file and returns secure URL and public_id key", async () => {
    const file = {
      filename: "botanical-seed.jpg",
      content: Buffer.from("fake-image-binary-data"),
      mimeType: "image/jpeg",
    };

    const result = await service.upload(file);

    expect(result).toHaveProperty("url");
    expect(result.url).toContain("res.cloudinary.com");
    expect(result.key).toBe("glorov/test");
  });

  it("uploads a base64 encoded string file content", async () => {
    const base64Content = Buffer.from("botanical-image").toString("base64");
    const file = {
      filename: "rare-orchid.png",
      content: base64Content,
      mimeType: "image/png",
    };

    const result = await service.upload(file);

    expect(result.url).toContain("res.cloudinary.com");
    expect(result.key).toBe("glorov/test");
  });

  it("throws validation error when uploading empty file", async () => {
    await expect(service.upload(null)).rejects.toThrow("No file provided");
  });

  it("destroys an image in Cloudinary on delete()", async () => {
    await service.delete({ fileKey: "glorov/products/tomato-1" });

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("glorov/products/tomato-1");
  });

  it("deletes multiple files if an array is passed", async () => {
    await service.delete([
      { fileKey: "glorov/products/tomato-1" },
      { fileKey: "glorov/products/tomato-2" },
    ]);

    expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(2);
  });

  it("returns presigned / secure URL for a key", async () => {
    const directUrl = await service.getPresignedDownloadUrl({
      fileKey: "https://res.cloudinary.com/naodmm8w/image/upload/v123/img.jpg",
    });
    expect(directUrl).toBe("https://res.cloudinary.com/naodmm8w/image/upload/v123/img.jpg");

    const generatedUrl = await service.getPresignedDownloadUrl({
      fileKey: "glorov/products/tomato-1",
    });
    expect(generatedUrl).toContain("https://res.cloudinary.com");
  });
});

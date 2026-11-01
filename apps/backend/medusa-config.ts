import { loadEnv, defineConfig, MedusaError } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

/**
 * Validates that production environments fail safely when required secrets are missing or insecure.
 */
export function validateProductionConfig(env: NodeJS.ProcessEnv = process.env): void {
  if (env.NODE_ENV !== "production") return

  const missing: string[] = []
  if (!env.DATABASE_URL) missing.push("DATABASE_URL")
  if (!env.REDIS_URL) missing.push("REDIS_URL")

  if (env.DATABASE_URL && env.DATABASE_URL.includes(":6543")) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Database Configuration Error: Port 6543 (Transaction Pooler) is incompatible with Medusa v2 ORM, prepared statements, and migrations. Use Port 5432 (Session Pooler or Direct Connection)."
    )
  }

  const jwtSecret = env.JWT_SECRET || ""
  if (!jwtSecret || jwtSecret.includes("dev") || jwtSecret.length < 32) {
    missing.push("JWT_SECRET (must be >= 32 characters and non-dev)")
  }

  const cookieSecret = env.COOKIE_SECRET || ""
  if (!cookieSecret || cookieSecret.includes("dev") || cookieSecret.length < 32) {
    missing.push("COOKIE_SECRET (must be >= 32 characters and non-dev)")
  }

  const storeCors = env.STORE_CORS || ""
  const adminCors = env.ADMIN_CORS || ""
  if (storeCors.includes("*") || adminCors.includes("*")) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Security Violation: Wildcard CORS origins are forbidden in production."
    )
  }

  if (env.RAZORPAY_MOCK_MODE === "true") {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Security Violation: RAZORPAY_MOCK_MODE must never be enabled in production."
    )
  }

  if (env.SHIPROCKET_MOCK_MODE === "true") {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Security Violation: SHIPROCKET_MOCK_MODE must never be enabled in production."
    )
  }

  if (env.NOTIFICATION_MOCK_MODE === "true") {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Security Violation: NOTIFICATION_MOCK_MODE must never be enabled in production."
    )
  }

  if (missing.length > 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Fatal Security Error: Missing or insecure production configuration variables: ${missing.join(", ")}`
    )
  }
}

validateProductionConfig()

export default defineConfig({
  admin: {
    path: (process.env.ADMIN_PATH as `/${string}`) || "/app",
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
    disable: false,
  },
  projectConfig: {
    databaseUrl:
      process.env.DATABASE_URL ||
      (process.env.NODE_ENV === "test"
        ? "postgres://postgres:postgres@localhost:5432/medusa_test"
        : undefined),
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:3000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:5173,http://localhost:9000",
      authCors: process.env.AUTH_CORS || "http://localhost:3000,http://localhost:5173,http://localhost:9000",
      jwtSecret: process.env.JWT_SECRET || "super-secret-jwt-key-glorov-dev-32bytes",
      cookieSecret: process.env.COOKIE_SECRET || "super-secret-cookie-glorov-dev-32bytes",
    },
    databaseDriverOptions: {
      pool: {
        min: Number(process.env.DB_POOL_MIN) || 2,
        max: Number(process.env.DB_POOL_MAX) || 10,
        idleTimeoutMillis: 30000,
      },
      ...(process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.includes("supabase")
        ? {
            ssl: { rejectUnauthorized: false },
            connection: { ssl: { rejectUnauthorized: false } },
          }
        : {}),
    },
  },
  modules: [
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/fulfillment-manual",
            id: "manual",
          },
          {
            resolve: "./src/modules/fulfillment-shiprocket",
            id: "shiprocket",
            options: {
              email: process.env.SHIPROCKET_EMAIL,
              password: process.env.SHIPROCKET_PASSWORD,
              webhook_token: process.env.SHIPROCKET_WEBHOOK_TOKEN,
              pickup_pincode: process.env.SHIPROCKET_PICKUP_PINCODE || "411001",
              pickup_location_name:
                process.env.SHIPROCKET_PICKUP_LOCATION || "Pune Central Nursery Hub",
              mock_mode:
                process.env.SHIPROCKET_MOCK_MODE === "true" ||
                !process.env.SHIPROCKET_EMAIL ||
                process.env.NODE_ENV === "test",
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/payment-razorpay",
            id: "razorpay",
            options: {
              key_id: process.env.RAZORPAY_KEY_ID,
              key_secret: process.env.RAZORPAY_KEY_SECRET,
              webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
              auto_capture: true,
              mock_mode:
                process.env.RAZORPAY_MOCK_MODE === "true" ||
                !process.env.RAZORPAY_KEY_ID ||
                process.env.NODE_ENV === "test",
            },
          },
          {
            resolve: "./src/modules/payment-cod",
            id: "cod",
            options: {
              max_amount: Number(process.env.COD_MAX_AMOUNT_PAISE) || 500000,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/notification-email",
            id: "email-notification",
            options: {
              channels: ["email"],
              from: process.env.NOTIFICATION_FROM_EMAIL || "orders@glorov.in",
              from_name: process.env.NOTIFICATION_FROM_NAME || "GLOROV Botanical Garden",
              reply_to: process.env.NOTIFICATION_REPLY_TO || "care@glorov.in",
              smtp: {
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === "true",
                user: process.env.SMTP_USER,
                password: process.env.SMTP_PASSWORD,
              },
              mock_mode:
                process.env.NOTIFICATION_MOCK_MODE === "true" ||
                process.env.NODE_ENV === "test" ||
                !process.env.SMTP_HOST,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "./src/modules/file-cloudinary",
            id: "cloudinary",
            options: {
              cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "naodmm8w",
              api_key: process.env.CLOUDINARY_API_KEY || "179253354861549",
              api_secret: process.env.CLOUDINARY_API_SECRET || "0FkMyyEi9taeWd2f8nEN55zqOUM",
              folder: "glorov",
            },
          },
        ],
      },
    },
  ],
})


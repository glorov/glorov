import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
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
      },
      ...(process.env.NODE_ENV === "production"
        ? { connection: { ssl: { rejectUnauthorized: false } } }
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
  ],
})


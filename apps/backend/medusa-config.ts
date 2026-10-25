import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
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
    databaseDriverOptions:
      process.env.NODE_ENV === "production"
        ? { connection: { ssl: { rejectUnauthorized: false } } }
        : {},
  },
})

import crypto from "crypto";
import { validateProductionConfig } from "../../medusa-config";
import { MedusaError } from "@medusajs/framework/utils";
import { z } from "@medusajs/framework/zod";

describe("Application Security & Hardening Invariant Unit Tests", () => {
  describe("1. Production Secret & Configuration Invariants", () => {
    it("permits valid non-production environments without strict secret validation", () => {
      expect(() => {
        validateProductionConfig({
          NODE_ENV: "development",
          DATABASE_URL: "",
        });
      }).not.toThrow();
    });

    it("throws MedusaError in production when DATABASE_URL or REDIS_URL is missing", () => {
      expect(() => {
        validateProductionConfig({
          NODE_ENV: "production",
          DATABASE_URL: "",
          REDIS_URL: "redis://localhost:6379",
          JWT_SECRET: "a-very-secure-production-jwt-secret-string-32-chars",
          COOKIE_SECRET: "a-very-secure-production-cookie-secret-string-32-chars",
          STORE_CORS: "https://glorov.in",
          ADMIN_CORS: "https://admin.glorov.in",
        });
      }).toThrow(MedusaError);
    });

    it("throws MedusaError in production when JWT_SECRET or COOKIE_SECRET is insecure or short", () => {
      expect(() => {
        validateProductionConfig({
          NODE_ENV: "production",
          DATABASE_URL: "postgresql://postgres:pass@localhost:5432/db",
          REDIS_URL: "redis://localhost:6379",
          JWT_SECRET: "super-secret-jwt-key-glorov-dev-32bytes", // Contains 'dev'
          COOKIE_SECRET: "short-cookie", // Less than 32 chars
          STORE_CORS: "https://glorov.in",
          ADMIN_CORS: "https://admin.glorov.in",
        });
      }).toThrow(MedusaError);
    });

    it("throws MedusaError in production when CORS origin contains wildcard (*)", () => {
      expect(() => {
        validateProductionConfig({
          NODE_ENV: "production",
          DATABASE_URL: "postgresql://postgres:pass@localhost:5432/db",
          REDIS_URL: "redis://localhost:6379",
          JWT_SECRET: "a-very-secure-production-jwt-secret-string-32-chars",
          COOKIE_SECRET: "a-very-secure-production-cookie-secret-string-32-chars",
          STORE_CORS: "*", // Wildcard disallowed
          ADMIN_CORS: "https://admin.glorov.in",
        });
      }).toThrow(MedusaError);
    });

    it("throws MedusaError in production when mock modes are enabled", () => {
      expect(() => {
        validateProductionConfig({
          NODE_ENV: "production",
          DATABASE_URL: "postgresql://postgres:pass@localhost:5432/db",
          REDIS_URL: "redis://localhost:6379",
          JWT_SECRET: "a-very-secure-production-jwt-secret-string-32-chars",
          COOKIE_SECRET: "a-very-secure-production-cookie-secret-string-32-chars",
          STORE_CORS: "https://glorov.in",
          ADMIN_CORS: "https://admin.glorov.in",
          RAZORPAY_MOCK_MODE: "true",
        });
      }).toThrow(/RAZORPAY_MOCK_MODE/);

      expect(() => {
        validateProductionConfig({
          NODE_ENV: "production",
          DATABASE_URL: "postgresql://postgres:pass@localhost:5432/db",
          REDIS_URL: "redis://localhost:6379",
          JWT_SECRET: "a-very-secure-production-jwt-secret-string-32-chars",
          COOKIE_SECRET: "a-very-secure-production-cookie-secret-string-32-chars",
          STORE_CORS: "https://glorov.in",
          ADMIN_CORS: "https://admin.glorov.in",
          SHIPROCKET_MOCK_MODE: "true",
        });
      }).toThrow(/SHIPROCKET_MOCK_MODE/);

      expect(() => {
        validateProductionConfig({
          NODE_ENV: "production",
          DATABASE_URL: "postgresql://postgres:pass@localhost:5432/db",
          REDIS_URL: "redis://localhost:6379",
          JWT_SECRET: "a-very-secure-production-jwt-secret-string-32-chars",
          COOKIE_SECRET: "a-very-secure-production-cookie-secret-string-32-chars",
          STORE_CORS: "https://glorov.in",
          ADMIN_CORS: "https://admin.glorov.in",
          NOTIFICATION_MOCK_MODE: "true",
        });
      }).toThrow(/NOTIFICATION_MOCK_MODE/);
    });

    it("throws MedusaError in production when DATABASE_URL uses port 6543 (transaction pooler)", () => {
      expect(() => {
        validateProductionConfig({
          NODE_ENV: "production",
          DATABASE_URL: "postgresql://postgres:pass@aws-0-ap-south-1.pooler.supabase.com:6543/postgres",
          REDIS_URL: "redis://localhost:6379",
          JWT_SECRET: "a-very-secure-production-jwt-secret-string-32-chars",
          COOKIE_SECRET: "a-very-secure-production-cookie-secret-string-32-chars",
          STORE_CORS: "https://glorov.in",
          ADMIN_CORS: "https://admin.glorov.in",
        });
      }).toThrow(/Port 6543/);
    });

    it("throws MedusaError in production when Cloudinary credentials are missing or insecure", () => {
      // Missing Cloudinary credentials
      expect(() => {
        validateProductionConfig({
          NODE_ENV: "production",
          DATABASE_URL: "postgresql://postgres:pass@localhost:5432/db",
          REDIS_URL: "redis://localhost:6379",
          JWT_SECRET: "a-very-secure-production-jwt-secret-string-32-chars",
          COOKIE_SECRET: "a-very-secure-production-cookie-secret-string-32-chars",
          STORE_CORS: "https://glorov.in",
          ADMIN_CORS: "https://admin.glorov.in",
        });
      }).toThrow(/CLOUDINARY_API_SECRET/);

      // Leaked / hardcoded Cloudinary secret
      expect(() => {
        validateProductionConfig({
          NODE_ENV: "production",
          DATABASE_URL: "postgresql://postgres:pass@localhost:5432/db",
          REDIS_URL: "redis://localhost:6379",
          JWT_SECRET: "a-very-secure-production-jwt-secret-string-32-chars",
          COOKIE_SECRET: "a-very-secure-production-cookie-secret-string-32-chars",
          STORE_CORS: "https://glorov.in",
          ADMIN_CORS: "https://admin.glorov.in",
          CLOUDINARY_CLOUD_NAME: "glorov-prod-media",
          CLOUDINARY_API_KEY: "prod_key_12345",
          CLOUDINARY_API_SECRET: "0FkMyyEi9taeWd2f8nEN55zqOUM",
        });
      }).toThrow(/Insecure, leaked or placeholder CLOUDINARY_API_SECRET/);
    });

    it("passes cleanly in production when all security requirements are satisfied", () => {
      expect(() => {
        validateProductionConfig({
          NODE_ENV: "production",
          DATABASE_URL: "postgresql://postgres:pass@localhost:5432/db",
          REDIS_URL: "redis://localhost:6379",
          JWT_SECRET: "a-very-secure-production-jwt-secret-string-32-chars",
          COOKIE_SECRET: "a-very-secure-production-cookie-secret-string-32-chars",
          STORE_CORS: "https://glorov.in,https://www.glorov.in",
          ADMIN_CORS: "https://admin.glorov.in",
          CLOUDINARY_CLOUD_NAME: "glorov-prod-media",
          CLOUDINARY_API_KEY: "prod_cloudinary_key_12345",
          CLOUDINARY_API_SECRET: "prod_cloudinary_secret_secure_value_67890",
        });
      }).not.toThrow();
    });
  });

  describe("2. Constant-Time Webhook Token Verification", () => {
    function safeCompareTokens(a: string, b: string): boolean {
      if (typeof a !== "string" || typeof b !== "string") return false;
      const bufA = Buffer.from(a, "utf8");
      const bufB = Buffer.from(b, "utf8");
      if (bufA.length !== bufB.length) return false;
      return crypto.timingSafeEqual(bufA, bufB);
    }

    it("returns true for matching tokens", () => {
      const secret = "glorov_prod_webhook_secret_key_849204";
      expect(safeCompareTokens(secret, secret)).toBe(true);
    });

    it("returns false for non-matching tokens of same length", () => {
      const secret = "glorov_prod_webhook_secret_key_849204";
      const forged = "glorov_prod_webhook_secret_key_000000";
      expect(safeCompareTokens(forged, secret)).toBe(false);
    });

    it("returns false for non-matching tokens of different length without throwing", () => {
      const secret = "glorov_prod_webhook_secret_key_849204";
      const short = "short_token";
      expect(safeCompareTokens(short, secret)).toBe(false);
    });
  });

  describe("3. Zod Input Schema Hardening for Payment Verification", () => {
    const RazorpayVerifySchema = z.object({
      cart_id: z.string().min(5).max(128),
      razorpay_order_id: z.string().min(5).max(128),
      razorpay_payment_id: z.string().min(5).max(128),
      razorpay_signature: z.string().min(10).max(256),
    });

    it("validates well-formed payment verification payload", () => {
      const validPayload = {
        cart_id: "cart_01M5TZG789ABCDEF",
        razorpay_order_id: "order_K8s92JkL4mOpQr",
        razorpay_payment_id: "pay_K8s92XyZ9AbCdE",
        razorpay_signature: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      };
      const result = RazorpayVerifySchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects payload missing cart_id or razorpay_signature", () => {
      const invalidPayload = {
        razorpay_order_id: "order_K8s92JkL4mOpQr",
        razorpay_payment_id: "pay_K8s92XyZ9AbCdE",
      };
      const result = RazorpayVerifySchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues.map((i) => i.path[0]);
        expect(issues).toContain("cart_id");
        expect(issues).toContain("razorpay_signature");
      }
    });

    it("rejects excessively long or malformed identifiers", () => {
      const oversizedPayload = {
        cart_id: "a".repeat(200), // Exceeds max 128
        razorpay_order_id: "order_123",
        razorpay_payment_id: "pay_123",
        razorpay_signature: "sig_123", // Less than min 10
      };
      const result = RazorpayVerifySchema.safeParse(oversizedPayload);
      expect(result.success).toBe(false);
    });
  });
});

# GLOROV Storefront: Environment Variables Specification

## 1. Overview

This document specifies all environment variables used by the **GLOROV Next.js Storefront** (`apps/storefront`) and outlines the required configuration for both local development and production environments.

In Next.js App Router:
- Variables prefixed with `NEXT_PUBLIC_` are embedded into client JavaScript bundles during build time and are visible to web browsers.
- Variables without `NEXT_PUBLIC_` are server-only and remain inaccessible to browser clients.

---

## 2. Storefront Environment Variables (`apps/storefront/.env.*`)

| Variable Name | Type | Scope | Required? | Default / Dev Value | Production Example | Description |
| :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | String (URL) | Public Client | **Yes** | `http://localhost:9000` | `https://api.glorov.in` | Base URL of the Medusa commerce backend. |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | String (Key) | Public Client | **Yes** | `pk_test_placeholder...` | `pk_live_88a91b...` | Public API key linking storefront requests to the India sales channel. |
| `NEXT_PUBLIC_BASE_URL` | String (URL) | Public Client | **Yes** | `http://localhost:3000` | `https://glorov.in` | Canonical base URL used for OpenGraph metadata, sitemaps, and canonical links. |
| `NEXT_PUBLIC_SITE_NAME` | String | Public Client | Optional | `"GLOROV — Indian Seeds & Live Plants"` | `"GLOROV — Indian Seeds & Live Plants"` | Site brand title used in SEO templates and social sharing headers. |
| `NEXT_PUBLIC_DEFAULT_REGION` | String | Public Client | Optional | `in` | `in` | Default two-letter ISO region code for currency and shipping calculations (India). |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | String | Public Client | Optional | `inr` | `inr` | Default 3-letter currency code (Indian Rupee). |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | String (Key) | Public Client | Optional | `rzp_test_...` | `rzp_live_...` | Public merchant key used to initialize the Razorpay client checkout modal. |

---

## 3. Backend Environment Variables (`apps/backend/.env`)

For reference, the Medusa backend requires the following server-only configuration. **These variables must NEVER be added to the storefront environment:**

| Variable Name | Scope | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | Server-Only | PostgreSQL 16 database connection string (`postgres://...`). |
| `REDIS_URL` | Server-Only | Redis connection string (`redis://localhost:6379`) for caching and job queues. |
| `JWT_SECRET` | Server-Only | Cryptographic secret used to sign and verify customer session JWT tokens. |
| `COOKIE_SECRET` | Server-Only | Cryptographic secret for signing session cookies. |
| `STORE_CORS` | Server-Only | Comma-separated list of allowed storefront origins (`https://glorov.in,https://www.glorov.in`). |
| `ADMIN_CORS` | Server-Only | Allowed origins for Medusa Admin dashboard (`http://localhost:9000,http://localhost:7001`). |
| `RAZORPAY_KEY_SECRET` | Server-Only | Private merchant HMAC secret used to verify payment signatures cryptographically. |

---

## 4. Security & Secret Rotation Rules

1. **Zero Secret Leakage**:
   - Never commit `.env`, `.env.local`, or `.env.production` files to version control.
   - Use `.env.example` as the sole tracked template.
2. **Secret Rotation Procedure**:
   - If `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is revoked in Medusa Admin, generate a new key and trigger a storefront rebuild.
   - If Razorpay keys are rotated, update both `NEXT_PUBLIC_RAZORPAY_KEY_ID` (storefront) and `RAZORPAY_KEY_SECRET` (backend) concurrently.
3. **Validation at Build Time**:
   - The storefront will fallback gracefully to sensible defaults during local dev, but production builds validate that `NEXT_PUBLIC_MEDUSA_BACKEND_URL` and `NEXT_PUBLIC_BASE_URL` are valid URLs.

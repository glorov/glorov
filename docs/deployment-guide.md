# GLOROV Storefront: Production Deployment Guide

## 1. Prerequisites

Before deploying the GLOROV Next.js storefront, verify that the following infrastructure components are operational:

- **Node.js**: Version `20.x` or later (`node -v`).
- **Package Manager**: pnpm `9.x` or later (`pnpm -v`).
- **Medusa Commerce Backend (`apps/backend`)**: Operational and reachable at `NEXT_PUBLIC_MEDUSA_BACKEND_URL` (Port 9000).
- **PostgreSQL**: Version 16+ running and seeded with catalog data.
- **Redis**: Version 7+ running for session caching and event queues.
- **Cloudinary CDN**: Media storage account active with images served from `res.cloudinary.com/naodmm8w/`.
- **Razorpay Merchant Account**: Active for online payment processing (test/live keys).

---

## 2. Environment Variables Configuration

Create a `.env.production` file in `apps/storefront/` based on [`.env.example`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/.env.example):

```bash
# ------------------------------------------------------------------------------
# GLOROV Storefront Production Environment
# ------------------------------------------------------------------------------

# Production Medusa Backend API
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.glorov.in

# Medusa Publishable API Key (from Medusa Admin -> Settings -> Publishable Keys)
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_live_your_publishable_key_here

# Storefront Canonical Base URL
NEXT_PUBLIC_BASE_URL=https://glorov.in

# Site Brand Name
NEXT_PUBLIC_SITE_NAME="GLOROV — Indian Seeds & Live Plants"

# Default Locale & Currency
NEXT_PUBLIC_DEFAULT_REGION=in
NEXT_PUBLIC_DEFAULT_CURRENCY=inr

# Razorpay Payment Gateway Public Key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_razorpay_key_id
```

> [!CAUTION]
> Never place private keys (`RAZORPAY_KEY_SECRET`, database passwords, or JWT secrets) into `apps/storefront/.env*`. Those belong strictly in `apps/backend/.env`.

---

## 3. Build & Test Commands

From the workspace root directory:

```bash
# 1. Install workspace dependencies
pnpm install --frozen-lockfile

# 2. Run TypeScript check across all packages
pnpm storefront:typecheck

# 3. Run ESLint across storefront code
pnpm storefront:lint

# 4. Run automated test suite
pnpm storefront:test

# 5. Compile optimized Next.js production bundle
pnpm storefront:build
```

Successful build output should generate 44 static and dynamic routes with **~101 kB shared first load JS**.

---

## 4. Hosting Architectures

### Architecture Option A: Vercel / Managed Cloud (Recommended)
- **Advantages**: Native Next.js 15 optimization, global edge CDN caching for static routes (`○ Static` & `● SSG`), automatic image compression, zero-maintenance SSL certificates.
- **Setup Steps**:
  1. Link the GitHub repository to Vercel.
  2. Set Root Directory to `apps/storefront`.
  3. Set Framework Preset to `Next.js`.
  4. Configure Environment Variables matching the production configuration.
  5. Deploy.

### Architecture Option B: Self-Hosted Docker / Linux VM
- **Advantages**: Complete infrastructure control within existing VPS/cloud network.
- **Setup Steps**:
  1. Build Docker image using Next.js standalone output mode:
     ```dockerfile
     # apps/storefront/Dockerfile
     FROM node:20-alpine AS runner
     WORKDIR /app
     ENV NODE_ENV=production
     COPY .next/standalone ./
     COPY .next/static ./.next/static
     COPY public ./public
     EXPOSE 3000
     CMD ["node", "server.js"]
     ```
  2. Run container behind Nginx reverse proxy:
     ```nginx
     server {
         server_name glorov.in www.glorov.in;
         location / {
             proxy_pass http://127.0.0.1:3000;
             proxy_http_version 1.1;
             proxy_set_header Upgrade $http_upgrade;
             proxy_set_header Connection 'upgrade';
             proxy_set_header Host $host;
             proxy_cache_bypass $http_upgrade;
         }
     }
     ```
  3. Manage process lifecycle using PM2 or Docker Compose.

---

## 5. Domain, DNS & CORS Configuration

### 5.1 DNS Records
| Type | Name | Value | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A / CNAME** | `@` (glorov.in) | Vercel IP (`76.76.21.21`) or VM IP | 300s | Apex Storefront Domain |
| **CNAME** | `www` (www.glorov.in) | `cname.vercel-dns.com` or Apex | 300s | Widescreen Storefront Subdomain |
| **A** | `api` (api.glorov.in) | Backend Server IP | 300s | Medusa v2 Commerce Backend |

### 5.2 Medusa Backend CORS Configuration
Update `apps/backend/.env` to authorize the new storefront domain:
```bash
STORE_CORS="https://glorov.in,https://www.glorov.in,http://localhost:3000"
```

---

## 6. Post-Deployment Smoke Testing & Health Check

After deployment, perform verification on the live domain:
1. **Health Endpoint**: `GET https://glorov.in/api/health` should return `200 OK` with status `healthy`.
2. **Sitemap & Robots**: `GET https://glorov.in/sitemap.xml` and `GET https://glorov.in/robots.txt` should return valid XML and text.
3. **Core Workflow**: Navigate Homepage ➔ Category ➔ PDP ➔ Add to Bag ➔ Checkout ➔ Verify INR calculations.

---

## 7. Rollback Procedure

If unexpected runtime issues occur post-launch, refer to the [Rollback Guide](file:///Users/sourav/Developer/WEB/top-projects/glorov/docs/rollback-guide.md). Instant DNS reversion or container rollback can be executed within 60 seconds without affecting the backend database.

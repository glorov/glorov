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

---

## 8. 1GB Azure VM Optimization & Resource Allocation

### 8.1 Memory Budget Breakdown (1GB Physical RAM + 1GB Swap)

When hosting all services on a single cost-effective 1GB Azure VM (such as Standard_B1s with 1 vCPU and 1024MB RAM), memory must be carefully partitioned to avoid kernel OOM-killer termination:

| Service / Process | Allocation | Heap / Cache Configuration | Role & Invariants |
| :--- | :--- | :--- | :--- |
| **PostgreSQL 16** | **384 MB** (container limit) | `shared_buffers=96MB`, `max_connections=50`, `work_mem=4MB` | Database persistence. Preserves safe minimum `shared_buffers` (25% of container RAM) for relational queries while capping connections. |
| **Redis 7** | **128 MB** (container limit) | `maxmemory 96mb`, `maxmemory-policy allkeys-lru` | Session cache, workflow events, rate limiting. LRU eviction prevents OOM container kills. |
| **Medusa v2 Backend** | **256 MB** (`--max-old-space-size=256`) | Node.js V8 old-space heap capped at 256MB | Minimum required memory for Medusa v2 modules, routing, and workflows. |
| **Next.js Storefront** | **128 MB** (`--max-old-space-size=128`) | Node.js V8 old-space heap capped at 128MB | Standalone Next.js 15 SSR runtime (<80MB typical RSS memory). |
| **Host OS & Caddy/Nginx**| **~128 MB** | Minimal Linux kernel overhead, reverse proxy | Caddy/Nginx TLS termination, static asset serving, and system daemons. |
| **TOTAL ALLOCATION** | **~896 MB** | Fits safely within 1024MB physical RAM | Leaves ~128MB safety buffer for transient system spikes. |

### 8.2 Swap Configuration (Mandatory for 1GB VMs)

Azure B1s Linux virtual machines do not enable swap by default. Without swap, transient spikes (such as during Next.js builds, database migrations, or PM2 process reloads) will trigger the Linux kernel Out-Of-Memory (OOM) killer.

**Configure at least 1GB (recommended 2GB) swap on the VM host:**

```bash
# 1. Verify current swap status
sudo swapon --show
free -h

# 2. Allocate a 2GB swap file (or 1GB minimum)
sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048

# 3. Secure swap permissions (root only)
sudo chmod 600 /swapfile

# 4. Initialize swap area
sudo mkswap /swapfile

# 5. Enable swap immediately
sudo swapon /swapfile

# 6. Make swap persistent across VM reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 7. Tune swappiness and cache pressure for low-RAM VMs
# Low swappiness (20) keeps hot memory pages in RAM and only swaps on true pressure
sudo sysctl vm.swappiness=20
sudo sysctl vm.vfs_cache_pressure=50
echo 'vm.swappiness=20' | sudo tee -a /etc/sysctl.conf
echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf
```

### 8.3 Process Manager (PM2) Architecture: Cluster vs Fork Mode

- **Next.js Storefront (`glorov-storefront`)**:
  - **Mode:** `fork` mode.
  - **Rationale:** Next.js standalone server (`server.js`) embeds its own Node.js HTTP server and asynchronous request multiplexer. Running in `fork` mode maintains minimal baseline memory (~40MB idle) without IPC coordination overhead.
- **Medusa v2 Backend (`glorov-backend`)**:
  - **Mode:** `fork` mode for single vCPU instances; `cluster` mode (`instances: 1`) when zero-downtime hot-reloading is required.
  - **Rationale:** On a 1 vCPU Azure B1s VM, running multiple workers (`-i 2` or `-i max`) is strictly anti-pattern: workers compete for the single CPU core and consume double memory (2 × 256MB = 512MB).
  - During PM2 reload (`pm2 reload glorov-backend --update-env`), PM2 spawns the new worker before tearing down the old one. The transient ~512MB backend memory overlap is safely buffered by the 2GB swap file without degrading customer traffic.
- **Zero-Downtime Reload Command:**
  - Deployment scripts (`deploy/reload-services.sh` and `deploy/deploy-server.sh`) use `pm2 reload` instead of `pm2 restart` to prevent dropping active customer checkout connections and HTTP requests.

---

## 9. Security & Infrastructure Hardening

### 9.1 SSH Key Management & Rotation Policy (GLOROV-DEPLOY-005)

To maintain secure access boundaries between GitHub Actions CI/CD runners and the production Azure VM:

1. **Current Credential Architecture:**
   - Secrets `AZURE_SSH_KEY` / `SERVER_SSH_KEY` authenticate GitHub Actions to `elsesourav@20.244.48.139`.
   - The public key is stored in `/home/elsesourav/.ssh/authorized_keys`.
2. **Rotation Schedule:**
   - Mandatory rotation every **90 days**.
   - Requires modern **Ed25519** key pairs (`ssh-ed25519`).
3. **Rotation Runbook:**
   - Detailed procedure documented in [`docs/ssh-key-management.md`](file:///docs/ssh-key-management.md).
   - Generates new key pair -> Appends public key to VM -> Updates GitHub Actions secret -> Validates workflow run -> Removes retired key.
4. **Future Zero-Secret Roadmap:**
   - Adopt **GitHub Actions OIDC with Azure Federated Credentials** to transition to passwordless/keyless deployments.

### 9.2 Content Delivery Network (CDN) & Cache-Control Architecture (GLOROV-PERF-005)

Serving static CSS, JS chunks, and botanical media directly from the single 1GB Azure VM incurs CPU and bandwidth bottlenecks during traffic spikes. A Content Delivery Network (CDN) offloads 85%+ of HTTP requests to edge PoPs closer to Indian consumers.

#### CDN Provider Evaluation

| Provider | Pros | Cons | Recommended Setup |
| :--- | :--- | :--- | :--- |
| **Option A: Cloudflare (Free / Pro)** | Zero infrastructure cost, 100+ edge locations across India, integrated DDoS mitigation, automatic WebP/AVIF and Brotli compression. | Requires nameserver delegation to Cloudflare. | **Recommended for Launch:** Set DNS proxy to orange-cloud `glorov.in`. |
| **Option B: Azure CDN (Standard)** | Native integration with Azure VM and Blob Storage; single Azure billing invoice. | Higher egress cost per GB compared to dedicated edge CDNs. | Ideal if migrating media storage to Azure Blob Containers. |
| **Option C: BunnyCDN** | Exceptional Indian latency (Mumbai, Bangalore, Delhi PoPs), low pricing ($0.01/GB), instant cache purges via API. | Requires configuring CNAME `cdn.glorov.in` and custom origin pull. | High-performance alternative for high-volume catalogs. |

#### Storefront Configuration
In [`apps/storefront/next.config.ts`](file:///apps/storefront/next.config.ts), set `assetPrefix`:
```ts
// apps/storefront/next.config.ts
assetPrefix: process.env.CDN_URL || '',
```
When configured with `CDN_URL=https://cdn.glorov.in`, Next.js routes all script and stylesheet requests (`/_next/static/*`) directly to the edge CDN.

#### Cache-Control Header Recommendations

##### Nginx (`deploy/nginx-glorov.tech.conf`)
```nginx
# 1. Immutable Next.js static chunks (content-hashed)
location ^~ /_next/static/ {
    alias /var/www/glorov/current/storefront-next/apps/storefront/.next/static/;
    add_header Cache-Control "public, max-age=31536000, immutable";
    access_log off;
}

# 2. Public static media (images, fonts, botanical guides)
location ^~ /images/ {
    alias /var/www/glorov/current/storefront-next/apps/storefront/public/images/;
    add_header Cache-Control "public, max-age=86400, stale-while-revalidate=604800";
    access_log off;
}
```

##### Caddy (`deploy/Caddyfile`)
```caddy
# Cache immutable Next.js chunks for 1 year
@static path /_next/static/*
header @static Cache-Control "public, max-age=31536000, immutable"

# Cache public images for 24 hours with stale-while-revalidate
@media path /images/* /fonts/* *.ico *.svg
header @media Cache-Control "public, max-age=86400, stale-while-revalidate=604800"
```



# GLOROV Staging Environment Specification & Runbook

**Reference Issue:** `GLOROV-DEPLOY-009` (MEDIUM)  
**Applicability:** Monorepo Staging Infrastructure, Pre-release QA, Automated DAST Scanning

---

## 1. Overview & Architecture

To prevent breaking regressions, unvetted database migrations, or third-party API mismatches from reaching production (`https://glorov.in`), GLOROV supports a dedicated staging environment mirror.

### Deployment Options

| Strategy | Architecture | Cost | Isolation | Recommended Use |
| :--- | :--- | :--- | :--- | :--- |
| **Option A: Dedicated Azure VM (Standard_B1ms)** | Separate 1 vCPU / 2GB RAM VM on Azure | ~$14.60 / month | Complete isolation from production | High traffic / pre-launch releases |
| **Option B: Co-located Docker Compose Profile** | Runs alongside production on same VM using dedicated ports (`3001`, `9001`, `15432`, `16379`) | **$0 / month** | Shared CPU/RAM, isolated network & volumes | Development & pre-merge PR testing |

---

## 2. Port & Network Allocation (`docker-compose.staging.yml`)

The staging stack runs isolated from the production network with dedicated loopback ports:

| Service | Staging Host Port | Container Internal Port | Production Equivalent |
| :--- | :--- | :--- | :--- |
| **Storefront (Next.js 15)** | `3001` | `3000` | `3000` |
| **Backend (Medusa v2)** | `9001` | `9000` | `9000` |
| **PostgreSQL 16** | `15432` | `5432` | `5432` (internal) |
| **Redis 7** | `16379` | `6379` | `6379` (internal) |

### Resource Allocation (512MB RAM Staging Footprint)
- **PostgreSQL 16:** Max 192MB RAM (`shared_buffers=48MB`, `max_connections=25`)
- **Redis 7:** Max 64MB RAM (`maxmemory 48mb`, `allkeys-lru`)
- **Medusa Backend:** Max 160MB RAM (`--max-old-space-size=160`)
- **Next.js Storefront:** Max 96MB RAM (`--max-old-space-size=96`)

---

## 3. Staging Environment Variables Template (`.env.staging`)

Create `/var/www/staging/.env.staging` or set these in your staging deployment profile:

```env
# ==============================================================================
# GLOROV STAGING CONFIGURATION
# ==============================================================================
NODE_ENV=production
PORT=9000
DATABASE_URL=postgresql://postgres:staging_secure_password_2026@postgres:5432/glorov_medusa_staging
REDIS_URL=redis://:staging_redis_secret_2026@redis:6379

# Security Secrets (Must differ from Production)
JWT_SECRET=staging_supersecret_jwt_token_must_be_32_characters_minimum!
COOKIE_SECRET=staging_supersecret_cookie_token_must_be_32_characters_min!

# CORS Whitelist
STORE_CORS=https://staging.glorov.in,http://localhost:3001
ADMIN_CORS=https://staging-admin.glorov.in,http://localhost:9001
AUTH_CORS=https://staging.glorov.in,https://staging-admin.glorov.in,http://localhost:3001

# Razorpay Test Mode Credentials
# Dashboard: https://dashboard.razorpay.com/app/keys (Toggle 'Test Mode')
RAZORPAY_KEY_ID=rzp_test_YourTestKeyIdHere
RAZORPAY_KEY_SECRET=YourTestKeySecretHere
RAZORPAY_WEBHOOK_SECRET=YourStagingWebhookSecret
RAZORPAY_MOCK_MODE=true

# Shiprocket Sandbox Credentials
SHIPROCKET_EMAIL=staging-fulfillment@glorov.in
SHIPROCKET_PASSWORD=StagingShiprocketPassword123
SHIPROCKET_WEBHOOK_TOKEN=staging_shiprocket_secure_token_2026
SHIPROCKET_PICKUP_LOCATION="Pune Staging Nursery Hub"
SHIPROCKET_PICKUP_PINCODE="411001"
SHIPROCKET_MOCK_MODE=true

# Notification Provider Mock
NOTIFICATION_FROM_EMAIL=staging-orders@glorov.in
NOTIFICATION_MOCK_MODE=true

# Cloudinary Staging Assets
CLOUDINARY_CLOUD_NAME=glorov-staging
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=staging_cloudinary_api_secret

# Storefront Settings
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://staging-api.glorov.in
NEXT_PUBLIC_BASE_URL=https://staging.glorov.in
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_staging_medusa_publishable_key
```

---

## 4. Deployment Methods

### Method 1: Local / On-VM Deployment via Docker Compose

```bash
# 1. Clone repository to /var/www/staging
git clone https://github.com/elsesourav/glorov.git /var/www/staging
cd /var/www/staging

# 2. Checkout staging branch or release candidate
git checkout staging

# 3. Launch isolated staging containers
docker compose -f docker-compose.staging.yml --env-file .env.staging up -d --build

# 4. View container status
docker compose -f docker-compose.staging.yml ps
```

### Method 2: GitHub Actions Automated CI/CD

To deploy on push to the `staging` branch:
1. Provision target VM and configure DNS records:
   - `staging.glorov.in` -> A record to Staging VM IP
   - `staging-api.glorov.in` -> A record to Staging VM IP
   - `staging-admin.glorov.in` -> A record to Staging VM IP
2. In GitHub Repository Settings -> Secrets:
   - Add `AZURE_STAGING_HOST`
   - Add `AZURE_STAGING_SSH_KEY`
   - Add `AZURE_STAGING_USER`
3. Uncomment the `deploy-staging` job block in `.github/workflows/deploy.yml`.

---

## 5. Database Seeding & Reset Strategy

Staging databases can be reset or seeded safely without affecting production data:

### Seed Sample Botanical Catalog
```bash
docker exec -it glorov-staging-backend \
  pnpm exec npx tsx src/scripts/seed-india-region.ts
```

### Anonymized Production Database Clone
To test realistic load and pagination on staging using a sanitized copy of production:
```bash
# 1. Create sanitized dump on production
pg_dump -h localhost -U postgres -d glorov_medusa_prod \
  --exclude-table-data='customer_password' \
  -F c -b -v -f /tmp/prod_sanitized.dump

# 2. Restore into staging database
pg_restore -h localhost -p 15432 -U postgres -d glorov_medusa_staging -c /tmp/prod_sanitized.dump
```

---

## 6. Pre-Release Smoke Verification Suite

Run these smoke tests against the running staging instance:

```bash
# 1. Storefront Health & SSR Check
curl -I https://staging.glorov.in/api/health
curl -s https://staging.glorov.in | grep -i "GLOROV"

# 2. Backend Health & Database Connectivity
curl -s https://staging-api.glorov.in/health

# 3. Store API Catalog Check
curl -s "https://staging-api.glorov.in/store/products" \
  -H "x-publishable-api-key: pk_staging_medusa_publishable_key" | jq '.count'

# 4. Run Storefront E2E Tests Against Staging
PLAYWRIGHT_BASE_URL="https://staging.glorov.in" \
  pnpm --filter @glorov/storefront test:e2e
```

---

## 7. Dynamic Application Security Testing (DAST) Guidance

Before promoting staging builds to production, execute an automated OWASP ZAP (Zed Attack Proxy) baseline scan to identify security misconfigurations, missing HTTP headers, or exposed sensitive routes.

### Running OWASP ZAP Baseline Scan via Docker
```bash
docker run --rm -v $(pwd)/zap-reports:/zap/wrk/:rw \
  ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t https://staging.glorov.in \
  -g gen.conf \
  -r staging-zap-report.html \
  -I
```

### Key DAST Checks Performed
1. **Security Headers:** Strict-Transport-Security, Content-Security-Policy, X-Frame-Options, X-Content-Type-Options.
2. **Cookie Flags:** `Secure`, `HttpOnly`, `SameSite=Lax/Strict`.
3. **Cross-Origin Information Leakage:** CORS misconfigurations on `/store/*` and `/admin/*`.
4. **Vulnerable JS Dependencies:** Third-party client runtime libraries.
5. **Admin Exposure:** Ensuring `/admin` is properly protected behind authentication and rate-limited.

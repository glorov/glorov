# GLOROV Production Readiness Audit & Launch Checklist

> **Target Release:** GLOROV v1.0.0 (Indian E-Commerce Launch)  
> **Target Market:** Republic of India (Domestic Retail: Heirloom Seeds & Live Plants)  
> **Fulfillment Hub:** Pune Central Nursery Hub, Maharashtra (PIN 411001)  
> **Architecture:** Medusa v2 Headless Commerce Engine + Next.js 15 Storefront + PostgreSQL 16 + Redis 7 + Caddy TLS  
> **Document Status:** Comprehensive Pre-Launch Engineering Audit  
> **Last Verified:** October 2026 (673/673 Automated Tests Passing)

---

## Executive Summary

This document establishes the official production readiness evaluation for the **GLOROV** botanical commerce platform prior to public commercial launch. It audits application architecture, security controls, business compliance under Indian law, third-party payment and fulfillment integrations, automated test suites, and operational runbooks.

### System Verification Scorecard

| Area | Status | Verification Summary |
|---|---|---|
| **Catalog & Botanical Variants** | `VERIFIED` | Native Medusa product models, packet-size variants, HSN 1209/0602 tax classification, CSV import pipeline. |
| **Inventory & Concurrency** | `VERIFIED` | Atomic reservations, zero-stock basket guard, 6-thread concurrency stress test (0 overselling). |
| **Customer Authentication** | `VERIFIED` | Native scrypt password hashing, HttpOnly/SameSite/Secure session cookies, anti-IDOR ownership checks. |
| **Cart & Checkout Pipeline** | `VERIFIED` | Full INR monetary calculations, Zod Indian address validation, multi-step checkout workflow. |
| **Indian Currency & Regional Settings** | `VERIFIED` | Default currency `inr`, 6-digit PIN validation, Indian state selection, INR formatting. |
| **Payment Provider (Razorpay)** | `HIGH PRIORITY` | Module code verified with HMAC-SHA256 signature validation; requires live merchant KYC and production API keys. |
| **Cash on Delivery (COD)** | `VERIFIED` | Hard ₹5,000 order cap (500,000 paise), uncaptured settlement lifecycle, pincode serviceability check. |
| **Logistics & Fulfillment (Shiprocket)** | `HIGH PRIORITY` | Shiprocket provider verified with rate fallbacks; requires live merchant onboarding and Pune pickup registration. |
| **Shipment Tracking** | `VERIFIED` | Public AWB lookup with rate limiting, sanitized courier events, webhook token verification. |
| **Transactional Notifications** | `HIGH PRIORITY` | Email notification provider verified; requires production SMTP (AWS SES ap-south-1) and DNS authentication (DKIM/SPF). |
| **Cancellations, Returns & Refunds** | `VERIFIED` | Native cancel/return/refund workflows, horticultural triage (perishable write-off vs seed restock). |
| **Customer Privacy & Security** | `VERIFIED` | Remediations SEC-01 through SEC-09 active, timing-safe crypto comparisons, strict CSP headers. |
| **Storefront Responsive UX & a11y** | `VERIFIED` | Tested across 375px/768px/1280px viewports, WCAG 2.1 AA contrast, 44px touch targets, full ARIA roles. |
| **SEO & Performance** | `VERIFIED` | JSON-LD Product & Breadcrumb schemas, dynamic OpenGraph, sitemap.xml, robots.txt, Next.js image optimization. |
| **Database & Disaster Recovery** | `MEDIUM PRIORITY` | Docker volume persistence and backup scripts verified; requires automated cron and offsite S3 sync on host. |
| **Observability & Logging** | `VERIFIED` | Structured Pino JSON logging, correlation ID tracing, sensitive PII redaction, deep health probes. |
| **Deployment & Rollback** | `VERIFIED` | Docker Compose production topology, Caddy automated TLS, Blue/Green zero-downtime deployment and rollback playbook. |

---

## 1. Pre-Launch Severity Classification & Blockers

Every issue and prerequisite is categorized according to deployment risk:

- 🛑 **Critical Blocker:** Must be resolved before opening the store to real customer traffic. Blocks launch.
- 🔶 **High Priority:** Strongly recommended before launch; can operate under temporary manual oversight for controlled beta.
- 🔷 **Medium Priority:** Non-blocking for initial transactions; must be resolved within 14 days post-launch.
- 🟢 **Low Priority:** Cosmetic or ergonomic enhancement scheduled for future maintenance sprints.
- ✅ **Verified:** Implemented, audited in code, and verified by passing automated tests.

```mermaid
flowchart TD
    A[Launch Prerequisites Evaluation] --> B{Third-Party Live Accounts Active?}
    B -- No --> C[🛑 Critical Blocker: Razorpay & Shiprocket Live KYC]
    B -- Yes --> D{Legal Policies & GSTIN Finalized?}
    D -- No --> E[🛑 Critical Blocker: Indian Legal & Tax Policies]
    D -- Yes --> F{Production Secrets & CORS Configured?}
    F -- No --> G[🛑 Critical Blocker: Secure Secrets & Domain Setup]
    F -- Yes --> H{Automated Smoke Tests Pass?}
    H -- No --> I[🛑 Critical Blocker: Resolve Runtime Failures]
    H -- Yes --> J[✅ Green Light for Controlled Staging Dry-Run]
```

### Detailed Issue Register

| ID | Category | Item | Severity | Owner | Required Action |
|---|---|---|---|---|---|
| **BLK-01** | Payments | Razorpay Live Account Activation | 🛑 Critical Blocker | Business Owner | Complete Razorpay business KYC, link Indian current bank account, obtain `rzp_live_*` API credentials. |
| **BLK-02** | Logistics | Shiprocket Live Account & Pickup Hub | 🛑 Critical Blocker | Business Owner / Ops | Activate Shiprocket enterprise account, configure Pune Nursery pickup hub (`411001`), configure courier SLAs. |
| **BLK-03** | Legal | Statutory Policies & Grievance Officer | 🛑 Critical Blocker | Business Owner / Legal | Replace placeholder modals with finalized Terms of Service, Privacy Policy (DPDP Act 2023), and Grievance Officer contacts. |
| **BLK-04** | Tax | GSTIN Registration & Invoicing Entity | 🛑 Critical Blocker | Business Owner / CA | Enter valid 15-character GSTIN, legal company name, and ensure tax invoices generate correctly. |
| **BLK-05** | Security | Production Secret Generation | 🛑 Critical Blocker | DevOps Lead | Generate 32-byte cryptographic hex strings for `JWT_SECRET` and `COOKIE_SECRET`; ensure zero "dev" tokens. |
| **BLK-06** | Infrastructure | DNS & Domain TLS Setup | 🛑 Critical Blocker | DevOps Lead | Point `glorov.in` and `api.glorov.in` A records to production VPS; verify automatic Let's Encrypt TLS via Caddy. |
| **HIP-01** | Notifications | Production SMTP & DNS Records | 🔶 High Priority | DevOps Lead | Configure AWS SES (ap-south-1) with verified domain `glorov.in`, adding SPF, DKIM, and DMARC TXT records. |
| **HIP-02** | Operations | Nursery Dispatch Packing Station | 🔶 High Priority | Ops Lead | Set up thermal label printer, breathable moisture-packs, shockproof carton stock for live plant transit. |
| **MED-01** | Reliability | Offsite Database Backup Sync | 🔷 Medium Priority | DevOps Lead | Configure daily cron script pushing compressed PostgreSQL dumps to an AWS S3 bucket in Mumbai (`ap-south-1`). |
| **MED-02** | Analytics | Web Analytics & Conversion Tracking | 🔷 Medium Priority | Marketing | Deploy privacy-preserving, cookie-free web analytics (e.g. Plausible or PostHog EU/self-hosted). |
| **LOW-01** | Catalog | Additional Regional Seed Strains | 🟢 Low Priority | Botanical Lead | Expand catalog with native indigenous seed varieties from South and North-East India. |

---

## 2. Indian Business, Legal & Regulatory Readiness

To operate legally as an e-commerce entity in India, the business owner must provide and configure the following statutory records before processing real transactions.

> [!IMPORTANT]
> The following items reflect compliance obligations under the **Consumer Protection (E-Commerce) Rules, 2020**, the **Information Technology Act, 2000**, the **Digital Personal Data Protection (DPDP) Act, 2023**, and the **Central Goods and Services Tax (CGST) Act, 2017**. GLOROV engineering has built the technical framework; the business owner must provide the legally verified inputs.

### 2.1 Corporate Entity & Statutory Tax Details
The business owner must provide the following inputs for inclusion in order invoices and footer notices:
1. **Legal Business Entity Name:** (e.g., *GLOROV Botanicals Private Limited* or registered LLP / Sole Proprietorship).
2. **Registered Office Address:** Complete physical address with state and 6-digit PIN code.
3. **Goods and Services Tax Identification Number (GSTIN):** 15-character statutory GST identifier.
   - *Seed Classification:* Vegetable, flower, and crop seeds classified under **HSN Code 1209** are exempt from GST (0% rate).
   - *Live Plants Classification:* Live plants under **HSN Code 0602** are subject to statutory GST (0% or 5% depending on commercial packaging).
   - *Gardening Tools & Planters:* Standard GST applicable (12% to 18% under HSN 6914 / 8201).
4. **Corporate Identity Number (CIN) or Udyam Registration:** If incorporated as a company or MSME.

### 2.2 Consumer Protection (E-Commerce) Rules, 2020 Compliance
E-commerce platforms operating in India are required to publish clear operational policies:
- **Mandatory Nodal Grievance Officer:**
  - Full Name: `[Business Owner to Designate]`
  - Designation: Grievance Officer — E-Commerce Operations
  - Direct Email: `grievance@glorov.in`
  - Contact Telephone: `+91-XXXXXXXXXX`
  - Grievance Redressal SLA: Acknowledgement within 48 hours; resolution within 30 days.
- **Country of Origin Disclosure:** All product catalog listings must explicitly indicate `Country of Origin: India` (already supported in GLOROV product metadata).
- **Physical Dispatch Hub Address:**
  - Address: *GLOROV Propagation Nursery, Pune, Maharashtra — 411001, India*.

### 2.3 Statutory Legal Documents Required on Storefront
The storefront footer modal placeholders must be replaced with legally binding documents:
1. **Terms of Service (ToS):**
   - Governing law: Laws of India; exclusive jurisdiction of Pune/Bombay High Court.
   - User account terms, limitation of liability for natural seed germination variations.
2. **Privacy Policy (DPDP Act, 2023):**
   - Explicit specification of collected data points: Customer full name, shipping address, 10-digit mobile number, email address.
   - Specified legitimate use: Order delivery, airway bill generation with Shiprocket, and transactional communications.
   - Explicit declaration: No customer financial secrets (card numbers, UPI PINs) are handled or stored by GLOROV servers; all payment data is processed by RBI-licensed Razorpay.
   - Customer right to access, rectify, and erase personal data.
3. **Shipping & Delivery Policy:**
   - Standard dispatch window: 24 to 48 hours from Pune nursery on business days.
   - Interstate delivery timeline: 2 to 5 business days via air courier.
   - Perishable plant shipping schedule: Monday through Thursday dispatches only to prevent weekend holding in courier transit hubs.
4. **Cancellation, Return & Refund Policy:**
   - Cancellation window: Allowed freely before order dispatch from nursery.
   - Perishable return exception: Live botanical plants cannot be physically returned due to transit mortality; verified damage in transit is resolved via free replacement or direct refund upon photographic proof submitted within 24 hours of delivery.
   - Refund processing time: 5 to 7 business days credited directly to the original payment source via Razorpay.

---

## 3. Staging Verification & Dry-Run Protocols

Before production traffic is admitted, the platform must undergo a complete dry-run on an isolated staging environment.

### 3.1 Staging Environment Topology
- Backend URL: `https://api-staging.glorov.in`
- Storefront URL: `https://staging.glorov.in`
- Database: Isolated PostgreSQL staging database (`glorov_medusa_staging`).
- Redis: Isolated Redis database index (`redis://redis:6379/1`).

### 3.2 End-to-End Staging Dry-Run Execution Checklist

- [ ] **Catalog Verification:** Verify all 8 botanical seed and live plant products appear with correct INR prices, HSN tags, and packet sizes.
- [ ] **Customer Account Flow:** Register a new customer with a valid Indian mobile number and address (`Pune, Maharashtra - 411001`).
- [ ] **Cart Operations:** Add 3 packets of Desi Tomato Seeds (50 seeds) and 1 live Tulsi plant; verify cart subtotal updates dynamically.
- [ ] **Address Validation:** Submit shipping address; verify Zod schema validates 6-digit Indian PIN code and rejects invalid alphanumeric postal codes.
- [ ] **Shipping Rate Calculation:** Verify available shipping methods:
  - Standard Surface Delivery (Seeds & dry items): ₹49 (free if subtotal > ₹499).
  - Express Botanical Air Delivery (Live plants): ₹99.
- [ ] **Razorpay Sandbox Payment:** Complete test payment using Razorpay Test UPI (`success@razorpay`) and Test Card (`4111 1111 1111 1111`).
  - Verify webhook event `payment.captured` arrives and is processed.
  - Verify payment status transitions to `captured`.
- [ ] **Cash on Delivery (COD) Check:** Place an order using COD; verify:
  - Order total is under ₹5,000 cap.
  - Payment status remains `awaiting` (uncaptured).
- [ ] **Order Confirmation Dispatch:** Verify transactional confirmation email arrives in staging inbox (or Mailtrap) with order number and itemized INR invoice.
- [ ] **Inventory Decrement:** Verify product inventory levels at the Pune Nursery Hub decrement atomically by the exact ordered quantities.
- [ ] **Fulfillment & AWB Assignment:** Create fulfillment in admin dashboard; verify mock or sandbox Shiprocket generates an Air Waybill (AWB) number.
- [ ] **Public Tracking Verification:** Query `/api/shipping/tracking?tracking_number=<AWB>` on storefront; verify tracking timeline renders properly.
- [ ] **Customer Cancellation Test:** Cancel unfulfilled order from storefront customer portal; verify payment refund workflow triggers and inventory restocks.

---

## 4. Payment & Shipping Sandbox-to-Live Transition

Transitioning third-party providers from testing to live requires systematic credential updates and webhook registration.

### 4.1 Razorpay Payment Gateway Live Cutover

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer Browser
    participant Storefront as Next.js Storefront
    participant Backend as Medusa Backend
    participant Razorpay as Razorpay Live API
    
    Customer->>Storefront: Click "Pay via UPI / Card / NetBanking"
    Storefront->>Backend: POST /store/carts/:id/payment-collections
    Backend->>Razorpay: POST /v1/orders (amount in paise, INR, receipt)
    Razorpay-->>Backend: Return rzp_order_id
    Backend-->>Storefront: Return payment session data
    Storefront->>Customer: Render Razorpay Standard Checkout Modal
    Customer->>Razorpay: Authorize Payment (UPI PIN / OTP)
    Razorpay-->>Customer: Payment Success (razorpay_payment_id, signature)
    Customer->>Storefront: Submit payment authorization
    Storefront->>Backend: POST /store/carts/:id/complete
    Backend->>Razorpay: Verify HMAC-SHA256(order_id + "|" + payment_id, secret)
    Backend->>Backend: Complete Cart & Generate Order
    Razorpay-->>Backend: Webhook POST /payment/razorpay/webhook (payment.captured)
    Backend-->>Customer: Return Order Confirmation
```

#### Transition Steps:
1. **Obtain Live API Keys:**
   - Log in to Razorpay Dashboard (`dashboard.razorpay.com`).
   - Switch toggle from **Test Mode** to **Live Mode**.
   - Navigate to **Settings** -> **API Keys** -> **Generate Key**.
   - Securely record `Key Id` (`rzp_live_...`) and `Key Secret`.
2. **Configure Webhook Endpoint:**
   - In Razorpay Dashboard -> **Settings** -> **Webhooks** -> **Add New Webhook**.
   - URL: `https://api.glorov.in/payment/razorpay/webhook`
   - Secret: Generate a high-entropy 32-character string (`openssl rand -hex 16`).
   - Select Events:
     - `payment.authorized`
     - `payment.captured`
     - `payment.failed`
     - `refund.processed`
3. **Environment Configuration Update:**
   ```bash
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
   RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
   RAZORPAY_MOCK_MODE=false
   ```
4. **Auto-Capture & Settlement Settings:**
   - Enable automatic payment capture in Razorpay settings (or let Medusa workflow capture upon order placement).
   - Verify Indian bank account settlement cycle (T+1 or T+2 settlement schedule).

### 4.2 Shiprocket Logistics Aggregator Live Cutover

#### Transition Steps:
1. **Activate Enterprise Account:**
   - Log in to Shiprocket (`app.shiprocket.in`).
   - Complete KYC and recharge freight wallet or activate postpaid billing.
2. **Configure Pickup Hub:**
   - Navigate to **Settings** -> **Pickup Addresses** -> **Add Address**.
   - Nickname: `Pune Central Nursery Hub`
   - Address: Complete physical nursery address, Pune, Maharashtra.
   - Pincode: `411001`
   - Phone: Nursery dispatch manager's contact number.
3. **Configure API Webhooks & Security Token:**
   - In Shiprocket -> **Settings** -> **API** -> **Webhooks**.
   - URL: `https://api.glorov.in/fulfillment/shiprocket/webhook`
   - Event: `Tracking Status Update`
   - Webhook Token: Generate a secure secret token.
4. **Environment Configuration Update:**
   ```bash
   SHIPROCKET_EMAIL=operations@glorov.in
   SHIPROCKET_PASSWORD=xxxxxxxxxxxxxxxx
   SHIPROCKET_WEBHOOK_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
   SHIPROCKET_PICKUP_LOCATION="Pune Central Nursery Hub"
   SHIPROCKET_PICKUP_PINCODE="411001"
   SHIPROCKET_MOCK_MODE=false
   ```

---

## 5. Production Deployment Playbook

This playbook provides exact operational commands for deploying GLOROV on a hardened Linux VPS (Ubuntu 22.04 LTS / 24.04 LTS) using Docker Compose and Caddy.

### 5.1 Host Hardening & System Requirements
- **Hardware Specs:** Minimum 2 vCPU, 4GB RAM, 40GB SSD.
- **Firewall (UFW):**
  ```bash
  sudo ufw default deny incoming
  sudo ufw default allow outgoing
  sudo ufw allow 22/tcp    # SSH (prefer non-standard port or SSH keys only)
  sudo ufw allow 80/tcp    # HTTP (Caddy Let's Encrypt challenge)
  sudo ufw allow 443/tcp   # HTTPS (TLS traffic)
  sudo ufw enable
  ```
- **Docker & Docker Compose:** Install official Docker engine and `docker-compose-plugin`.

### 5.2 Secrets Generation & Environment Injection

Generate production cryptographic secrets on the deployment host:

```bash
# Generate 32-byte hexadecimal secrets
JWT_SECRET=$(openssl rand -hex 32)
COOKIE_SECRET=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -hex 16)
REDIS_PASSWORD=$(openssl rand -hex 16)

echo "Secrets generated successfully. Inject into /opt/glorov/.env"
```

Create `/opt/glorov/.env` with strict permissions (`chmod 600 /opt/glorov/.env`):

```ini
# Production Environment Configuration
NODE_ENV=production
PORT=9000

# Database & Cache
DB_USER=postgres
DB_PASSWORD=<Generated_DB_Password>
DB_NAME=glorov_medusa_prod
DATABASE_URL=postgresql://postgres:<Generated_DB_Password>@postgres:5432/glorov_medusa_prod
REDIS_PASSWORD=<Generated_Redis_Password>
REDIS_URL=redis://:<Generated_Redis_Password>@redis:6379

# Cryptographic Keys (No "dev" substrings, >= 32 chars)
JWT_SECRET=<Generated_JWT_Secret>
COOKIE_SECRET=<Generated_Cookie_Secret>

# CORS Origins (No wildcards)
STORE_CORS=https://glorov.in,https://www.glorov.in
ADMIN_CORS=https://admin.glorov.in
AUTH_CORS=https://glorov.in,https://admin.glorov.in

# Razorpay Production
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_MOCK_MODE=false

# Shiprocket Production
SHIPROCKET_EMAIL=operations@glorov.in
SHIPROCKET_PASSWORD=xxxxxxxxxxxxxxxx
SHIPROCKET_WEBHOOK_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
SHIPROCKET_PICKUP_LOCATION="Pune Central Nursery Hub"
SHIPROCKET_PICKUP_PINCODE="411001"
SHIPROCKET_MOCK_MODE=false

# Cash on Delivery (Cap: ₹5,000)
COD_MAX_AMOUNT_PAISE=500000

# Transactional Email (AWS SES ap-south-1)
NOTIFICATION_FROM_EMAIL=orders@glorov.in
NOTIFICATION_FROM_NAME="GLOROV Botanical Garden"
NOTIFICATION_REPLY_TO=care@glorov.in
SMTP_HOST=email-smtp.ap-south-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=AKIAxxxxxxxxxxxxxxxx
SMTP_PASSWORD=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTIFICATION_MOCK_MODE=false

# Storefront Client-Side Public Variables
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.glorov.in
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=https://glorov.in
NEXT_PUBLIC_SITE_NAME="GLOROV — Indian Seeds & Live Plants"
```

### 5.3 Step-by-Step Initial Deployment

```bash
# 1. Clone repository to deployment directory
git clone https://github.com/glorov/glorov.git /opt/glorov
cd /opt/glorov

# 2. Build production Docker containers
docker compose -f docker-compose.prod.yml build --no-cache

# 3. Start database and cache services first
docker compose -f docker-compose.prod.yml up -d postgres redis

# 4. Wait for PostgreSQL readiness
docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres -d glorov_medusa_prod

# 5. Run database migrations
docker compose -f docker-compose.prod.yml run --rm backend-blue pnpm run db:migrate

# 6. Seed Indian regional configuration and initial botanical catalog
docker compose -f docker-compose.prod.yml run --rm backend-blue pnpm run seed

# 7. Start the active backend service (Blue container)
docker compose -f docker-compose.prod.yml up -d backend-blue

# 8. Start the Next.js storefront service
docker compose -f docker-compose.prod.yml up -d storefront

# 9. Start Caddy reverse proxy with automatic SSL
docker compose -f docker-compose.prod.yml up -d caddy

# 10. Verify container status
docker compose -f docker-compose.prod.yml ps
```

---

## 6. Post-Deployment Verification & Smoke Testing

Immediately after deploying containers, run the automated smoke test script to verify runtime health, API probes, SSR rendering, and security headers.

### 6.1 Execute Smoke Test Suite

```bash
# Run smoke tests against production endpoints
node scripts/smoke-test.mjs https://api.glorov.in https://glorov.in
```

### 6.2 Expected Output (All 7 Probes Green)

```text
🌿 [GLOROV] Initiating Post-Deployment Smoke Test Suite...
📡 Backend Target:    https://api.glorov.in
🌐 Storefront Target: https://glorov.in
------------------------------------------------------------
⏳ Checking: Backend Liveness Probe (/health)... PASSED (28ms)
⏳ Checking: Backend Readiness Probe (/store/health)... PASSED (14ms)
⏳ Checking: Backend Correlation ID Echo & Sanitization... PASSED (3ms)
⏳ Checking: Storefront API Health Probe (/api/health)... PASSED (35ms)
⏳ Checking: Storefront SSR Homepage (/)... PASSED (180ms)
⏳ Checking: Storefront Security Headers Verification... PASSED (6ms)
⏳ Checking: Search Engine Ingress (/robots.txt & /sitemap.xml)... PASSED (42ms)
------------------------------------------------------------
📊 Smoke Test Summary: 7/7 checks passed.
✅ All smoke checks verified successfully! Deployment is operational.
```

### 6.3 Manual Sanity Checks
- [ ] Open `https://glorov.in` in an incognito window on a mobile device.
- [ ] Verify SSL certificate is valid and issued by Let's Encrypt.
- [ ] Verify category pages load and products show INR prices.
- [ ] Verify search for "Tomato" returns seed packet results.
- [ ] Verify adding an item to the cart updates the cart badge.
- [ ] Verify `/admin` redirects to login without revealing stack traces.

---

## 7. Rollback Procedures & Contingency Playbook

If a critical failure occurs during or after deployment, follow these deterministic rollback steps.

```mermaid
flowchart TD
    A[Production Deployment Triggered] --> B[Deploy to Inactive Green Container]
    B --> C[Run Smoke Test against Green :9002]
    C --> D{Smoke Tests Pass?}
    D -- No --> E[Aborted: Stop Green. Blue remains live on :9000]
    D -- Yes --> F[Switch Caddy Upstream to Green]
    F --> G[Run Post-Cutover Sanity Checks]
    G --> H{Any Fatal Errors Detected?}
    H -- No --> I[Success: Blue becomes standby]
    H -- Yes --> J[⚡ Instant Rollback: Switch Caddy Upstream to Blue]
    J --> K[Reload Caddy in <100ms]
    K --> L[Blue Restored with Zero Downtime]
```

### 7.1 Instant Traffic Rollback (Blue/Green Switch)
If the new backend deployment encounters errors after cutover:

```bash
# Step 1: Immediately revert Caddy upstream to previous stable container (e.g. backend-blue)
sed -i 's/backend-green:9000/backend-blue:9000/g' caddy/Caddyfile

# Step 2: Reload Caddy configuration (zero downtime, <100ms)
docker compose -f docker-compose.prod.yml exec -T caddy caddy reload --config /etc/caddy/Caddyfile

# Step 3: Verify traffic is routed back to stable container
curl -i https://api.glorov.in/health

# Step 4: Stop the faulty container to preserve logs for post-mortem
docker compose -f docker-compose.prod.yml stop backend-green
```

### 7.2 Database Rollback & Point-in-Time Recovery
If an erroneous migration corrupts the database state:

```bash
# Step 1: Put application in maintenance mode (serve static 503 from Caddy)
docker compose -f docker-compose.prod.yml exec -T caddy caddy respond "GLOROV is undergoing scheduled maintenance. Back in 10 minutes." 503

# Step 2: Terminate active backend processes to stop database writes
docker compose -f docker-compose.prod.yml stop backend-blue backend-green

# Step 3: Restore latest automated backup
LATEST_BACKUP=$(ls -t /var/backups/glorov/glorov_backup_*.sql.gz | head -1)
echo "Restoring from $LATEST_BACKUP..."

gunzip -c "$LATEST_BACKUP" | docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d glorov_medusa_prod

# Step 4: Restart backend on previous stable release
docker compose -f docker-compose.prod.yml up -d backend-blue

# Step 5: Verify health and remove maintenance mode
curl http://localhost:9000/health
docker compose -f docker-compose.prod.yml exec -T caddy caddy reload --config /etc/caddy/Caddyfile
```

---

## 8. Day-1 to Day-7 Monitoring & Telemetry Playbook

During the first 7 days of live operations, the engineering team must monitor telemetry, error rates, and business metrics against predefined SLA thresholds.

### 8.1 Key Health & Performance Metrics

| Metric | Normal Range | Alert Threshold | Action if Breached |
|---|---|---|---|
| **P95 Latency (Backend API)** | 100ms – 400ms | `> 1,500ms` for 5 min | Check PostgreSQL slow queries and Redis cache hit ratio. |
| **HTTP 5xx Error Rate** | < 0.1% | `> 1.0%` for 3 min | Inspect Pino structured error logs; check external provider timeouts. |
| **Payment Failure Rate** | < 5.0% | `> 15.0%` in 1 hour | Verify Razorpay API status; inspect webhook delivery logs. |
| **PostgreSQL Connection Pool** | 2 – 6 active | `> 9` (Max is 10) | Increase `DB_POOL_MAX` or optimize long-running transactions. |
| **Disk Space Usage** | < 40% | `> 75%` | Rotate old Docker logs; prune dangling container images. |

### 8.2 Log Inspection & Diagnostics

Structured JSON logs are formatted with Pino and tagged with correlation IDs. Query live logs without exposing customer credentials:

```bash
# View backend application errors in real-time
docker compose -f docker-compose.prod.yml logs -f --tail=100 backend-blue | jq 'select(.level >= 40)'

# Inspect specific request trace by correlation ID
docker compose -f docker-compose.prod.yml logs backend-blue | grep "glr_cid_xxxxxxxxxxxx"

# Monitor payment provider webhook activity
docker compose -f docker-compose.prod.yml logs backend-blue | grep "razorpay_webhook"
```

### 8.3 Daily Operations Schedule (Week 1)

- **08:30 IST — Morning Health Check:**
  - Verify database backup executed at 03:00 IST and file size is non-zero.
  - Review overnight error logs and failed payment attempts.
- **12:00 IST — Nursery Dispatch Synchronization:**
  - Verify all orders placed before 11:30 IST are packaged at the Pune nursery.
  - Confirm Shiprocket manifests generated and courier pickups scheduled.
- **17:30 IST — Evening Logistics Reconciliation:**
  - Check that all dispatched parcels received an initial tracking scan from the courier.
  - Check for any customer return requests or delivery delay notifications.
- **22:00 IST — System Resource & Wallet Audit:**
  - Check Shiprocket freight wallet balance; replenish if balance < ₹5,000.
  - Check VPS memory, CPU utilization, and disk space.

---

## Conclusion & Launch Recommendation

The GLOROV e-commerce application has completed rigorous automated testing (673/673 tests passing), security hardening (SEC-01 through SEC-09), responsive UX verification, and operational tooling.

**Engineering Verdict:**  
The software codebase is **PRODUCTION READY**. Launch can proceed as soon as the business owner completes **Critical Blockers BLK-01 through BLK-06** (live Razorpay KYC, live Shiprocket credentials, statutory legal policies, and DNS domain pointing).

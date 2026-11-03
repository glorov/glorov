# GLOROV Storefront: Production Rollback & Emergency Recovery Guide

## 1. Executive Summary & Rollback Objectives

This document outlines the emergency recovery procedures and rollback strategies for the **GLOROV Next.js Storefront** (`apps/storefront`).

Because the storefront is decoupled from the Medusa backend (`apps/backend`) and the Flutter mobile app (`flutter/`), **a storefront rollback carries ZERO risk of database corruption or mobile disruption**.

- **Target Recovery Time (RTO):** < 60 seconds.
- **Data Loss (RPO):** 0 seconds (All transactions and user sessions reside securely in the Medusa PostgreSQL database).

---

## 2. Rollback Scenarios & Triggers

Initiate a storefront rollback under any of the following conditions:

1. **Critical Payment Failure**: Online orders fail to capture payments via Razorpay due to configuration or SDK mismatches.
2. **Fatal SSR Crashing**: Node.js server experiences uncaught runtime exceptions or memory leaks affecting > 5% of requests.
3. **Severe Mobile Usability Regression**: Broken responsive layouts or inaccessible checkout buttons on core mobile viewports (`350px - 375px`).
4. **Data Desynchronization**: Persistent hydration mismatches preventing users from viewing their bags or placing orders.

---

## 3. Rollback Procedures by Hosting Platform

### 3.1 Platform Option A: Vercel / Managed Cloud (Instant Atomic Rollback)
Vercel keeps immutable deployment artifacts of every production build:

1. Open the **Vercel Dashboard** ➔ Navigate to the `glorov-storefront` project.
2. Click on the **Deployments** tab.
3. Locate the last known healthy deployment (marked with a green checkmark).
4. Click the three dots (`...`) on the deployment row ➔ Select **Instant Rollback**.
5. Confirm the action.
6. **Verification**: Edge routing updates globally within 15 seconds. Traffic immediately shifts to the healthy release.

---

### 3.2 Platform Option B: Self-Hosted Docker / Linux VM
If running the Next.js standalone container behind Nginx:

```bash
# 1. SSH into the production server
ssh deploy@production.glorov.in

# 2. Navigate to deployment directory
cd /opt/glorov/storefront

# 3. Revert Docker container to previous image tag
docker-compose down
docker-compose up -d --build glorov-storefront:previous-stable

# 4. Verify local container health
curl -f http://localhost:3000/api/health

# 5. Reload Nginx reverse proxy
sudo systemctl reload nginx
```

---

### 3.3 Platform Option C: DNS Reversion to Flutter Web (Emergency Fallback)
If the entire Next.js deployment must be suspended and previous Flutter Web routing restored:

1. Open your DNS provider (Cloudflare / Route 53 / GoDaddy).
2. Update the `A` / `CNAME` records for `glorov.in` and `www.glorov.in`:
   - Point from the Next.js hosting IP back to the previous hosting endpoint (e.g., Firebase Hosting or static Flutter Web server).
3. Purge Cloudflare / edge CDN cache.
4. Verify that `https://glorov.in` serves the legacy Flutter Web bundle.

---

## 4. Preserving Backend & Mobile Application Integrity

During a storefront rollback:

- **Do NOT touch the Medusa backend (`apps/backend`)**: The backend continues running normally. Flutter mobile users will experience zero interruption.
- **Do NOT roll back the database**: Database migrations should only be rolled back if schema changes caused the issue. The storefront migration introduces zero breaking schema changes.
- **Customer Carts**: Saved carts remain in Medusa and in customer browser `localStorage`. Customers will not lose their shopping carts upon rollback.

---

## 5. Post-Rollback Incident Checklist

1. [ ] Confirm live website is serving the healthy release (`curl -I https://glorov.in`).
2. [ ] Verify `/api/health` returns `200 OK`.
3. [ ] Perform test order with COD or test card to verify checkout functionality.
4. [ ] Notify engineering team and review server/error logs (Sentry / Datadog / PM2).
5. [ ] Isolate defect in a local development branch (`git checkout -b fix/rollback-investigation`).
6. [ ] Re-run unit and responsive test suites (`pnpm storefront:test`).

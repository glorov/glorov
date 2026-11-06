# GLOROV — Known Issues Register

> **Last Updated:** November 6, 2026 (Phase 2 — Final Production Hardening & FIX-019 Completed)  
> **Total Issues Tracked:** 54 (0 CRITICAL, 0 HIGH, 0 MEDIUM, 0 LOW | 54 RESOLVED)

---

## Open Issues — CRITICAL (0)

*None — All critical production blockers resolved.*

## Open Issues — HIGH (0)

*None — All high priority issues resolved.*

## Open Issues — MEDIUM (0)

*None — All medium priority issues resolved.*

## Open Issues — LOW (0)

*None — All low priority issues resolved.*

---

## Resolved Issues (54)

| ID | Category | Description | Document | Status | Resolved Date | Fix Reference |
|---|---|---|---|---|---|---|
| GLOROV-TEST-002 | Testing | Test count verified via `pnpm turbo test`: 614 unit tests, 768 total automated tests across 66 suites. | TESTING_CHECKLIST | RESOLVED | 2026-11-06 | FIX-019 |
| GLOROV-PERF-005 | Performance | Static asset CDN options (Cloudflare, Azure, Bunny) documented; assetPrefix and Caddy/Nginx cache-control configured. | PERFORMANCE_AUDIT | RESOLVED | 2026-11-06 | FIX-019 |
| GLOROV-DEPLOY-005 | Deployment | SSH key 90-day rotation procedure documented in docs/ssh-key-management.md; Azure OIDC roadmap added. | DEPLOYMENT_AUDIT | RESOLVED | 2026-11-06 | FIX-019 |
| GLOROV-DEPLOY-007 | Deployment | Admin symlink made idempotent with directory verification and relative pointer in reload-services.sh & rollback.sh. | DEPLOYMENT_AUDIT | RESOLVED | 2026-11-06 | FIX-019 |
| GLOROV-DEPLOY-008 | Deployment | Standalone asset directory verification automated in deploy/prepare-standalone-assets.sh with Next.js docs reference. | DEPLOYMENT_AUDIT | RESOLVED | 2026-11-06 | FIX-019 |
| GLOROV-SHIP-002 | Logistics | Eliminated fake mock S3/Shiprocket label URLs; returns null with actionable dashboard guidance. | LOGISTICS_AUDIT | RESOLVED | 2026-11-06 | FIX-019 |
| GLOROV-TEST-004 | Testing | Security scanning (SAST/DAST) implemented via CodeQL and dependency audit gate in CI. | TESTING_CHECKLIST | RESOLVED | 2026-11-06 | FIX-018 |
| GLOROV-TEST-005 | Testing | Lighthouse/CWV performance gates configured in CI with lighthouserc.json. | TESTING_CHECKLIST | RESOLVED | 2026-11-06 | FIX-018 |
| GLOROV-DEPLOY-009 | Deployment | Staging environment fully documented with isolated docker-compose.staging.yml. | DEPLOYMENT_AUDIT | RESOLVED | 2026-11-06 | FIX-018 |
| GLOROV-PERF-004 | Performance | mock-data.ts shipped in client bundles; eliminated from browser chunks. | PERFORMANCE_AUDIT | RESOLVED | 2026-11-06 | FIX-017 |
| GLOROV-NOTIF-001 | Notifications | Customer notification preferences connected to real Medusa customer metadata and live orders. | PRODUCTION_AUDIT | RESOLVED | 2026-11-06 | FIX-017 |
| GLOROV-UI-001 | UX | Fake 35% compare-at markup removed; strikethrough only rendered on real catalog discounts. | PRODUCTION_AUDIT | RESOLVED | 2026-11-06 | FIX-017 |
| GLOROV-ERR-006 | Observability | Rate limiter in-memory fallback not shared across PM2 processes. | ERROR_HANDLING_AUDIT | RESOLVED | 2026-11-06 | FIX-016 |
| GLOROV-DB-005 | Database | No explicit connection pool configuration for 1GB VM. | DATABASE_AUDIT | RESOLVED | 2026-11-06 | FIX-016 |
| GLOROV-PERF-007 | Performance | Serviceability cache drops all entries at 1000 instead of LRU eviction. | LOGISTICS_AUDIT | RESOLVED | 2026-11-06 | FIX-016 |
| GLOROV-COD-001 | Payments | COD limit unit mismatch between storefront (rupees) and backend (paise). | PAYMENT_AUDIT | RESOLVED | 2026-11-06 | FIX-015 |
| GLOROV-AUTH-001 | Authentication | Storefront auth is fully simulated. No Medusa auth API integration. | PRODUCTION_AUDIT | RESOLVED | 2026-11-06 | FIX-001 |
| GLOROV-AUTH-002 | Authentication | Registration stores plaintext passwords in localStorage. | PRODUCTION_AUDIT | RESOLVED | 2026-11-06 | FIX-001 |
| GLOROV-ADDR-001 | Addresses | Addresses are localStorage-only. No Medusa address API. | PRODUCTION_AUDIT | RESOLVED | 2026-11-06 | FIX-002 |
| GLOROV-ORD-001 | Orders | Fallback checkout creates fake orders with no DB persistence. | PRODUCTION_AUDIT | RESOLVED | 2026-11-06 | FIX-003 |
| GLOROV-ORD-002 | Orders | Checkout validation uses hardcoded MOCK_PRODUCTS for pricing. | PRODUCTION_AUDIT | RESOLVED | 2026-11-06 | FIX-003 |
| GLOROV-PAY-001 | Payments | Fallback marks simulated payments as 'captured' without gateway. | PRODUCTION_AUDIT | RESOLVED | 2026-11-06 | FIX-003 |
| GLOROV-INV-001 | Inventory | No real inventory deduction in storefront fallback checkout. | PRODUCTION_AUDIT | RESOLVED | 2026-11-06 | FIX-003 |
| GLOROV-AUTH-003 | Authorization | No server-side route protection for account pages. No middleware.ts. | ROUTE_INVENTORY | RESOLVED | 2026-11-06 | FIX-004 |
| GLOROV-ROUTE-002 | Routes | No Next.js middleware.ts — no server-side auth redirect for /account/*. | ROUTE_INVENTORY | RESOLVED | 2026-11-06 | FIX-004 |
| GLOROV-SEC-001 | Security | Cloudinary API secret hardcoded and committed to Git. | SECURITY_AUDIT | RESOLVED | 2026-11-06 | FIX-004 |
| GLOROV-SEC-002 | Security | Publishable API key hardcoded as fallback in constants.ts. | SECURITY_AUDIT | RESOLVED | 2026-11-06 | FIX-004 |
| GLOROV-SEC-003 | Security | Security headers not in next.config.ts (rely on Caddy only — no defense-in-depth). | SECURITY_AUDIT | RESOLVED | 2026-11-06 | FIX-004 |
| GLOROV-PROXY-001 | Security | Unrestricted `/medusa/:path*` proxy may expose admin APIs to storefront. | SECURITY_AUDIT | RESOLVED | 2026-11-06 | FIX-004 |
| GLOROV-DEV-001 | Routes | /dev/design-system and /dev/shared-components publicly accessible. | ROUTE_INVENTORY | RESOLVED | 2026-11-06 | FIX-004 |
| GLOROV-DEPLOY-010 | Deployment | Cloudinary API key hardcoded as default in docker-compose.prod.yml. | DEPLOYMENT_AUDIT | RESOLVED | 2026-11-06 | FIX-004 |
| GLOROV-CART-001 | Cart | Cart is entirely client-side localStorage. No Medusa cart integration. | PRODUCTION_AUDIT | RESOLVED | 2026-11-06 | FIX-005 |
| GLOROV-DATA-001 | Data | Order history shows hardcoded demo data. | PRODUCTION_AUDIT | RESOLVED | 2026-11-06 | FIX-006 |
| GLOROV-API-002 | API | Backend `store/checkout/place-order` generates fake order IDs, not connected to Medusa order module. | API_INVENTORY | RESOLVED | 2026-11-06 | FIX-007 |
| GLOROV-DB-001 | Database | Backend checkout validation uses hardcoded `CANONICAL_INVENTORY` (21 items) instead of querying PostgreSQL. | DATABASE_AUDIT | RESOLVED | 2026-11-06 | FIX-007 |
| GLOROV-MOCK-001 | Data | 2059-line MOCK_PRODUCTS in production storefront bundle. | PRODUCTION_AUDIT | RESOLVED | 2026-11-06 | FIX-007 |
| GLOROV-BUILD-001 | Build | `ignoreBuildErrors: true` — TypeScript errors silenced in production builds. | PERFORMANCE_AUDIT | RESOLVED | 2026-11-06 | FIX-008 |
| GLOROV-BUILD-002 | Build | `ignoreDuringBuilds: true` — ESLint errors silenced in production builds. | PERFORMANCE_AUDIT | RESOLVED | 2026-11-06 | FIX-008 |
| GLOROV-PERF-003 | Build | ESLint ignoreDuringBuilds silences all lint errors in production. | PERFORMANCE_AUDIT | RESOLVED | 2026-11-06 | FIX-008 |
| GLOROV-DEPLOY-001 | Deployment | No rollback mechanism — rsync --delete overwrites previous version. | DEPLOYMENT_AUDIT | RESOLVED | 2026-11-06 | FIX-009 |
| GLOROV-DEPLOY-002 | Deployment | AUTO_MIGRATE in production — unreviewed migrations run on container restart. | DEPLOYMENT_AUDIT | RESOLVED | 2026-11-06 | FIX-009 |
| GLOROV-DEPLOY-004 | Deployment | No database backup automation configured. | DEPLOYMENT_AUDIT | RESOLVED | 2026-11-06 | FIX-009 |
| GLOROV-DB-002 | Database | No database backup automation configured (RPO/RTO documented but not implemented). | DATABASE_AUDIT | RESOLVED | 2026-11-06 | FIX-009 |
| GLOROV-PERF-001 | Infrastructure | VM memory overcommit — Docker compose allocates ~2GB on 1GB Azure VM. | PERFORMANCE_AUDIT | RESOLVED | 2026-11-06 | FIX-010 |
| GLOROV-DEPLOY-003 | Deployment | VM memory overcommit — Docker compose allocates ~2GB+ across services on a 1GB VM. | DEPLOYMENT_AUDIT | RESOLVED | 2026-11-06 | FIX-010 |
| GLOROV-DEPLOY-006 | Deployment | PM2 restart (not reload) causes brief downtime. | DEPLOYMENT_AUDIT | RESOLVED | 2026-11-06 | FIX-010 |
| GLOROV-SHIP-001 | Logistics | Fallback AWB generation creates fake SR-prefixed AWBs that won't track. | LOGISTICS_AUDIT | RESOLVED | 2026-11-06 | FIX-011 |
| GLOROV-SHIP-003 | Logistics | RTO orders have no automated handling — no inventory restoration or refund initiation. | LOGISTICS_AUDIT | RESOLVED | 2026-11-06 | FIX-011 |
| GLOROV-SHIP-004 | Logistics | Hardcoded default phone 9876543210 when address phone is invalid. | LOGISTICS_AUDIT | RESOLVED | 2026-11-06 | FIX-011 |
| GLOROV-SHIP-005 | Logistics | Hardcoded package dimensions (15×12×8cm, 0.5kg) for all items. | LOGISTICS_AUDIT | RESOLVED | 2026-11-06 | FIX-011 |
| GLOROV-SHIP-006 | Logistics | Fulfillment search scans all fulfillments without pagination. | LOGISTICS_AUDIT | RESOLVED | 2026-11-06 | FIX-011 |
| GLOROV-PERF-006 | Performance | Shiprocket webhook handler queries ALL fulfillments — O(n) scan. | LOGISTICS_AUDIT | RESOLVED | 2026-11-06 | FIX-011 |
| GLOROV-ERR-001 | Observability | No external error reporting (Sentry/Datadog/APM). Errors go to stdout only. | ERROR_HANDLING_AUDIT | RESOLVED | 2026-11-06 | FIX-012 |
| GLOROV-ERR-002 | Observability | Storefront error boundary uses console.error() only — no structured error reporting. | ERROR_HANDLING_AUDIT | RESOLVED | 2026-11-06 | FIX-012 |
| GLOROV-API-001 | API | Duplicate webhook paths (/hooks/* and /api/hooks/*) — risk of double processing. | API_INVENTORY | RESOLVED | 2026-11-06 | FIX-013 |
| GLOROV-API-004 | API | No rate limiting on /store/checkout/place-order or /store/checkout/validate. | API_INVENTORY | RESOLVED | 2026-11-06 | FIX-013 |
| GLOROV-API-005 | API | /store/reviews POST has no authentication — anonymous reviews possible. | API_INVENTORY | RESOLVED | 2026-11-06 | FIX-013 |
| GLOROV-ERR-003 | Observability | MetricsCollector is in-memory only — resets on process restart. | ERROR_HANDLING_AUDIT | RESOLVED | 2026-11-06 | FIX-013 |
| GLOROV-ERR-004 | Observability | Dead-letter records are in-memory — lost on restart. | ERROR_HANDLING_AUDIT | RESOLVED | 2026-11-06 | FIX-013 |
| GLOROV-ERR-005 | Observability | No nested error boundaries — only root error.tsx exists. | ERROR_HANDLING_AUDIT | RESOLVED | 2026-11-06 | FIX-013 |
| GLOROV-DB-003 | Database | Dead-letter records in-memory only (order metadata backup may fail). | DATABASE_AUDIT | RESOLVED | 2026-11-06 | FIX-013 |
| GLOROV-DB-004 | Database | Metrics are in-memory only — process restart resets all metrics. | DATABASE_AUDIT | RESOLVED | 2026-11-06 | FIX-013 |
| GLOROV-SEO-001 | SEO | Domain inconsistency (glorov.in vs glorov.tech in different configs). | PRODUCTION_AUDIT | RESOLVED | 2026-11-06 | FIX-013 |
| GLOROV-COUPON-001 | Pricing | Coupons hardcoded in storefront instead of using backend offers API. | PRODUCTION_AUDIT | RESOLVED | 2026-11-06 | FIX-013 |
| GLOROV-PAY-002 | Payments | capturePayment silently returns 'captured' on error. | PAYMENT_AUDIT | RESOLVED | 2026-11-06 | FIX-013 |
| GLOROV-PAY-003 | Payments | Hardcoded 9800 paise fallback amount in capturePayment. | PAYMENT_AUDIT | RESOLVED | 2026-11-06 | FIX-013 |
| GLOROV-PAY-004 | Payments | No refund idempotency guard. | PAYMENT_AUDIT | RESOLVED | 2026-11-06 | FIX-013 |
| GLOROV-RZP-001 | Payments | Float-to-paise conversion has IEEE 754 edge cases. | PAYMENT_AUDIT | RESOLVED | 2026-11-06 | FIX-013 |
| GLOROV-WISH-001 | Wishlist | Wishlist is localStorage-only. No Medusa API persistence. | PRODUCTION_AUDIT | RESOLVED | 2026-11-06 | FIX-013 |
| GLOROV-TEST-001 | Testing | Zero storefront test files exist despite Vitest + Playwright in dependencies. | TESTING_CHECKLIST | RESOLVED | 2026-11-06 | FIX-014 |
| GLOROV-TEST-003 | Testing | No E2E test implementations despite e2e-test-plan.md existing. | TESTING_CHECKLIST | RESOLVED | 2026-11-06 | FIX-014 |

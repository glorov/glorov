# GLOROV — Database Audit

> **Audit Date:** November 6, 2026  
> **Database:** PostgreSQL 16 (Alpine) via Medusa v2 MikroORM

---

## 1. Database Architecture

### ORM & Schema Management
- **ORM**: MikroORM (embedded in Medusa v2 framework — not a custom ORM choice)
- **Migrations**: Managed via `npx medusa db:migrate` — no custom migration files exist in `src/migrations/`
- **Models**: No custom model directory (`src/models/` does not exist) — all entities are standard Medusa v2 core entities
- **Links**: Module links defined in `src/links/` (e.g., `product-botanical.ts`)

### Connection Configuration
```
# Production (from docker-compose.prod.yml)
DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}

# CI (from ci.yml)  
DATABASE_URL: postgres://postgres:test_postgres_password@localhost:5432/glorov_medusa_test
```

### Resource Limits (Production)
| Resource | Limit |
|---|---|
| PostgreSQL Memory | 1024MB |
| PostgreSQL CPUs | 1.0 |
| Redis Memory | 512MB |
| Redis CPUs | 0.5 |

---

## 2. Data Model Assessment

### Core Entities (Medusa v2 Standard)
All commerce data models are provided by Medusa v2 core modules:

| Entity | Module | Purpose |
|---|---|---|
| `product` | `@medusajs/medusa/product` | Seed/plant catalog with categories, variants, images |
| `product_variant` | `@medusajs/medusa/product` | Size/packaging variants |
| `product_category` | `@medusajs/medusa/product` | Indoor Plants, Vegetable Seeds, etc. |
| `price` | `@medusajs/medusa/pricing` | INR pricing (paise) |
| `inventory_item` | `@medusajs/medusa/inventory` | Stock tracking per variant |
| `stock_location` | `@medusajs/medusa/stock-location` | Pune Central Nursery, etc. |
| `cart` | `@medusajs/medusa/cart` | Shopping cart lifecycle |
| `order` | `@medusajs/medusa/order` | Order state machine |
| `payment` | `@medusajs/medusa/payment` | Payment collections & captures |
| `fulfillment` | `@medusajs/medusa/fulfillment` | Shipping & delivery |
| `customer` | `@medusajs/medusa/customer` | Customer accounts & addresses |
| `notification` | `@medusajs/medusa/notification` | Email notification records |
| `api_key` | `@medusajs/medusa/api-key` | Publishable API key scoping |

### Custom Data (via metadata fields and custom modules)
| Custom Entity/Field | Storage | Purpose |
|---|---|---|
| Hero content | Custom API routes (likely in-memory or metadata) | Homepage hero configuration |
| Banners | Custom API routes | Promotional banner management |
| Announcements | Custom API routes | Announcement bar content |
| Offers/Coupons | Custom `offer-service` module | Coupon validation with category rules |
| Trust Badges | Custom API routes | Trust badge display |
| Dead-letter records | `order.metadata.failed_async_jobs` | Failed async job audit trail |

---

## 3. Database Integrity Findings

### Positive Controls
| Control | Status | Evidence |
|---|---|---|
| MikroORM transaction isolation | ✅ PASS | Medusa v2 workflows provide ACID transactions |
| Foreign key constraints | ✅ PASS | Standard Medusa schema enforces referential integrity |
| Unique constraints | ✅ PASS | Standard Medusa entities have proper unique indexes |
| Healthcheck | ✅ PASS | `docker-compose.prod.yml` L18: `pg_isready` healthcheck |
| Persistent volume | ✅ PASS | `docker-compose.prod.yml` L16: `prod-pgdata` volume |
| Redis persistence | ✅ PASS | Redis AOF enabled (`--appendonly yes`) |

### Issues Identified

| ID | Issue | Severity | Detail |
|---|---|---|---|
| **GLOROV-DB-001** | **Backend checkout validation uses hardcoded inventory** — `CANONICAL_INVENTORY` in `checkout-validation-service.ts` (21 items) instead of querying PostgreSQL. Prices, stock, and availability are static constants, not database values. | CRITICAL | [`checkout-validation-service.ts` L78-102](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/backend/src/modules/checkout/checkout-validation-service.ts#L78-L102) |
| **GLOROV-DB-002** | ~~**No database backup automation configured**~~ — **RESOLVED (FIX-009)**: Created `deploy/backup-database.sh` supporting timestamped `.sql.gz` dumps, 7-day retention, PGPASSWORD env variable handling, and non-blocking pre-deploy execution via CI/CD and cron. | RESOLVED | `deploy/backup-database.sh`, `deploy.yml` |
| **GLOROV-DB-003** | **Dead-letter records are in-memory only** — `inMemoryDeadLetters` array in `async-retry.ts` L45. Process restart loses all dead-letter audit records. Order metadata persistence (L207-238) is a secondary backup but may fail silently. | MEDIUM | [`async-retry.ts` L45-49](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/backend/src/utils/async-retry.ts#L45-L49) |
| **GLOROV-DB-004** | **Metrics are in-memory only** — `metricsCollector` singleton in `metrics-collector.ts` L238. Process restart resets all operational metrics (requests, errors, latency, alert history). | MEDIUM | [`metrics-collector.ts` L238](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/backend/src/utils/metrics-collector.ts#L238) |
| **GLOROV-DB-005** | **No connection pool configuration** exposed. Medusa v2 handles pooling via MikroORM defaults. On a 1GB RAM VM, pool sizes may need tuning. | LOW | `medusa-config.ts` |

---

## 4. Seed Scripts

16 seed/utility scripts exist in `apps/backend/src/scripts/`:

| Script | Purpose | Language |
|---|---|---|
| `seed-india-region.ts` | Indian region, currency (INR), tax setup | TypeScript |
| `seed-catalog.ts` | Product catalog seeding | TypeScript |
| `seed-banners.ts` | Banner data seeding | TypeScript |
| `seed-offers.ts` | Offer/coupon seeding | TypeScript |
| `seed-ugaoo-catalog.ts` | Ugaoo-style catalog seeding | TypeScript |
| `migrate-to-cloudinary.js` | Image migration to Cloudinary | JavaScript |
| `curate-botanical-seed-assets.js` | Botanical asset curation | JavaScript |
| `process-and-upload-all-seeds.js` | Batch image processing + upload | JavaScript |
| Various Python scripts | Image processing, URL testing | Python |

> [!NOTE]
> The `seed-india-region.ts` script is executed in CI integration tests (`ci.yml` L132), confirming it's maintained and functional.

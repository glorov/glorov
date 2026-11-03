# 01 — Project Architecture

> **Audit date:** 2026-11-03  
> **Status:** Analysis-only. No implementation has started.

---

## 1. Monorepo Overview

GLOROV is a **pnpm + Turborepo** monorepo targeting Node ≥ 20 and managed with `pnpm@9.15.9`.

```
glorov/                         ← repository root
├── apps/
│   └── backend/                ← Medusa v2 (2.22.0) commerce backend
├── packages/
│   ├── config/                 ← shared ESLint + TypeScript configs
│   └── types/                  ← shared TypeScript type definitions (@glorov/types)
├── flutter/                    ← Flutter app (mobile + web storefront)
├── docs/                       ← all project documentation
├── screenshots/                ← visual QA screenshots (per prompt)
├── scratch/                    ← one-off scripts (Puppeteer, Python helpers)
├── deploy/                     ← server deployment scripts (Caddyfile, webhook)
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### Turborepo task pipeline

| Task        | Depends on    | Outputs                                           |
|-------------|---------------|---------------------------------------------------|
| `build`     | `^build`      | `.medusa/server/**`, `.next/**`, `dist/**`        |
| `dev`       | —             | persistent, no cache                              |
| `typecheck` | `^build`      | —                                                 |
| `lint`      | —             | —                                                 |
| `test`      | —             | —                                                 |

---

## 2. Existing Applications

### 2.1 `apps/backend` — Medusa v2 Commerce Engine

| Property | Value |
|---|---|
| Package name | `@glorov/backend` |
| Medusa version | `2.22.0` |
| Node requirement | ≥ 20.0.0 |
| Database | PostgreSQL (Supabase-compatible, port 5432) |
| Cache / Queues | Redis |
| File storage | Cloudinary |
| Payments | Razorpay (custom module) + Cash on Delivery (custom module) |
| Shipping | Shiprocket (custom fulfillment provider) |
| Email | SMTP via Nodemailer (custom notification module) |
| Admin UI | Medusa Dashboard embedded (`/app`) |

**Key source directories:**

```
apps/backend/src/
├── api/
│   ├── admin/         ← admin-only REST endpoints
│   └── store/         ← storefront-facing REST endpoints
├── modules/
│   ├── announcement/  ← marquee announcement bar
│   ├── banner/        ← hero carousel slides
│   ├── file-cloudinary/
│   ├── fulfillment-shiprocket/
│   ├── hero/          ← botanical hero section data
│   ├── notification-email/
│   ├── offer/         ← promotional offers + coupon validation
│   ├── payment-cod/
│   ├── payment-razorpay/
│   ├── recommendations/
│   ├── review/        ← product reviews + helpful votes
│   └── trust-badge/   ← "As seen in" trust badges
├── subscribers/       ← event-driven side effects (order, payment, shipment)
└── utils/             ← logger, error handler, retry, metrics
```

### 2.2 `flutter/` — Flutter Application

| Property | Value |
|---|---|
| Flutter SDK | ≥ 3.2.0 < 4.0.0 |
| Platform targets | Android, iOS, Web |
| State management | Singleton services (`GlorovCartState`, `GlorovAccountState`) |
| Navigation | `MaterialApp` + named routes via `generateRoute()` |
| Architecture | Repository pattern (contracts → mock or remote implementations) |
| HTTP client | Native `dart:http` via `MedusaHttpClient` wrapper |
| Local storage | Web: `localStorage` via `local_storage_web.dart`; Native: abstraction stub |

### 2.3 `packages/config` — Shared Tooling Config

- `typescript/base.json` — TypeScript base with `strict: true`, `strictNullChecks: true`
- `typescript/medusa.json` — Medusa-specific TS config
- `eslint/base.js` — ESLint base (no React rules yet)

### 2.4 `packages/types` — Shared Domain Types (`@glorov/types`)

Built TypeScript package consumed by `@glorov/backend`. Types are available for reuse in the Next.js storefront.

Key modules:
- `botanical.ts` — `SeedMetadata`, `InventoryAvailability`, `PlantSunlight`, etc.
- `catalog.ts` — `StoreCatalogProduct`, `StoreCatalogVariant`, `CatalogDiscoveryQuery`
- `pincode.ts` — `PincodeServiceabilityRequest/Response`, `ServiceabilityStatus`
- `validations.ts` — shared validation helpers
- `observability.ts` — `OperationalHealthResult`
- `index.ts` — re-exports + `GlorovProductPreview` convenience type

---

## 3. What Does NOT Exist Yet

| Item | Status |
|---|---|
| `apps/storefront/` | **Not created.** Target location for the Next.js app. |
| `packages/ui/` | **Not created.** Potential home for shared React component library. |
| `packages/api-client/` | **Not created.** Potential home for typed Medusa storefront client. |
| `packages/config/typescript/nextjs.json` | **Not created.** Needs a Next.js-specific TS config. |

---

## 4. Existing Infrastructure and Deployment

| Concern | Detail |
|---|---|
| CI/CD | GitHub Actions (`.github/workflows/`) — `ci.yml`, `deploy.yml`, `deploy-backend.yml` |
| Containerization | `Dockerfile` + `docker-compose.yml` / `docker-compose.prod.yml` |
| Reverse proxy | Caddy (`deploy/Caddyfile`) |
| Firebase Hosting | Used for Flutter Web deployment (`firebase.json`, `.firebaserc`) |
| Backend deployment | VM via webhook receiver (`deploy/webhook-receiver.mjs`) |
| Domain hints | `glorov.in` (from email config `orders@glorov.in`, `care@glorov.in`) |

---

## 5. Recommended Target Architecture

```
glorov/
├── apps/
│   ├── backend/            ← unchanged
│   └── storefront/         ← NEW: Next.js 15 App Router
├── packages/
│   ├── config/             ← add: typescript/nextjs.json, eslint/react.js
│   ├── types/              ← unchanged; also consumed by storefront
│   └── ui/                 ← OPTIONAL: shared React component library (evaluate later)
├── flutter/                ← unchanged; still deployed for mobile users
└── ...
```

### Storefront technology choices

| Concern | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styles | Tailwind CSS v4 |
| State | React Context + `useState`/`useReducer` for cart/auth; SWR or `fetch` for data |
| API client | Direct `fetch` to existing Medusa v2 REST endpoints |
| Shared types | `@glorov/types` workspace package |
| Testing | Vitest (unit), Playwright (e2e + screenshot) |
| Linting | ESLint + `@glorov/config/eslint` |
| TypeScript | Extends `@glorov/config/typescript/nextjs.json` |

### Backend relationship

The Next.js storefront is a **pure consumer** of the existing Medusa v2 REST API. No backend modifications are required for the initial migration. All existing store endpoints are available without change.

---

## 6. Existing Documentation Inventory

The `docs/` directory contains extensive pre-existing documentation that should be read before implementing any feature:

| File | Content |
|---|---|
| `architecture.md` | Overall system architecture (48 KB) |
| `BACKEND_API_CONTRACT.md` | API contracts |
| `BACKEND_INTEGRATION_PLAN.md` | Integration plan (28 KB) |
| `BACKEND_INTEGRATION_FINAL_REPORT.md` | Integration final report |
| `AUTHENTICATION_INTEGRATION.md` | Auth flows |
| `glorov-theme-guide.md` | **Design system reference (59 KB — highly relevant)** |
| `glorov-ui-implementation-plan.md` | UI implementation plan |
| `GLOROV_UI_ARCHITECTURE.md` | UI architecture (20 KB) |
| `MICRO_INTERACTIONS.md` | Animation and interaction patterns (27 KB) |
| `indian-payment-integration.md` | Razorpay + COD |
| `shipping-and-fulfillment.md` | Shiprocket integration |
| `SHOPPING_BACKEND_INTEGRATION.md` | Shopping integration |
| `e2e-test-plan.md` | E2E test strategy |
| `QA_REPORT.md` | QA report |
| `LEGAL_AND_POLICIES_FRAMEWORK.md` | Privacy, ToS, Shipping policy content |
| `decisions/` | Architecture Decision Records (ADR 0001–0006) |

> [!IMPORTANT]
> `docs/glorov-theme-guide.md` (59 KB) is the single most important document to read before implementing any UI component. It contains the authoritative design token definitions.

---

## 7. Key Risks and Open Questions

| Risk | Severity | Notes |
|---|---|---|
| No `apps/storefront` exists yet | High | Must be created from scratch |
| Flutter Web is live and deployed | High | Must not be broken; separate deploy pipeline needed |
| `@glorov/types` has no Medusa cart/order types | Medium | Cart and order types must be added or sourced from Medusa SDK |
| No React/Next.js ESLint config exists | Low | Must add `packages/config/eslint/react.js` |
| `constants.dart` retains legacy purple `primaryColor` | Low | The canonical brand uses `GlorovColors` (deep green). `constants.dart` is a leftover template artifact; do not use it for brand colours. |
| CORS config defaults to `localhost:3000` | Low | `STORE_CORS` env var must be updated to include the Next.js dev server and production domain |

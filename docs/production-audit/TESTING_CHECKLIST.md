# GLOROV — Testing Checklist & Coverage Audit

> **Audit Date:** November 6, 2026

---

## 1. Test Infrastructure

### Backend Testing
| Tool | Version | Config |
|---|---|---|
| Jest | 29.x | `apps/backend/package.json` |
| @swc/jest | Latest | SWC-based TypeScript compilation |
| Test runner | `pnpm --filter @glorov/backend test` | Via Turborepo |

### Storefront Testing
| Tool | Version | Config |
|---|---|---|
| Vitest | Latest | `apps/storefront/package.json` |
| Playwright | Latest | `apps/storefront/package.json` |
| Test runner | `pnpm --filter @glorov/storefront test` | Via Turborepo |

### CI Testing
| Job | Services | Tests |
|---|---|---|
| `quality` | None | Typecheck + Lint + Unit Tests (all workspaces) |
| `integration` | PostgreSQL 16 + Redis 7 | DB migrations + seed + Backend HTTP integration tests |
| `build` | None | Full production build verification |

---

## 2. Backend Test Files (25 test suites)

| Test File | Purpose | Type |
|---|---|---|
| `admin-access-control.unit.spec.ts` | Admin route authorization | Unit |
| `admin-operations.unit.spec.ts` | Admin CRUD operations | Unit |
| `announcement-operations.unit.spec.ts` | Announcement management | Unit |
| `banner-operations.unit.spec.ts` | Banner management | Unit |
| `business-logic-and-regression.unit.spec.ts` | Business rule regressions | Unit |
| `cancellation-and-refunds.unit.spec.ts` | Order cancellation & refund flows | Unit |
| `catalog-and-variants.unit.spec.ts` | Product catalog & variants | Unit |
| `checkout-validation.unit.spec.ts` | Checkout validation rules | Unit |
| `cloudinary-provider.unit.spec.ts` | Cloudinary file provider | Unit |
| `cod-provider.unit.spec.ts` | COD payment provider | Unit |
| `csv-import.unit.spec.ts` | CSV product import | Unit |
| `database-integrity-and-performance.unit.spec.ts` | DB constraints & queries | Unit |
| `health.unit.spec.ts` | Health endpoint | Unit |
| `hero-operations.unit.spec.ts` | Hero content management | Unit |
| `notification-provider.unit.spec.ts` | Email notification provider | Unit |
| `notification-subscribers.unit.spec.ts` | Event subscriber handlers | Unit |
| `notification-templates.unit.spec.ts` | Email template rendering | Unit |
| `observability.unit.spec.ts` | Logging & metrics | Unit |
| `offer-operations.unit.spec.ts` | Offer/coupon management | Unit |
| `razorpay-provider.unit.spec.ts` | Razorpay payment provider | Unit |
| `recommendations.unit.spec.ts` | Product recommendations | Unit |
| `search-suggestions.unit.spec.ts` | Search autocomplete | Unit |
| `security-hardening.unit.spec.ts` | Security controls | Unit |
| `shiprocket-provider.unit.spec.ts` | Shiprocket fulfillment | Unit |
| `trust-badge-operations.unit.spec.ts` | Trust badge management | Unit |

### Backend Integration Tests
- Referenced in CI as `pnpm --filter @glorov/backend test:integration:http`
- 9 HTTP integration test suites mentioned in CI workflow

---

## 3. Storefront Test Files

> [!CAUTION]
> **GLOROV-TEST-001: ZERO storefront test files exist.** No unit tests, no component tests, no integration tests, no E2E tests for the Next.js storefront were found anywhere in `apps/storefront/src/`.

Despite having Vitest and Playwright configured in `package.json`, no test files (`*.spec.ts`, `*.spec.tsx`, `*.test.ts`, `*.test.tsx`) were found in the storefront source directory.

---

## 4. Test Coverage Analysis

### What IS Tested (Backend — 25 suites)
| Domain | Coverage | Key Tests |
|---|---|---|
| Razorpay payment | ✅ Tested | HMAC verification, capture, refund, mock mode |
| COD payment | ✅ Tested | ₹5,000 cap, UTR enforcement, reconciliation |
| Shiprocket fulfillment | ✅ Tested | Serviceability, AWB, labels, cancellation |
| Checkout validation | ✅ Tested | Quantity limits, price tampering, COD cap |
| Email notifications | ✅ Tested | Template rendering, subscriber handlers, provider |
| Admin access control | ✅ Tested | Route authorization |
| Security hardening | ✅ Tested | Rate limiting, IDOR prevention, error sanitization |
| Observability | ✅ Tested | Structured logging, metrics, correlation |
| CSV import | ✅ Tested | Product import workflow |
| Business regressions | ✅ Tested | Edge case regression suite |

### What is NOT Tested
| Domain | Gap | Severity |
|---|---|---|
| Storefront components | No tests at all | CRITICAL |
| Storefront pages | No tests at all | CRITICAL |
| Cart logic (localStorage) | No tests | HIGH |
| Checkout flow (end-to-end) | No E2E tests | HIGH |
| Auth flow (login/register/reset) | No tests | HIGH |
| Customer account pages | No tests | MEDIUM |
| Search functionality | No storefront tests | MEDIUM |
| Responsive design / mobile | No visual tests | MEDIUM |
| Accessibility (a11y) | No tests | MEDIUM |

---

## 5. CI Pipeline Verification

### CI Workflow (`ci.yml` — 183 lines)
| Step | Command | Status |
|---|---|---|
| Typecheck | `pnpm turbo typecheck` | ✅ Configured |
| Lint | `pnpm turbo lint` | ✅ Configured |
| Unit tests | `pnpm turbo test` | ✅ Configured |
| DB migrations | `pnpm --filter @glorov/backend db:migrate` | ✅ Configured (integration job) |
| Seed data | `seed-india-region.ts` | ✅ Configured |
| Backend build | `pnpm --filter @glorov/backend build` | ✅ Configured |
| HTTP integration tests | `pnpm --filter @glorov/backend test:integration:http` | ✅ Configured |
| Production build | `pnpm turbo build` | ✅ Configured |
| Concurrency control | Cancel-in-progress for same branch | ✅ Configured |
| pnpm cache | Actions cache for pnpm store | ✅ Configured |

### What CI Does NOT Verify
- ❌ Storefront E2E tests (Playwright configured but no test files)
- ❌ Visual regression testing
- ❌ Lighthouse/CWV performance assertions
- ❌ Security scanning (SAST/DAST)
- ❌ Dependency vulnerability scanning

---

## 6. Documentation vs Reality

| Claim (from `docs/testing.md`) | Reality |
|---|---|
| "681 automated tests" | ❌ **Cannot verify** — test command was not executed in this audit. 25 backend test suites exist. Zero storefront tests. |
| "514 tests" (variant claim) | ❌ Numbers vary across documents (681, 514). Actual count unverified. |
| E2E test plan exists (`docs/e2e-test-plan.md`) | ⚠️ Plan exists but no E2E test implementations found |

---

## 7. Issues Identified

| ID | Issue | Severity | Detail |
|---|---|---|---|
| **GLOROV-TEST-001** | **Zero storefront test files** — Despite Vitest and Playwright in dependencies, no tests exist for the Next.js storefront | CRITICAL | `apps/storefront/src/` — empty search for *.spec.* and *.test.* |
| **GLOROV-TEST-002** | **Test count claims unverified** — Docs claim 681 tests but `pnpm test` was not executed. Numbers vary across documents. | HIGH | `docs/testing.md`, `README.md` |
| **GLOROV-TEST-003** | **No E2E test implementations** — `docs/e2e-test-plan.md` exists but no Playwright test files found | HIGH | `apps/storefront/` |
| **GLOROV-TEST-004** | **No security scanning in CI** — No SAST, DAST, or dependency vulnerability scanning | MEDIUM | `.github/workflows/ci.yml` |
| **GLOROV-TEST-005** | **No Lighthouse/CWV performance gates** in CI | MEDIUM | `.github/workflows/ci.yml` |

# GLOROV — Performance Audit

> **Audit Date:** November 6, 2026

---

## 1. Infrastructure Performance Profile

### Azure VM (1GB RAM) — Resource Allocation (Optimized)

| Process | Memory Limit | CPU | Port | Status |
|---|---|---|---|---|
| PM2 `glorov-backend` (Medusa) | 256MB (`--max-old-space-size=256`) | Shared (0.5) | 9000 | ✅ Optimized (Medusa v2 minimum) |
| PM2 `glorov-storefront` (Next.js) | 128MB (`--max-old-space-size=128`) | Shared (0.5) | 3001 | ✅ Optimized (reduced from 160MB) |
| PostgreSQL 16 | 384MB (Docker limit, `shared_buffers=96MB`) | 0.5 CPU | 5432 | ✅ Optimized (reduced from 1024MB) |
| Redis 7 | 128MB (Docker limit, `allkeys-lru`) | 0.25 CPU | 6379 | ✅ Optimized (reduced from 512MB) |
| Caddy / Nginx (reverse proxy) & OS | ~128MB | Minimal | 80/443 | ✅ Fits inside 1024MB physical RAM |

> [!NOTE]
> **GLOROV-PERF-001 (RESOLVED — FIX-010)**: Total optimized memory budget = 256 + 128 + 384 + 128 + ~128 (OS/proxy) = **~896MB on a 1GB RAM VM**, fitting safely within 1024MB physical RAM. Additionally, 2GB swap is recommended and documented to buffer transient PM2 reload and build spikes. Zero-downtime reloads use `pm2 reload`.

---

## 2. Next.js Performance Configuration

### next.config.ts Analysis

| Setting | Value | Impact |
|---|---|---|
| `output` | `'standalone'` | ✅ Optimized for Docker/PM2 deployment |
| `typescript.ignoreBuildErrors` | `true` | ⚠️ Hides type errors during build |
| `eslint.ignoreDuringBuilds` | `true` | ⚠️ Hides lint errors during build |
| `images.formats` | `['image/avif', 'image/webp']` | ✅ Modern image formats |
| `images.remotePatterns` | Cloudinary, Medusa, localhost | ✅ Properly configured |
| Security headers | **NOT CONFIGURED** | ❌ No HSTS, CSP, X-Frame-Options in Next.js |

> [!NOTE]
> Security headers ARE configured in the Caddy reverse proxy (`Caddyfile` L17-24): HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy. However, the Next.js config itself provides no defense-in-depth.

### Bundle Size Concerns

| File | Size | Impact |
|---|---|---|
| `lib/mock-data.ts` | 2,059 lines | ❌ **Hardcoded product catalog shipped to all SSR/client bundles** |
| `context/StorefrontContext.tsx` | 916 lines | ⚠️ Large context provider — potential re-render cascade |
| `context/CustomerAuthContext.tsx` | 647 lines | ⚠️ Large auth context with simulated logic |

---

## 3. Backend Performance Assessment

### Rate Limiting
- ✅ 5 rate-limited endpoints with configurable windows
- ⚠️ In-memory fallback when Redis unavailable — per-process limits only

### Caching
| Cache | TTL | Location |
|---|---|---|
| Shiprocket serviceability | 10 min | In-memory (`ShiprocketClient.serviceabilityCache`) |
| Shiprocket JWT token | 24 hours | In-memory (`ShiprocketClient.cachedToken`) |
| Rate limit records | Varies (window seconds) | Redis primary, in-memory fallback |
| Medusa query results | Framework default | Redis (Medusa cache module) |

### Operational Metrics
- P95 latency tracking (rolling 500 samples)
- Alert threshold at 2000ms (configurable)
- Slow request logging at >1000ms

### Database Query Performance
- MikroORM with PostgreSQL — framework-managed connection pooling
- `query.graph()` used throughout subscribers for related entity fetching
- ⚠️ Shiprocket webhook handler scans ALL fulfillments without pagination (L145-156)

---

## 4. Reverse Proxy Performance

### Caddy Configuration
| Feature | Status | Evidence |
|---|---|---|
| Gzip + Zstd compression | ✅ PASS | `Caddyfile` L14, L43 |
| Automated Let's Encrypt SSL | ✅ PASS | `Caddyfile` L8 (email: care@glorov.in) |
| www → apex redirect | ✅ PASS | `Caddyfile` L28-30 |
| Request body size limit | ✅ PASS | `Caddyfile` L55 — 25MB max (for CSV import) |
| X-Real-IP forwarding | ✅ PASS | `Caddyfile` L35, L63 |
| Server header removal | ✅ PASS | `Caddyfile` L23, L51 |
| Security headers (HSTS, nosniff, etc.) | ✅ PASS | `Caddyfile` L17-23, L46-51 |

---

## 5. CI/CD Performance

### Build Pipeline
- **CI Job 1**: Quality (Lint + Typecheck + Unit Tests) — ~3-5 min
- **CI Job 2**: Integration (Postgres + Redis + Medusa boot + HTTP tests) — ~5-10 min
- **CI Job 3**: Production Build Verification — ~3-5 min
- **Deploy**: rsync + PM2 reload — ~2-3 min
- **Total**: ~13-23 min (sequential with dependency)

### Post-Deploy Smoke Test
```yaml
# 5-second warmup, then 3 curl health checks
curl -f -s -I "https://glorov.tech"      # Storefront
curl -f -s -I "https://admin.glorov.tech" # Admin
curl -f -s -I "https://api.glorov.tech/health" # Backend
```

---

## 6. Issues Identified

| ID | Issue | Severity | Detail |
|---|---|---|---|
| **GLOROV-PERF-001** | **VM memory overcommit** — Docker compose allocates ~2GB across services on a 1GB VM. Heavy swap usage will degrade all services. | RESOLVED (FIX-010) | `docker-compose.prod.yml`, `reload-services.sh` |
| **GLOROV-PERF-002** | **`ignoreBuildErrors: true`** in `next.config.ts` — TypeScript errors are hidden during production builds. Broken types will silently deploy. | HIGH | [`next.config.ts`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/next.config.ts) |
| **GLOROV-PERF-003** | **`ignoreDuringBuilds: true`** for ESLint — Lint errors hidden during production builds. | MEDIUM | [`next.config.ts`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/next.config.ts) |
| **GLOROV-PERF-004** | **2,059-line `mock-data.ts`** shipped in bundles — Entire hardcoded product catalog included in server and potentially client bundles, increasing memory usage and bundle size. | HIGH | [`mock-data.ts`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/lib/mock-data.ts) |
| **GLOROV-PERF-005** | **No CDN for static assets** — Static files served directly through Next.js standalone → PM2 → Caddy. No CloudFront, Cloudflare, or similar CDN. | MEDIUM | Deploy configuration |
| **GLOROV-PERF-006** | **Fulfillment search without pagination** — Shiprocket webhook handler queries ALL fulfillments to find AWB match. O(n) scan that degrades with order volume. | MEDIUM | [`hooks/shiprocket/route.ts` L145-156](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/backend/src/api/hooks/shiprocket/route.ts#L145-L156) |
| **GLOROV-PERF-007** | **Serviceability cache clears entirely at 1000 entries** — Instead of LRU eviction, the entire cache is dropped when hitting the limit (L256-258). Brief performance degradation spike. | LOW | [`client.ts` L256-258](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/backend/src/modules/fulfillment-shiprocket/client.ts#L256-L258) |

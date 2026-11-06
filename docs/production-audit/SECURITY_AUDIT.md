# GLOROV — Security Audit (Production Readiness)

> **Audit Date:** November 6, 2026  
> **Standard:** OWASP Top 10:2021, CWE Top 25  

---

## 1. Verified Security Controls (Backend)

| Control | Status | Evidence |
|---|---|---|
| Open redirect prevention (SEC-01) | ✅ REMEDIATED | `getSafeRedirectUrl()` in `apps/storefront/src/lib/security.ts` |
| Image SSRF lockdown (SEC-02) | ✅ REMEDIATED | `next.config.ts` restricts to `res.cloudinary.com` and `i.imgur.com` |
| Webhook timing-safe verification (SEC-04) | ✅ REMEDIATED | `crypto.timingSafeEqual` in Razorpay + Shiprocket webhook handlers |
| Production fail-closed secrets (SEC-05) | ✅ REMEDIATED | `validateProductionConfig()` in `medusa-config.ts` |
| Rate limiting (SEC-06) | ✅ REMEDIATED | `apps/backend/src/api/middlewares/rate-limiter.ts` |
| IDOR prevention (SEC-07) | ✅ REMEDIATED | `validateOrderOwnership` in `apps/backend/src/api/middlewares.ts` |
| CSV import DoS prevention (SEC-08) | ✅ REMEDIATED | File size limits, row limits in CSV import routes |
| Mock mode production guard (SEC-09) | ✅ REMEDIATED | Fatal errors if `*_MOCK_MODE=true` in production |

---

## 2. Security Gaps Found

| ID | Severity | Finding | Status | Fix Reference |
|---|---|---|---|---|
| GLOROV-SEC-001 | CRITICAL | **Cloudinary API secret hardcoded** in `medusa-config.ts` and committed in `.env.example`. | ✅ RESOLVED | FIX-004 (Removed hardcoded credentials, enforced `validateProductionConfig` check, sanitized `.env.example`) |
| GLOROV-SEC-002 | HIGH | **Publishable API key hardcoded** as fallback in `constants.ts`. | ✅ RESOLVED | FIX-004 (Removed fallback, throws clear Error if missing) |
| GLOROV-SEC-003 | HIGH | **Security headers not implemented** in `next.config.ts`. | ✅ RESOLVED | FIX-004 (Added HSTS, X-Content-Type-Options, X-Frame-Options, CSP, Referrer-Policy, Permissions-Policy; disabled poweredByHeader) |
| GLOROV-AUTH-001 | CRITICAL | **Authentication is fully simulated.** | ✅ RESOLVED | FIX-001 |
| GLOROV-AUTH-003 | HIGH | **No server-side route protection.** Account pages rely on client-side state. | OPEN | Pending Next.js middleware.ts |
| GLOROV-PROXY-001 | HIGH | **Unrestricted Medusa proxy.** `next.config.ts` rewrites `/medusa/:path*` to backend. | ✅ RESOLVED | FIX-004 (Restricted to `/medusa/store/:path*` exclusively) |
| — | MEDIUM | **No CSRF protection** on storefront API routes (`/api/checkout/*`, `/api/offers/*`). | OPEN | Cross-site request forgery possible on order placement. |
| — | MEDIUM | **No Content Security Policy.** | ✅ RESOLVED | FIX-004 (Added comprehensive CSP in `next.config.ts`) |
| — | LOW | **`poweredByHeader` not disabled.** | ✅ RESOLVED | FIX-004 (`poweredByHeader: false` in `next.config.ts`) |

---

## 3. Secret Management Audit

| Variable | Classification | Status |
|---|---|---|
| `JWT_SECRET` | SECRET | ✅ Required ≥32 chars in production, validated by `validateProductionConfig` |
| `COOKIE_SECRET` | SECRET | ✅ Required ≥32 chars in production, validated by `validateProductionConfig` |
| `DATABASE_URL` | SECRET | ✅ Required in production |
| `REDIS_URL` | SECRET | ✅ Required in production |
| `RAZORPAY_KEY_SECRET` | SECRET | ✅ Env-var only, no hardcoded fallback |
| `RAZORPAY_WEBHOOK_SECRET` | SECRET | ✅ Env-var only |
| `SHIPROCKET_PASSWORD` | SECRET | ✅ Env-var only |
| `SHIPROCKET_WEBHOOK_TOKEN` | SECRET | ✅ Env-var only |
| `SMTP_USER` / `SMTP_PASSWORD` | SECRET | ✅ Env-var only |
| `CLOUDINARY_API_SECRET` | SECRET | ✅ **REMEDIATED** in `medusa-config.ts`, `.env.example`, and docker-compose (FIX-004) |
| `CLOUDINARY_API_KEY` | CONFIG | ✅ **REMEDIATED** in `medusa-config.ts`, `.env.example`, and docker-compose (FIX-004) |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | PUBLIC | ✅ **REMEDIATED** fail-closed env var validation without fallback (FIX-004) |
| `NEXT_PUBLIC_*` variables | PUBLIC | ✅ Correctly prefixed, no secrets exposed |

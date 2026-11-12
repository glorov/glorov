# GLOROV — ElseSourav Platform Publishing & Updates Package

> **Platform:** [elsesourav.com](https://elsesourav.com)  
> **Target Sections:** 
> 1. **New Application** (`/admin/apps/new`)
> 2. **New Update / Changelog** (`/admin/updates/new`)  
> **Status:** 100% Production Ready & Verified  
> **Generated Media Assets:** [docs/elsesourav-publish/](file:///Users/sourav/Developer/WEB/top-projects/glorov/docs/elsesourav-publish)

---

## Part 1: Media Assets Summary

All required images have been generated at exact platform aspect ratios using Glorov brand typography (*Fraunces Serif* & *Plus Jakarta Display*), real live screenshots, and studio device framing:

| Asset Name | Target Field | Aspect Ratio | Dimensions | Local Path |
| :--- | :--- | :--- | :--- | :--- |
| **Application Icon** | `Application Icon *` | `1:1` | `512 × 512 px` | [`glorov-app-icon.png`](file:///Users/sourav/Developer/WEB/top-projects/glorov/docs/elsesourav-publish/glorov-app-icon.png) |
| **Desktop Featured Banner** | `Desktop Featured Banner (21:9)` | `21:9` | `2520 × 1080 px` | [`glorov-desktop-banner-21x9.png`](file:///Users/sourav/Developer/WEB/top-projects/glorov/docs/elsesourav-publish/glorov-desktop-banner-21x9.png) |
| **Mobile Featured Banner** | `Mobile Featured Banner (3:4)` | `3:4` | `1080 × 1440 px` | [`glorov-mobile-banner-3x4.png`](file:///Users/sourav/Developer/WEB/top-projects/glorov/docs/elsesourav-publish/glorov-mobile-banner-3x4.png) |
| **Update / Changelog Cover** | `Cover Image URL / Upload` | `16:9` | `1920 × 1080 px` | [`glorov-update-cover-16x9.png`](file:///Users/sourav/Developer/WEB/top-projects/glorov/docs/elsesourav-publish/glorov-update-cover-16x9.png) |

---

## Part 2: "New Application" Form Fields (Field-by-Field)

### 1. General Information

- **Application Name \***:
  ```text
  GLOROV
  ```
- **URL Slug \***:
  ```text
  glorov
  ```
- **Short Description \***: *(163 / 250 chars)*
  ```text
  Enterprise-grade Indian botanical e-commerce platform built with Next.js 15, Medusa v2 headless engine, Razorpay payments, and Shiprocket courier fulfillment.
  ```
- **Build / Bundle Size (Optional)**: *(22 / 50 chars)*
  ```text
  103 kB First Load JS
  ```
- **Primary Content Language**:
  ```text
  English (en)
  ```
- **Overview & Marketing Description \***:
  ```text
  GLOROV is a high-performance botanical e-commerce platform tailored for the Indian home gardening and botanical community. Engineered as a robust full-stack monorepo, it unites a lightning-fast Next.js 15 App Router storefront with a headless Medusa v2 commerce engine running on Node.js and PostgreSQL.

  The platform features native integrations for India's digital commerce ecosystem: frictionless 1-click Razorpay UPI and card checkout with cryptographic HMAC-SHA256 webhook validation, Cash on Delivery (COD) with automatic cart-threshold safeguards, and automated Shiprocket logistics dispatch with real-time courier tracking. Backed by Redis sliding-window rate limiting, persistent PostgreSQL connection pooling, and multi-domain CORS routing, GLOROV delivers an enterprise shopping experience with 624 verified automated unit tests.
  ```

---

### 2. Technical Documentation & Guides (Markdown)

*Copy and paste the entire block below into the **Technical Documentation & Guides (Markdown)** field:*

```markdown
# GLOROV Botanical Commerce Monorepo

**GLOROV** is an enterprise-grade, production-audited Indian botanical e-commerce platform engineered for the certified seeds, exotic live plants, and organic nursery market.

---

## System Architecture

The project is structured as a high-performance **pnpm monorepo** governed by Turborepo:

```
glorov/
├── apps/
│   ├── storefront/             # Next.js 15 App Router (Vercel CDN Edge)
│   └── backend/                # Medusa v2 Headless Commerce Engine (Node.js/PM2)
├── packages/
│   ├── types/                  # Shared Zod schemas & TypeScript API contracts
│   └── config/                 # Unified ESLint, Tailwind, and Prettier rules
├── deploy/                     # Zero-downtime PM2 reload scripts & Nginx reverse proxy
└── docs/production-audit/      # 19 remediation phases (FIX-001 → FIX-019)
```

---

## Core Feature Matrix

### 1. Next.js 15 Native Storefront
- **Ultra-lightweight footprint**: Only **103 kB First Load JS** across all main shopping routes.
- **Botanical Category Feeds**: Clean 4-pillar botanical hierarchy (Seeds, Vegetables, Living Plants, Flowers) with responsive mobile stream view.
- **Micro-Interactions**: Smooth slide-over cart drawer, instant pincode serviceability lookup, and live inventory validation.
- **Zero Layout Shift**: Optimized Cloudinary CDN image delivery with AVIF/WebP formats.

### 2. Headless Medusa v2 Commerce Engine
- **Decoupled Architecture**: RESTful API operating on port 9000, proxied via Nginx with automated Let's Encrypt TLS.
- **Multi-Domain CORS Whitelist**: Simultaneous support for `glorov.com`, `admin.glorov.com`, `glorov.tech`, and `admin.glorov.tech`.
- **Database Resilience**: PostgreSQL with MikroORM explicit connection pool (min: 2, max: 10) tuned for 1GB VM hosting.
- **Sliding-Window Rate Limiting**: Distributed Redis rate limiter (`glorov:ratelimit:{ip}:{window}`) with graceful in-memory fallback.

### 3. Turnkey Indian Payment Stack
- **Razorpay Payment Gateway**: Supports UPI, Netbanking, Debit/Credit Cards, and Wallets.
- **Constant-Time Cryptographic Verification**: Webhook payloads are verified using timing-safe HMAC SHA-256 signatures (`timingSafeEqual`) to eliminate timing attacks.
- **Cash on Delivery (COD)**: Configurable ₹5,000 threshold enforcement synchronized across storefront and backend in paise units (`500,000 paise`).

### 4. Automated Logistics & Courier Fulfillment
- **Shiprocket API Integration**: Automatic consignment booking from the Pune Central Nursery Hub (`411001`).
- **Live Tracking & Webhooks**: Real-time status sync (Shipped, Out for Delivery, Delivered) with customer notification alerts.
- **Defensive Error Handling**: Safe fallback when third-party logistics APIs encounter upstream downtime.

---

## Automated Test Coverage & Quality Gate

The codebase adheres to strict automated testing standards across both frontend and backend packages:

- **Storefront Unit Tests**: 295 / 295 passing tests (Vitest + React Testing Library)
- **Backend Unit Tests**: 329 / 329 passing tests (Jest + ts-jest)
- **Total Monorepo Tests**: **624 / 624 tests passed (100% pass rate)**
- **Type Safety**: Full monorepo typecheck with zero TypeScript errors (`tsc --noEmit`)
- **Code Quality**: Strict ESLint check with zero errors across all workspaces

---

## Live Deployments & Endpoints

- **Public Storefront**: [https://www.glorov.com](https://www.glorov.com)
- **Storefront Secondary**: [https://glorov.tech](https://glorov.tech)
- **Medusa Admin Dashboard**: [https://admin.glorov.com](https://admin.glorov.com)
- **Commerce API Gateway**: [https://api.glorov.com](https://api.glorov.com)
- **Source Repository**: [github.com/elsesourav/glorov](https://github.com/elsesourav/glorov)
```

---

### 3. Media Assets & Banners

- **Application Icon \***:
  - Click **Upload** &rarr; Select `docs/elsesourav-publish/glorov-app-icon.png`
- **Desktop Featured Banner (21:9 ratio)**:
  - Click **Upload** &rarr; Select `docs/elsesourav-publish/glorov-desktop-banner-21x9.png`
- **Mobile Featured Banner (3:4 ratio)**:
  - Click **Upload** &rarr; Select `docs/elsesourav-publish/glorov-mobile-banner-3x4.png`
- **Interactive Demo URL**:
  ```text
  https://www.glorov.com
  ```
- **Showcase Video URL**:
  ```text
  https://www.glorov.com
  ```

---

### 4. Author & Attribution (Optional)

- **Contributor / Author Name**:
  ```text
  Sourav Mukherjee
  ```
- **Contributor Role / Title**:
  ```text
  Lead Architect & Full-Stack Engineer
  ```
- **Contributor Profile / Web URL**:
  ```text
  https://elsesourav.com
  ```

---

### 5. Taxonomy & Visibility

- **Primary Category \***:
  ```text
  Automation & E-Commerce
  ```
  *(or `Web Applications & CMS`)*
- **Publish Status**:
  ```text
  PUBLISHED
  ```
- **Display Sort Order**:
  ```text
  1
  ```
- **Featured Application**: `[x] Checked` (Highlights app on homepage hero spotlight)
- **Pinned to Top**: `[x] Checked` (Always ranks first in catalog grids)
- **Require User Authentication**: `[ ] Unchecked` *(Public Access)*

---

### 6. SEO & Meta Information (Optional)

- **SEO Meta Title**: *(46 / 100 chars)*
  ```text
  GLOROV — Premium Botanical E-Commerce Monorepo
  ```
- **SEO Meta Description**: *(147 / 200 chars)*
  ```text
  Explore GLOROV, a high-performance botanical e-commerce platform built with Next.js 15, Medusa v2, Redis caching, Razorpay payments, and Shiprocket.
  ```

---

## Part 3: "New Update / Changelog" Form Fields

Navigate to **Admin Portal** &rarr; **Updates** &rarr; **New Update** (`/admin/updates/new`).

### 1. General Update Fields

- **Title \***:
  ```text
  GLOROV v1.0.0: Enterprise Indian Botanical Commerce Platform Goes Live
  ```
- **URL Slug \***:
  ```text
  glorov-v1-release
  ```
- **Category \***:
  ```text
  Architecture & Design
  ```
- **Cover Image URL / Upload**:
  - Click **Upload** &rarr; Select `docs/elsesourav-publish/glorov-update-cover-16x9.png`
- **Publish Status**:
  ```text
  PUBLISHED
  ```
- **Excerpt \***:
  ```text
  Official release announcement for GLOROV v1.0.0 — a production-audited botanical e-commerce monorepo engineered with Next.js 15, Medusa v2 headless engine, Razorpay payments, Shiprocket fulfillment, and 624 automated unit tests.
  ```

---

### 2. Update Content (Markdown)

*Copy and paste the entire block below into the **Content** markdown editor:*

```markdown
We are thrilled to officially unveil **GLOROV v1.0.0**, an enterprise-grade botanical e-commerce platform engineered specifically for the Indian agricultural nursery, certified vegetable seeds, and exotic houseplant market.

GLOROV was built from the ground up to solve the real-world operational challenges of botanical commerce: perishable inventory management, accurate pincode serviceability, frictionless digital UPI payments, and automated nationwide courier dispatch.

---

## 🌟 What Makes GLOROV Different?

### 1. Modern Monorepo Architecture
Rather than relying on monolithic platforms or rigid third-party website builders, GLOROV utilizes a clean, decoupled monorepo managed by **Turborepo** and **pnpm**:

- **Storefront (`apps/storefront`)**: Built with **Next.js 15 App Router**, delivering an ultra-lightweight **103 kB First Load JS** bundle with sub-second page transitions, dynamic SSG/SSR rendering, and Cloudinary image optimization.
- **Backend (`apps/backend`)**: Headless **Medusa v2** commerce engine operating on Node.js and PostgreSQL, providing full programmatic control over products, carts, pricing, customers, and order lifecycles.
- **Shared Packages (`packages/types`, `packages/config`)**: End-to-end type safety with shared Zod validation schemas ensuring zero contract drift between frontend and backend.

---

## 🛠️ Deep Dive: The Engineering Highlights

### Turnkey Indian Payment Stack
Indian e-commerce requires specialized payment workflows. GLOROV incorporates:
- **Razorpay Integration**: Native modal checkout supporting Google Pay, PhonePe, Paytm UPI, Netbanking, and Credit/Debit cards.
- **Cryptographic Webhook Validation**: Webhook receipts are verified using Node.js `crypto.timingSafeEqual` over HMAC SHA-256 signatures, completely eliminating timing attack vectors.
- **Cash on Delivery (COD)**: Rigorously enforced ₹5,000 threshold synchronized in paise (`500,000 paise`) between client and server to prevent under- or over-ordering exploits.

### Automated Logistics with Shiprocket
- Live API integration with Shiprocket for automatic shipment generation from our Pune Central Nursery Hub (`411001`).
- Real-time courier tracking updates delivered via webhooks directly to customer accounts.

### Infrastructure & Resilience
- **PostgreSQL Connection Pool**: Explicitly configured connection limits (min: 2, max: 10) tuned for single-VM hosting without memory exhaustion.
- **Distributed Rate Limiting**: Redis sliding-window counter (`glorov:ratelimit:{ip}:{window}`) preventing API abuse and brute-force attacks, with in-memory fallback.
- **Multi-Domain CORS Whitelist**: Flawless interoperability across `glorov.com`, `admin.glorov.com`, `glorov.tech`, and `admin.glorov.tech`.

---

## 📊 The Production Audit Journey

Before going live, the GLOROV codebase underwent a comprehensive **19-phase production readiness audit** (`FIX-001` through `FIX-019`):

- **624 / 624 Automated Unit Tests Passing**: 295 storefront tests (Vitest) and 329 backend tests (Jest) with 100% pass rate.
- **Zero TypeScript Errors**: Clean `pnpm turbo typecheck` across all 4 monorepo packages.
- **Zero ESLint Errors**: Strict code standards verified across all workspaces.

---

## 🔗 Explore the Live Platform

- **Live Storefront**: [https://www.glorov.com](https://www.glorov.com)
- **Admin Dashboard**: [https://admin.glorov.com](https://admin.glorov.com)
- **Source Code**: [github.com/elsesourav/glorov](https://github.com/elsesourav/glorov)
```

---

### 3. SEO & Attribution for Updates

- **Author Name**: `Sourav Mukherjee`
- **Author Role**: `Lead Architect & Creator`
- **Author Profile URL**: `https://elsesourav.com`
- **SEO Meta Title**:
  ```text
  GLOROV v1.0.0 Release: Enterprise Botanical Commerce Platform Goes Live
  ```
- **SEO Meta Description**:
  ```text
  Official release announcement for GLOROV v1.0.0: A production-ready botanical commerce monorepo built with Next.js 15, Medusa v2, Razorpay, and Shiprocket.
  ```

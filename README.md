# GLOROV — Indian E-commerce Platform (Seeds & Live Botanicals)

> High-performance direct-to-consumer commerce platform tailored for the Indian market, engineered with the **Medusa v2** modular commerce engine and a **Next.js 15 App Router** storefront.

[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![pnpm Version](https://img.shields.io/badge/pnpm-9.15.9-orange.svg)](https://pnpm.io/)
[![Medusa Version](https://img.shields.io/badge/Medusa-v2.22.0-blue.svg)](https://medusajs.com/)
[![Next.js Version](https://img.shields.io/badge/Next.js-15.1.7-black.svg)](https://nextjs.org/)
[![Tests Passing](https://img.shields.io/badge/Tests-673%20Passing-success.svg)](file:///Users/sourav/Developer/WEB/top-projects/glorov/docs/testing.md)

---

## 1. System Topology

```
glorov/
├── apps/
│   ├── backend/               # Medusa v2 Headless Commerce Engine & Admin (:9000)
│   └── storefront/            # Next.js 15 App Router Customer Storefront (:3000)
├── packages/
│   ├── types/                 # Shared TypeScript DTOs, Zod schemas & validations
│   └── config/                # Standardized TypeScript & ESLint configurations
├── caddy/                     # Reverse proxy configuration with automatic Let's Encrypt TLS
├── scripts/                   # Database backup, restore, and post-deployment smoke tests
├── docs/                      # Architectural blueprints, ADRs, test plans, and runbooks
│   └── decisions/             # Architecture Decision Records (ADR-0001 to ADR-0006)
├── docker-compose.yml         # Local development PostgreSQL 16 & Redis 7
├── docker-compose.prod.yml    # Production multi-container Blue/Green deployment
├── pnpm-workspace.yaml        # Workspace dependency topology
└── turbo.json                 # Turborepo task execution pipeline
```

---

## 2. Prerequisites & Software Versions

| Dependency | Required Version | Verification Command |
|---|---|---|
| **Node.js** | `>= 20.0.0` (Pinned in `.nvmrc` to `20.19.5`) | `node -v` |
| **pnpm** | `>= 9.0.0` (Pinned in `package.json` to `9.15.9`) | `pnpm -v` |
| **Docker Engine** | `>= 24.0.0` (For local PostgreSQL 16 & Redis 7) | `docker --version` |
| **Docker Compose** | `>= 2.20.0` | `docker compose version` |

If using `nvm`, switch to the supported runtime:
```bash
nvm use
```

---

## 3. Quick Start & Local Setup

### Step 1: Install Dependencies
From the repository root, install dependencies across all workspace packages:
```bash
pnpm install
```

### Step 2: Start Local Database Services
Launch the local PostgreSQL 16 and Redis 7 containers:
```bash
pnpm db:up
# Runs: docker compose up -d postgres redis
```

### Step 3: Configure Environment Variables
Copy template environment files for backend and storefront:
```bash
# Backend configuration
cp apps/backend/.env.example apps/backend/.env

# Storefront configuration
cp apps/storefront/.env.example apps/storefront/.env.local
```

### Step 4: Run Medusa Database Migrations
Initialize core commerce tables, relationships, and custom modules:
```bash
pnpm backend:migrate
# Runs: pnpm --filter @glorov/backend db:migrate
```

### Step 5: Create Administrator Account
Create credentials for the Medusa Admin dashboard:
```bash
pnpm --filter @glorov/backend user -e admin@glorov.in -p SuperSecretPassword123!
```

### Step 6: Seed Indian Regional Configuration & Catalog
Initialize India region, INR currency, Pune Nursery stock location, and seed botanical products:
```bash
pnpm backend:seed
```

---

## 4. Development Commands

Run both backend and storefront concurrently using Turborepo:
```bash
pnpm dev
```

Or run individual services independently:

```bash
# Medusa v2 Backend & Admin Dashboard
pnpm backend:dev
# API Root:        http://localhost:9000
# Admin Dashboard: http://localhost:9000/app
# Health Check:    http://localhost:9000/health

# Next.js Storefront
pnpm storefront:dev
# Storefront Web:  http://localhost:3000
```

---

## 5. Testing & Quality Gates

GLOROV enforces a 3-tier testing strategy ensuring 100% verification across all critical commerce flows:

```bash
# Run all unit tests across the monorepo
pnpm test

# Run Storefront Vitest Suite (17 suites, 258 tests)
pnpm --filter @glorov/storefront test

# Run Backend Jest Unit Suite (15 suites, 229 tests)
pnpm --filter @glorov/backend test:unit

# Run Backend HTTP Integration Suite against real Postgres & Redis (12 suites, 186 tests)
pnpm --filter @glorov/backend test:integration:http

# Run Post-Deployment Smoke Probes against live/running servers (7 probes)
pnpm smoke:test http://localhost:9000 http://localhost:3000

# Typecheck all packages
pnpm typecheck

# Lint all packages
pnpm lint
```

**Automated Test Summary:** **44 test suites, 673 automated tests passing (100% pass rate)**.

---

## 6. Production Build & Deployment

Build production-optimized bundles across all packages:
```bash
pnpm build
```

- **Medusa Backend Build:** `pnpm backend:build` (`medusa build` -> `.medusa/server`)
- **Next.js Storefront Build:** `pnpm storefront:build` (`next build` -> `.next/standalone`)

### Production Docker Deployment
```bash
# Deploy with Docker Compose using automated Blue/Green cutover and Caddy TLS
docker compose -f docker-compose.prod.yml up -d
```
See the complete [Production Deployment Guide](file:///Users/sourav/Developer/WEB/top-projects/glorov/docs/production-deployment.md) for zero-downtime Blue/Green cutover and rollback procedures.

---

## 7. Key Documentation Links

| Document | Description |
|---|---|
| [**Developer Handover Guide**](file:///Users/sourav/Developer/WEB/top-projects/glorov/docs/developer-handover.md) | Exhaustive directory breakdown, commerce flows, API catalog, and developer workflows. |
| [**Production Readiness & Launch Checklist**](file:///Users/sourav/Developer/WEB/top-projects/glorov/docs/launch-checklist.md) | Launch blockers, statutory Indian compliance (DPDP, GSTIN), and dry-run checklist. |
| [**Architecture Decision Records (ADRs)**](file:///Users/sourav/Developer/WEB/top-projects/glorov/docs/decisions/) | Key architectural decisions, trade-offs, and evaluated alternatives (ADR-0001 to ADR-0006). |
| [**Technical Architecture Blueprint**](file:///Users/sourav/Developer/WEB/top-projects/glorov/docs/architecture.md) | Comprehensive system architecture and domain models. |
| [**Implementation Roadmap & Audit**](file:///Users/sourav/Developer/WEB/top-projects/glorov/docs/implementation-roadmap.md) | Granular 30-task engineering roadmap with evidence-backed completion status. |
| [**Security Audit & Remediations**](file:///Users/sourav/Developer/WEB/top-projects/glorov/docs/security-audit.md) | Security audit report verifying mitigations SEC-01 through SEC-09. |
| [**Integration Inventory**](file:///Users/sourav/Developer/WEB/top-projects/glorov/docs/integration-inventory.md) | Comprehensive inventory of backend APIs, storefront routes, and webhooks. |
| [**End-to-End Test Plan**](file:///Users/sourav/Developer/WEB/top-projects/glorov/docs/e2e-test-plan.md) | Test cases, fixtures, and verification procedures. |

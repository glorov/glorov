# GLOROV — Indian E-commerce Platform (Seeds & Live Botanicals)

Production-oriented headless e-commerce monorepo built on **Medusa v2** modular commerce engine and a high-performance **Next.js 15 App Router** storefront.

---

## 1. System Topology

```
glorov/
├── apps/
│   ├── backend/               # Medusa v2 Commerce Engine & Admin Dashboard (:9000)
│   └── storefront/            # Next.js 15 App Router Frontend (:3000)
├── packages/
│   ├── types/                 # Shared domain DTOs (Botanical, Pincode, Product)
│   └── config/                # Shared TypeScript and ESLint configurations
├── docs/
│   ├── architecture.md        # Comprehensive Technical Architecture Blueprint
│   └── implementation-roadmap.md # 30-task granular implementation roadmap
├── docker-compose.yml         # Local development PostgreSQL 16 & Redis 7
├── pnpm-workspace.yaml        # Workspace configuration
└── turbo.json                 # Turborepo task execution pipeline
```

---

## 2. Prerequisites & Environment Baseline

- **Node.js:** `v20.x` LTS or `v22.x` LTS (Pinned in `.nvmrc` to `20.19.5`)
- **Package Manager:** `pnpm` (Pinned to `9.15.9`)
- **Database:** PostgreSQL 16+ (Local Docker container or Supabase Session Pooler on Port `5432`)
- **Docker Engine:** Required for local development database services

If using `nvm`, switch to the supported Node.js version:
```bash
nvm use
```

---

## 3. Quick Start & Setup Guide

### Step 1: Install Monorepo Dependencies
From the repository root, install dependencies across all workspace packages:
```bash
pnpm install
```

### Step 2: Start Local PostgreSQL Database
Launch the local PostgreSQL 16 and Redis 7 containers:
```bash
pnpm db:up
# Or directly: docker compose up -d postgres redis
```

Verify that the database container is healthy:
```bash
docker ps
```

### Step 3: Configure Environment Variables
Copy the environment template files for both the backend and storefront:

```bash
# Backend environment
cp apps/backend/.env.example apps/backend/.env

# Storefront environment
cp apps/storefront/.env.example apps/storefront/.env.local
```

### Step 4: Run Medusa Database Migrations
Run the initial Medusa schema migrations to create all commerce tables:
```bash
pnpm backend:migrate
# Or: pnpm --filter @glorov/backend db:migrate
```

### Step 5: Create Local Medusa Admin User
Create an administrative user for the Medusa Admin dashboard:
```bash
pnpm --filter @glorov/backend user -e admin@glorov.in -p SuperSecretPassword123!
```

---

## 4. Running the Development Servers

You can run both the backend and storefront concurrently using Turborepo:
```bash
pnpm dev
```

Or run each service individually:

- **Medusa v2 Backend & Admin Dashboard:**
  ```bash
  pnpm backend:dev
  # Backend API: http://localhost:9000
  # Admin Dashboard: http://localhost:9000/app
  # Health Check: http://localhost:9000/health
  ```

- **Next.js Storefront:**
  ```bash
  pnpm storefront:dev
  # Storefront Web: http://localhost:3000
  ```

---

## 5. Verification & Quality Gates

Run quality checks across all workspaces:

```bash
# Type check all packages
pnpm typecheck

# Lint all code
pnpm lint

# Build production artifacts
pnpm build
```

---

## 6. Accessing Local Admin & Storefront

- **Storefront Homepage:** [http://localhost:3000](http://localhost:3000)
- **Medusa Admin Dashboard:** [http://localhost:9000/app](http://localhost:9000/app)
- **Backend Health Check:** [http://localhost:9000/health](http://localhost:9000/health)
- **Store API Root:** [http://localhost:9000/store/products](http://localhost:9000/store/products)

---

## 7. Next Roadmap Milestone

Following the approved `docs/implementation-roadmap.md`, the next phase is:
**Phase 2, Task 6: Seed Default Indian Region, INR Currency & Sales Channel**, followed by **Phase 3: Domain Modeling & Botanical Product Extensions (Medusa v2 DML)**.

# GLOROV E-commerce Platform — Technical Architecture Document

**Document Version:** 1.0.0  
**Status:** Approved Architectural Blueprint  
**System Type:** Headless E-commerce Platform (Modular Commerce Engine + Server-Rendered Storefront)  
**Target Market:** India (D2C Seeds, Indoor/Outdoor Live Plants, and Gardening Supplies)  
**Primary Authors:** Senior Software Architect & Engineering Lead  

---

## 1. Executive Summary & Business Context

### 1.1 Business Mission
GLOROV is an Indian direct-to-consumer (D2C) e-commerce brand specializing in high-viability agricultural and home gardening seeds, potted indoor and outdoor live plants, organic potting mixes, and gardening accessories. 

The domain of live botanical e-commerce presents unique operational and technical challenges distinct from standard retail:
1. **Perishable vs. Non-Perishable Inventory:** Seeds represent high-density, shelf-stable, lightweight inventory with long shelf lives (12–24 months), whereas live plants are fragile, perishable biological assets sensitive to transit durations, ambient heat, light deprivation, and physical shock.
2. **Variant Dynamics:** Seed products vary primarily by quantity and packaging (e.g., 20 seeds packet, 50 seeds packet, 100 seeds bulk pack), whereas live plants vary by physical dimensions (4-inch nursery pot, 6-inch self-watering pot, 8-inch ceramic planter, foliage height).
3. **Logistics in India:** Live plants cannot endure standard 7-day surface transit across non-metro routes without high mortality rates. Shipments require courier serviceability checks per 6-digit Indian PIN code, segregation of fragile perishable parcels from seed parcels, and express air/surface routing.
4. **Payment Culture & RTO (Return to Origin) Mitigation:** Cash on Delivery (COD) remains a predominant payment preference in India (accounting for 40% to 65% of initial orders in tier-2/tier-3 cities). However, in live plant retail, a rejected COD delivery results in complete inventory destruction due to return transit delays. The architecture must enforce strict COD eligibility rules, order value caps, PIN code validation, and automated customer verification workflows before dispatch.
5. **Fiscal Compliance:** Under Indian Goods and Services Tax (GST) law, agricultural seeds for sowing are generally exempt (0% GST under HSN 1209), whereas live ornamental plants, ceramic planters, tools, and fertilizers carry 5%, 12%, or 18% GST rates. The platform must accurately compute split GST and generate GST-compliant B2C tax invoices.

### 1.2 Core Architectural Objectives
- **Modularity:** Leverage the official Medusa v2 module framework without reinventing core commerce primitives (catalog, pricing, inventory, cart, checkout, orders, customer management).
- **Loose Coupling:** Cleanly isolate the commerce backend from the presentation tier via strict API boundaries (Medusa Store API and Admin API).
- **Type Safety & Reliability:** End-to-end TypeScript with strict typing, schema validation using Zod at boundary interfaces, and automated contract testing.
- **Maintainability & Observability:** Clean directory hierarchy, structured logging, centralized error handling, and transactional workflow rollback safety.
- **Extensibility:** Externalized integrations (payment gateways, courier aggregators, ERPs) designed as standalone Medusa v2 Module Providers that can be swapped or extended without refactoring application core code.

---

## 2. Workspace Inspection & Environment Baseline

An inspection of the workspace was conducted on the host system:
- **Workspace Path:** `/Users/sourav/Developer/WEB/top-projects/glorov`
- **Initial Directory State:** Clean, empty workspace directory (no pre-existing configuration, package manifests, or code).
- **Runtime Environment:**
  - **Node.js:** `v24.19.0` (Host system default)
  - **npm:** `11.17.0`
  - **pnpm:** `9.15.9` (Installed and active)
  - **PostgreSQL Client (`psql`):** Available via `/opt/homebrew/bin/psql` (PostgreSQL 16/17 client tooling)
  - **Docker Engine:** Available via `/usr/local/bin/docker`

### Critical Compatibility Notice — Node.js Versioning
Medusa v2 officially targets Node.js LTS versions (**Node.js 20.x** and **Node.js 22.x**). Running bleeding-edge Node.js `v24` in production or during native module compilation (e.g., cryptographic bindings, MikroORM native drivers) carries stability risks and package incompatibility warnings.
- **Requirement:** The workspace will establish a `.nvmrc` and `.tool-versions` pinning Node.js to `20.18.0` or `22.11.0` LTS. Developers using Node 24 must switch to an active LTS version before running initialization scripts.

---

## 3. Repository Architecture: Monorepo vs. Polyrepo Evaluation

### 3.1 Structural Options Analyzed

| Dimension | Polyrepo Approach (Separate Repos) | Monorepo Approach (pnpm Workspaces + Turborepo) | Recommendation |
| :--- | :--- | :--- | :--- |
| **Code Sharing & DTOs** | Requires publishing private npm packages for shared types/schemas or duplicate code. | Instant sharing of TypeScript interfaces, Zod validation schemas, and API client wrappers via internal workspace packages (`@glorov/types`). | **Monorepo** |
| **Full-Stack Atomic Commits** | Commits must be synchronized across git repositories; prone to version mismatches. | Single pull request can contain both backend workflow changes and corresponding storefront UI updates. | **Monorepo** |
| **Local Developer Experience** | Requires running multiple terminals, manual linking, and managing independent `.env` files. | Single root command (`pnpm dev`) orchestrates backend, storefront, and background workers with unified output streaming. | **Monorepo** |
| **CI/CD Build Times** | Independent pipelines, but duplicate setup steps and no shared caching. | Turborepo provides pipeline dependency graphs, task execution caching, and selective test execution for changed workspaces only. | **Monorepo** |
| **Deployment Boundaries** | Simple independent deployment targets. | Easily maintained in modern deployment platforms (Vercel/Cloudflare for `apps/storefront`, Railway/Render/AWS ECS for `apps/backend`). | **Monorepo** |

### 3.2 Verdict & Structure Selection
A **lightweight monorepo managed via `pnpm workspaces` and `Turborepo`** is selected. It avoids the heavyweight complexity of multi-language enterprise monorepos while providing seamless type safety between Medusa v2 APIs and Next.js 15 App Router frontends.

---

## 4. System Boundaries & Service Responsibilities

To avoid the anti-pattern of "pseudo-microservices" (where a monolithic backend is artificially fractured into fragile HTTP micro-services), GLOROV uses a clean **Headless Two-Tier Architecture**:

```mermaid
flowchart TD
    subgraph Client_Tier["Client Tier"]
        Browser["Customer Browser / Mobile Web"]
        AdminBrowser["GLOROV Operations / Admin Dashboard"]
    end

    subgraph Storefront_Tier["Storefront Tier (Next.js 15 App Router)"]
        RSC["React Server Components (SEO & Initial HTML)"]
        ClientComp["Client Components (Cart, Checkout Forms, UI State)"]
        BFF["Server Actions & Route Handlers (/api/*)"]
    end

    subgraph Commerce_Tier["Commerce Engine (Medusa v2 Modular Monolith)"]
        StoreAPI["Medusa Store API (/store/*)"]
        AdminAPI["Medusa Admin API (/admin/*)"]
        MedusaAdminUI["Medusa Embedded Admin Dashboard (/app)"]
        
        subgraph Core_Modules["Core Commerce Modules"]
            ModProduct["Product & Catalog Module"]
            ModPricing["Pricing & Promotion Module"]
            ModInventory["Inventory & Stock Location Module"]
            ModCart["Cart & Checkout Workflows"]
            ModOrder["Order & Fulfillment Module"]
            ModCustomer["Customer & Auth Module"]
        end

        subgraph Custom_Providers["Custom Module Providers"]
            ProvRazorpay["Razorpay Payment Provider"]
            ProvCOD["Restricted COD Payment Provider"]
            ProvShiprocket["Shiprocket Fulfillment Provider"]
            ProvNotification["WhatsApp & Email Notification Provider"]
        end

        Workflows["Workflows Engine & Event Bus (Redis)"]
    end

    subgraph Data_Tier["Data & Cloud Infrastructure"]
        Postgres["PostgreSQL 16 (Direct / Session Pooler)"]
        RedisInstance["Redis 7 (Event Bus & Workflow State)"]
        S3Storage["S3-Compatible Object Storage (Product Media)"]
    end

    subgraph External_Services["External Indian Services"]
        RazorpayGateway["Razorpay Payments API"]
        ShiprocketAPI["Shiprocket Logistics API"]
        GupshupAPI["Gupshup / Interakt WhatsApp API"]
    end

    Browser -->|HTTPS / WSS| RSC
    Browser -->|Interactive Requests| ClientComp
    ClientComp -->|Next.js Server Actions / SDK| BFF
    BFF -->|REST Store API + Publishable Key| StoreAPI
    AdminBrowser -->|HTTPS / Session Auth| MedusaAdminUI
    MedusaAdminUI -->|REST Admin API + Secret Key| AdminAPI

    StoreAPI --> Core_Modules
    AdminAPI --> Core_Modules
    Core_Modules --> Workflows
    Workflows --> Custom_Providers

    Core_Modules -->|MikroORM Connection| Postgres
    Workflows -->|Pub/Sub & Orchestration| RedisInstance
    Core_Modules -->|Presigned URLs| S3Storage

    ProvRazorpay -->|HTTPS REST & Webhooks| RazorpayGateway
    ProvShiprocket -->|Rate, AWB & Tracking APIs| ShiprocketAPI
    ProvNotification -->|Order Alerts & OTP| GupshupAPI
```

### 4.1 Medusa v2 Backend Responsibilities
1. **Source of Truth:** Catalog, product hierarchies, variant pricing, multi-location inventory levels, order states, payment statuses, and customer accounts.
2. **Business Workflow Execution:** All state mutations execute through Medusa Workflows (`@medusajs/framework/workflows-sdk`), ensuring ACID transaction isolation and compensating rollback steps if external operations fail.
3. **Admin Dashboard:** Out-of-the-box, extensible operational console (`/app`) for catalog management, inventory adjustments, order review, fulfillment creation, and customer care.
4. **Integration Isolation:** Third-party integrations (Razorpay, Shiprocket) exist exclusively as Medusa Module Providers or custom subscribers.
5. **Security & Authentication:** Generates and validates customer JWT tokens, manages Publishable API Key scopes (linking storefront to sales channels), and protects Admin endpoints with role-based policies.

### 4.2 Next.js Storefront Responsibilities
1. **User Experience & Presentation:** Server-side rendered (SSR) catalog pages with semantic HTML, high performance Core Web Vitals, accessible UI components built with Tailwind CSS and shadcn/ui.
2. **Search Engine Optimization (SEO):** OpenGraph metadata, structured JSON-LD (Product, Offer, BreadcrumbList, FAQ schema for plant care), dynamic sitemaps for seed varieties and botanical names.
3. **Cart Session Coordination:** Manages cart persistence via browser cookies (`cart_id`), synchronizing local UI state with the Medusa Cart module.
4. **Client-Side Form Validation:** Real-time form validation via Zod (Indian 6-digit PIN codes, 10-digit mobile numbers, shipping addresses) before transmitting payloads to the backend.
5. **Strict Boundary Rule:** The storefront **never** communicates directly with PostgreSQL or Supabase. It consumes only the public Store API exposed by the Medusa backend.

---

## 5. Proposed Folder Tree & Directory Purpose

```
glorov/
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Unified CI: Lint, type-check, unit tests
│       ├── deploy-backend.yml         # Container build & deployment to backend host
│       └── deploy-storefront.yml      # Storefront deployment to Vercel/Edge host
├── apps/
│   ├── backend/                       # Medusa v2 Commerce Engine
│   │   ├── src/
│   │   │   ├── admin/                 # Admin Dashboard UI extensions & widgets
│   │   │   │   └── widgets/
│   │   │   │       ├── plant-care-widget.tsx   # Custom widget for plant care specs
│   │   │   │       └── shiprocket-tracking.tsx # Tracking timeline widget on orders
│   │   │   ├── api/                   # Custom API Routes & Middlewares
│   │   │   │   ├── middlewares.ts     # Global request middlewares & CORS
│   │   │   │   ├── store/             # Storefront-accessible custom endpoints
│   │   │   │   │   └── pincode-check/ # Serviceability lookup before cart add
│   │   │   │   └── hooks/             # External Webhook receivers
│   │   │   │       ├── razorpay/      # Payment capture & refund webhooks
│   │   │   │       └── shiprocket/    # AWB status & tracking webhooks
│   │   │   ├── modules/               # Custom Medusa Modules & Providers
│   │   │   │   ├── plant-attributes/  # Botanical data module (Sunlight, Water, Soil)
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── models/
│   │   │   │   │   ├── service.ts
│   │   │   │   │   └── migrations/
│   │   │   │   ├── payment-razorpay/  # Razorpay AbstractPaymentProvider
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── service.ts
│   │   │   │   ├── payment-cod/       # Restricted COD AbstractPaymentProvider
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── service.ts
│   │   │   │   └── fulfillment-shiprocket/ # Shiprocket AbstractFulfillmentProviderService
│   │   │   │       ├── index.ts
│   │   │   │       └── service.ts
│   │   │   ├── links/                 # Module Links (e.g., Product <-> Botanical Specs)
│   │   │   │   └── product-botanical.ts
│   │   │   ├── subscribers/           # Event listeners (order.placed, etc.)
│   │   │   │   ├── order-placed.ts    # Triggers SMS/WhatsApp & Shiprocket draft
│   │   │   │   └── shipment-created.ts
│   │   │   └── workflows/             # Medusa Custom Workflows & Steps
│   │   │       ├── verify-cod-eligibility.ts
│   │   │       └── sync-shiprocket-order.ts
│   │   ├── medusa-config.ts           # Central Medusa v2 configuration
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile                 # Production backend containerization
│   │
│   └── storefront/                    # Next.js 15 App Router Frontend
│       ├── public/                    # Static assets, plant icons, favicon
│       ├── src/
│       │   ├── app/                   # Next.js App Router structure
│       │   │   ├── layout.tsx         # Root layout with providers & fonts
│       │   │   ├── page.tsx           # Homepage (Hero, Categories, Best Sellers)
│       │   │   ├── (auth)/            # Login, Register, Forgot Password
│       │   │   ├── (catalog)/
│       │   │   │   ├── categories/[...handle]/ # Category listing & filters
│       │   │   │   └── products/[handle]/      # Product Detail Page (PDP)
│       │   │   ├── cart/              # Cart view & line item modifications
│       │   │   ├── checkout/          # Multi-step checkout (Address, Shipping, Pay)
│       │   │   ├── order/
│       │   │   │   └── confirmed/[id]/# Order confirmation & receipt
│       │   │   └── account/           # Customer dashboard, orders, addresses
│       │   ├── components/
│       │   │   ├── ui/                # shadcn/ui primitives (Button, Dialog, Input)
│       │   │   ├── common/            # Header, Footer, MobileNav, CartDrawer
│       │   │   ├── catalog/           # ProductCard, PriceTag, VariantSelector
│       │   │   ├── botanical/         # PlantCareBadge, SowingCalendar, SunMeter
│       │   │   └── checkout/          # AddressForm, PincodeChecker, PaymentSelector
│       │   ├── lib/
│       │   │   ├── medusa-client.ts   # @medusajs/js-sdk singleton client
│       │   │   ├── constants.ts       # Region, currency (INR), locale constants
│       │   │   └── utils.ts           # Styling (cn) and currency formatters (₹)
│       │   ├── hooks/                 # React hooks (useCart, usePincode)
│       │   └── types/                 # Storefront-specific UI state types
│       ├── tailwind.config.ts         # Tailwind CSS styling configuration
│       ├── next.config.ts             # Next.js configuration (images, domains)
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── types/                         # Shared TypeScript types & DTOs
│   │   ├── src/
│   │   │   ├── botanical.ts
│   │   │   ├── pincode.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── config/                        # Shared ESLint, Prettier, TypeScript configs
│       ├── eslint/
│       └── typescript/
│
├── docs/                              # Architectural & operational documentation
│   ├── architecture.md                # System Architecture & Design Blueprint
│   └── implementation-roadmap.md      # Phased Implementation Tasks
│
├── pnpm-workspace.yaml                # Defines workspace members
├── turbo.json                         # Turborepo task pipelines & cache config
├── package.json                       # Root package scripts (dev, build, lint, test)
├── .gitignore
├── .editorconfig
└── README.md
```

---

## 6. Medusa v2 Core Modules, Custom Extensions & Configuration

### 6.1 Core Modules Utilized Without Reinvention
Medusa v2 provides a modular architecture where commerce functions exist as independent, self-contained packages. GLOROV utilizes the following core modules:

1. **`@medusajs/medusa/product`**: Manages seed and plant records, option keys (`Packet Size`, `Planter Type`), option values, variants, images, categories (`Indoor Plants`, `Vegetable Seeds`, `Fruit Seeds`), and collections.
2. **`@medusajs/medusa/pricing`**: Handles India-specific pricing in Indian Rupees (`INR` - ₹), tax-inclusive or exclusive display flags, and volume price breaks.
3. **`@medusajs/medusa/inventory` & `@medusajs/medusa/stock-location-next`**: Tracks inventory items linked to variants across specific fulfillment centers (e.g., "Pune Central Nursery", "Bangalore Dispatch Hub").
4. **`@medusajs/medusa/cart`**: Manages customer cart lifecycle, address assignment, coupon redemption, shipping method selection, and tax calculations.
5. **`@medusajs/medusa/order`**: State machine for orders, adjustments, cancellations, and status tracking.
6. **`@medusajs/medusa/payment`**: Coordinates payment collections, payment provider routing, authorization, and capture states.
7. **`@medusajs/medusa/fulfillment`**: Manages shipping options, packaging profiles, and shipment fulfillment generations.
8. **`@medusajs/medusa/customer` & `@medusajs/medusa/auth`**: Customer accounts, saved address books with Indian PIN codes/states, and secure password hashing.
9. **`@medusajs/medusa/api-key`**: Manages Publishable API Keys bound to GLOROV's default sales channel.

### 6.2 Custom Extensions & Module Providers

```mermaid
classDiagram
    class AbstractPaymentProvider {
        +initiatePayment(input)
        +authorizePayment(input)
        +capturePayment(input)
        +refundPayment(input)
        +cancelPayment(input)
        +getPaymentStatus(input)
    }

    class RazorpayPaymentProviderService {
        +static identifier: "razorpay"
        -razorpayClient: Razorpay
        +initiatePayment(input)
        +authorizePayment(input)
        +capturePayment(input)
        +refundPayment(input)
    }

    class CODPaymentProviderService {
        +static identifier: "cash-on-delivery"
        +initiatePayment(input)
        +authorizePayment(input)
        +capturePayment(input)
    }

    class AbstractFulfillmentProviderService {
        +getFulfillmentOptions()
        +validateOption(data)
        +calculatePrice(optionData, data, cart)
        +createFulfillment(data, items, order, fulfillment)
        +cancelFulfillment(fulfillment)
    }

    class ShiprocketFulfillmentService {
        +static identifier: "shiprocket"
        -shiprocketClient: ShiprocketAPI
        +getFulfillmentOptions()
        +calculatePrice(optionData, data, cart)
        +createFulfillment(data, items, order, fulfillment)
        +checkPincodeServiceability(pincode)
    }

    AbstractPaymentProvider <|-- RazorpayPaymentProviderService
    AbstractPaymentProvider <|-- CODPaymentProviderService
    AbstractFulfillmentProviderService <|-- ShiprocketFulfillmentService
```

1. **Razorpay Payment Provider (`modules/payment-razorpay`)**:
   - Extends `AbstractPaymentProvider` from `@medusajs/framework/utils`.
   - Creates Razorpay Orders via Razorpay Node SDK in `initiatePayment`.
   - Verifies cryptographic HMAC-SHA256 signatures in `authorizePayment`.
   - Handles auto-capture or manual capture upon dispatch.
2. **Restricted COD Payment Provider (`modules/payment-cod`)**:
   - Custom provider allowing orders to complete with payment status `authorized` (pending cash receipt).
   - Validates cart contents during checkout: if any cart item is tagged as a "Perishable Live Plant" and the delivery PIN code is outside metro express corridors, COD is disallowed.
3. **Shiprocket Fulfillment Provider (`modules/fulfillment-shiprocket`)**:
   - Extends `AbstractFulfillmentProviderService` from `@medusajs/framework/utils`.
   - Exposes shipping options: "Standard Seed Delivery" (Surface) and "Express Plant Care Delivery" (Air/Express).
   - Calls Shiprocket API during fulfillment creation to generate Order, allocate AWB (Air Waybill), and retrieve tracking URL.
4. **Botanical Attributes Custom Module (`modules/plant-attributes`)**:
   - Built using Medusa v2 Data Modeling Language (DML) via `model.define(...)`.
   - Stores specific botanical data: `botanical_name`, `sunlight_requirement` (Full Sun, Partial Shade, Low Light), `watering_schedule` (Daily, Alternate Days, Weekly), `difficulty_level` (Beginner, Intermediate, Expert), `sowing_season` (Kharif, Rabi, Zaid, All-Year), and `germination_days`.
   - Linked to Medusa's core Product entity via Medusa Module Links (`defineLink`).

### 6.3 Backend Configuration Pattern (`medusa-config.ts`)
```typescript
import { defineConfig, Modules } from "@medusajs/framework/utils";

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:3000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:9000",
      authCors: process.env.AUTH_CORS || "http://localhost:3000,http://localhost:9000",
      jwtSecret: process.env.JWT_SECRET || "super-secret-jwt",
      cookieSecret: process.env.COOKIE_SECRET || "super-secret-cookie",
    },
    databaseConfig: {
      pool: {
        min: 2,
        max: Number(process.env.DB_POOL_MAX) || 10,
      },
    },
  },
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/payment-razorpay",
            id: "razorpay",
            options: {
              key_id: process.env.RAZORPAY_KEY_ID,
              key_secret: process.env.RAZORPAY_KEY_SECRET,
              webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
            },
          },
          {
            resolve: "./src/modules/payment-cod",
            id: "cash-on-delivery",
            options: {
              max_order_amount: 300000, // ₹3,000 in paise
              disallow_perishables: true,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "./src/modules/fulfillment-shiprocket",
            id: "shiprocket",
            options: {
              email: process.env.SHIPROCKET_EMAIL,
              password: process.env.SHIPROCKET_PASSWORD,
            },
          },
        ],
      },
    },
  ],
});
```

---

## 7. Domain Modeling: Seeds, Plants, Variants & Inventory

### 7.1 Seed vs. Live Plant Data Model

```mermaid
erDiagram
    PRODUCT ||--o{ PRODUCT_OPTION : has
    PRODUCT ||--o{ PRODUCT_VARIANT : has
    PRODUCT_VARIANT ||--o{ VARIANT_PRICE : has
    PRODUCT_VARIANT ||--|| INVENTORY_ITEM : links_to
    INVENTORY_ITEM ||--o{ INVENTORY_LEVEL : stocked_at
    STOCK_LOCATION ||--o{ INVENTORY_LEVEL : contains
    PRODUCT ||--o| PLANT_ATTRIBUTES : linked_via_dml

    PRODUCT {
        string id PK
        string title "e.g. Fiddle Leaf Fig or Marigold Seeds"
        string handle
        string description
        string thumbnail
        string status "draft / published"
    }

    PRODUCT_OPTION {
        string id PK
        string title "Packet Size or Pot Size"
    }

    PRODUCT_VARIANT {
        string id PK
        string title "e.g. 50 Seeds or 6-inch Nursery Pot"
        string sku "GLR-SD-MAR-050 / GLR-PL-FLF-006"
        boolean manage_inventory
        boolean allow_backorder
        int weight_grams
    }

    PLANT_ATTRIBUTES {
        string id PK
        string product_id FK
        string botanical_name "e.g. Tagetes erecta"
        string category_type "seed / live_plant / potting_mix"
        string sunlight "full_sun / partial / shade"
        string watering "daily / weekly / dry"
        string season "kharif / rabi / all_season"
        int germination_days
        boolean is_perishable
    }

    INVENTORY_ITEM {
        string id PK
        string sku
        boolean requires_shipping
    }

    INVENTORY_LEVEL {
        string id PK
        string inventory_item_id FK
        string location_id FK
        int stocked_quantity
        int reserved_quantity
    }

    STOCK_LOCATION {
        string id PK
        string name "e.g. Pune Nursery Hub"
        string address_pincode "411001"
    }
```

### 7.2 Variant & Inventory Strategy
- **Seeds Hierarchy:**
  - `Product`: "Desi Indian Tomato Seeds"
  - `Option`: "Packet Size"
  - `Variants`:
    - Variant 1: `20 Seeds Packet` | SKU: `GLR-SD-TOM-020` | Weight: `15g` | Price: `₹49`
    - Variant 2: `50 Seeds Packet` | SKU: `GLR-SD-TOM-050` | Weight: `25g` | Price: `₹99`
    - Variant 3: `100 Seeds Packet` | SKU: `GLR-SD-TOM-100` | Weight: `40g` | Price: `₹179`
  - Each variant maps to its own Medusa `InventoryItem` with real-time stock reservations to prevent overselling.
- **Plants Hierarchy:**
  - `Product`: "Snake Plant Golden Hahnii (Sansevieria)"
  - `Option`: "Planter Option"
  - `Variants`:
    - Variant 1: `4-inch Recycled Nursery Pot` | SKU: `GLR-PL-SNK-004-NUR` | Weight: `450g` | Price: `₹199`
    - Variant 2: `5-inch White Ceramic Pot` | SKU: `GLR-PL-SNK-005-CER` | Weight: `950g` | Price: `₹399`
  - Perishable flag `is_perishable: true` activates express packaging profiles and stricter shipping restrictions.

---

## 8. Commerce Lifecycle Architecture

### 8.1 Cart, Checkout & Order Processing Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer (Storefront)
    participant NextJS as Next.js Storefront (BFF)
    participant Medusa as Medusa v2 Commerce Backend
    participant Razorpay as Razorpay API
    participant Shiprocket as Shiprocket API
    participant DB as PostgreSQL Database

    Note over Customer, NextJS: 1. Browsing & Cart Building
    Customer->>NextJS: Add "50 Seeds Packet" to Cart
    NextJS->>Medusa: POST /store/carts/{id}/line-items
    Medusa->>DB: Check Inventory Reservation & Add Item
    Medusa-->>NextJS: Updated Cart Payload

    Note over Customer, NextJS: 2. Shipping Address & PIN Code Check
    Customer->>NextJS: Enter Shipping Address (PIN: 560001, Bangalore)
    NextJS->>Medusa: POST /store/carts/{id} (Update Address)
    Medusa->>Shiprocket: Validate PIN Code Serviceability (COD/Prepaid)
    Shiprocket-->>Medusa: Serviceable (Express Courier Available)
    Medusa-->>NextJS: Validated Shipping Address

    Note over Customer, NextJS: 3. Shipping Method Selection
    Customer->>NextJS: Select "Express Nursery Courier (₹99)"
    NextJS->>Medusa: POST /store/carts/{id}/shipping-methods
    Medusa-->>NextJS: Cart Totals with Tax & Shipping Calculated

    Note over Customer, NextJS: 4. Payment Selection (Razorpay UPI)
    Customer->>NextJS: Choose Razorpay (UPI / Card)
    NextJS->>Medusa: POST /store/payment-collections/{id}/payment-sessions
    Medusa->>Razorpay: Create Razorpay Order (amount, currency INR)
    Razorpay-->>Medusa: razorpay_order_id (e.g. order_O123xyz)
    Medusa-->>NextJS: Payment Session with razorpay_order_id
    NextJS->>Customer: Render Razorpay Checkout Modal (UPI / QR)

    Note over Customer, Razorpay: 5. Authorization & Verification
    Customer->>Razorpay: Authorize Payment via UPI PIN (PhonePe / GPay)
    Razorpay-->>Customer: Payment Success (payment_id, signature)
    Customer->>NextJS: Submit {payment_id, signature}
    NextJS->>Medusa: POST /store/carts/{id}/complete
    Medusa->>Medusa: Verify HMAC-SHA256 Signature
    Medusa->>Medusa: Run CompleteCartWorkflow
    Medusa->>DB: Convert Cart to Order, Deduct Inventory
    Medusa-->>NextJS: Order Created (order_01HXYZ)
    NextJS->>Customer: Display Order Confirmation Page

    Note over Medusa, Shiprocket: 6. Fulfillment Orchestration (Async)
    Medusa->>Medusa: Emit event "order.placed"
    Medusa->>Shiprocket: Generate Shipment (Create Adhoc Order)
    Shiprocket-->>Medusa: AWB Assigned (AWB: 14325432, Delhivery Air)
    Medusa->>DB: Store AWB & Tracking Reference in Order Fulfillment
```

### 8.2 Order States & Status Transitions

```mermaid
stateDiagram-v2
    [*] --> PendingPayment: Cart Checkout Started
    
    PendingPayment --> PaymentFailed: Payment Timed Out / Declined
    PaymentFailed --> PendingPayment: Retry with Alternate Method
    
    PendingPayment --> OrderPlaced: Payment Authorized / COD Confirmed
    
    state OrderPlaced {
        [*] --> Unfulfilled
        Unfulfilled --> Processing: Inventory Picked at Nursery
        Processing --> LabelGenerated: Shiprocket AWB Created
        LabelGenerated --> Shipped: Picked Up by Courier Partner
        Shipped --> InTransit: Courier Hub Scanned
        InTransit --> OutForDelivery: Local Delivery Agent Assigned
        OutForDelivery --> Delivered: Successfully Handed to Customer
        OutForDelivery --> NDR: Customer Unavailable / Address Incomplete
        NDR --> OutForDelivery: Re-attempt Scheduled
        NDR --> RTO: 3 Failed Attempts (Return to Origin)
    }

    Delivered --> [*]: Order Fulfilled & Closed
    RTO --> Canceled: Seed Repacked / Plant Damaged (Write-off)
    PaymentFailed --> Canceled
```

---

## 9. Database & Infrastructure Architecture (PostgreSQL & Supabase)

### 9.1 Compatibility Analysis: Medusa v2 with Supabase PostgreSQL
Medusa v2 uses **MikroORM** and raw Knex query builders internally. Supabase provides managed PostgreSQL 15/16 instances. However, using Supabase as the database host requires strict adherence to connection and migration rules:

| Requirement / Constraint | Technical Impact | Architectural Solution for GLOROV |
| :--- | :--- | :--- |
| **Transaction Mode Pooler (Port 6543)** | Supavisor/PgBouncer in transaction mode does **not** support session-level prepared statements, advisory locks, or DDL migrations. Running `npx medusa db:migrate` on port 6543 causes migration failures. | **Never run migrations on port 6543.** All schema migrations execute using direct connections (Port 5432) or Session Mode pooling. |
| **Direct Connections vs IPv4 Restrictions** | Supabase direct database hosts resolve via IPv6 by default on free/standard tiers. Certain cloud container hosts (e.g., standard Render/AWS without IPv6 egress) fail to resolve IPv6 addresses. | If container hosts lack IPv6 egress, configure the **Supabase Session Mode Pooler** on port `5432` with IPv4 compatibility, or deploy PostgreSQL directly on Railway / AWS RDS (ap-south-1). |
| **Database Extensions** | Medusa v2 requires `pgcrypto` or `uuid-ossp` for UUID v4 primary keys. | Ensure extensions are enabled in PostgreSQL before running migrations: `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`. |
| **Schema Isolation & Permissions** | Supabase internal schemas (`pgsodium`, `vault`, `auth`, `storage`) have restricted event triggers. | Medusa connects using the standard administrative database user (`postgres`) to operate cleanly within the `public` schema without conflicting with Supabase-managed internal triggers. |
| **Supabase Services (Auth / Storage)** | Supabase Auth has a separate user model from Medusa Auth. | **Do not replace Medusa Auth with Supabase Auth.** Medusa's internal Auth module manages customer sessions and identity. Supabase Storage **can** be utilized as an S3-compatible asset store for plant product photography via `@medusajs/medusa/file-s3`. |

### 9.2 Database Configuration Matrix
- **Direct Migration URL (CI/CD & CLI):**
  `postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres?sslmode=require`
- **Application Runtime URL (Medusa Backend):**
  `postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require` (Session Mode Pooler in Mumbai `ap-south-1` region)
- **Connection Pool Sizing:**
  - Backend Min Pool: `2`
  - Backend Max Pool: `10` connections per container instance (preventing pool exhaustion on Supabase instances).

---

## 10. India-Specific Integrations: Payments & Logistics

### 10.1 Razorpay Payment Gateway Integration
- **Flow:** Razorpay Standard Checkout (Storefront Modal) with Webhook Verification.
- **Payment Modes:** UPI (Intent flow on mobile, QR display on desktop), Indian Debit/Credit Cards (RuPay, Visa, Mastercard with RBI 2FA mandate), Netbanking (SBI, HDFC, ICICI, Axis), and popular wallets.
- **Security & Idempotency:**
  1. The storefront requests a payment session from Medusa.
  2. Medusa's `RazorpayPaymentProviderService` contacts Razorpay to generate a unique `razorpay_order_id`.
  3. Upon completion on the client, Razorpay returns `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`.
  4. Medusa computes: `HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET)` and verifies against `razorpay_signature`.
  5. An asynchronous Webhook receiver (`/api/hooks/razorpay`) processes `payment.captured` and `payment.failed` events to guarantee order state reconciliation even if customer closes browser prematurely.

### 10.2 Cash on Delivery (COD) Rules & Safety Guardrails
To prevent catastrophic inventory loss from RTO in live plant shipments:
1. **Eligibility Restrictions:**
   - Carts containing items with `is_perishable: true` (Live Plants) are **ineligible for COD** unless the destination PIN code qualifies for 24–48 hour local express courier delivery.
   - Seed-only carts are eligible for COD pan-India (subject to courier COD serviceability).
2. **Order Value Thresholds:**
   - Minimum COD Order: `₹299`
   - Maximum COD Order: `₹2,500` (Orders above ₹2,500 require prepaid payment).
3. **Automated Verification:**
   - COD orders trigger an immediate WhatsApp/SMS message with a one-click confirmation link. Orders remain in `Pending Verification` status for up to 12 hours before warehouse picking begins.

### 10.3 Shiprocket Logistics Aggregator Integration
- **Aggregator Choice:** Shiprocket connects with Delhivery, Bluedart, Shadowfax, Xpressbees, and DTDC across 24,000+ Indian PIN codes.
- **Serviceability & Rate Quoting:**
  - Storefront PIN code lookup component calls `/store/pincode-check?pincode=XXXXXX`.
  - Backend queries Shiprocket `/v1/external/courier/serviceability` to determine:
    1. Courier availability
    2. Estimated delivery days (EDD)
    3. COD availability (`cod: 1` or `0`)
- **Package Profiling:**
  - Profile A (Seeds): Volumetric weight $\approx 100g$, packed in padded moisture-barrier envelopes.
  - Profile B (Live Plants): Sturdy corrugated ventilated boxes with root-ball moisture retention coco-peat wraps. Average weight: $500g - 2.5kg$.
- **Tracking & Webhooks:**
  - Shiprocket webhooks push tracking status changes to `/api/hooks/shiprocket`.
  - Backend subscriber maps Shiprocket statuses (`PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `RTO_INITIATED`) directly to the Medusa Fulfillment entity.
- **Controlled Administrative Shipment Dispatch:**
  - Admin eligibility evaluation (`GET /admin/orders/:id/shipment`) validates payment status (or COD ₹5,000 threshold), 6-digit Indian PIN code format, mobile phone validity, line items, and perishable live plant packing guardrails before dispatch.
  - Authorized dispatch action (`POST /admin/orders/:id/shipment`) invokes Medusa v2 `createOrderFulfillmentWorkflow` and `createOrderShipmentWorkflow` with built-in idempotency to prevent duplicate courier bookings and double-billing.
  - Shipping label retrieval (`GET /admin/orders/:id/shipment/label`) and carrier status reconciliation (`POST /admin/orders/:id/shipment/reconcile`) provide store managers with one-click dispatch verification.
- **COD Settlement vs Courier Delivery Separation:**
  - Courier delivery marks physical fulfillment as delivered, but does NOT mark COD orders as paid.
  - Bank remittance reconciliation (`POST /admin/payments/cod/reconcile`) captures the COD payment upon verified bank settlement/UTR audit, recording courier fee deductions and net settlement immutably on the order.
- **Sanitized Customer Tracking Experience:**
  - Authenticated and guest order tracking (`GET /store/orders/:id/tracking`) enforces strict order ownership checks via middleware.
  - Returns a sanitized botanical tracking timeline, courier AWB links, and real-time perishable moisture-shield status (e.g. hydration/sphagnum wrap state) without exposing internal provider tokens or margins.
  - Integrated into customer order confirmation (`/order/confirmed/[id]`) and account order history (`/account/orders/[id]`) via the accessible `ShipmentTracker` component.

---

## 11. Regulatory & Fiscal Architecture (Indian GST & Compliance)

### 11.1 GST Rate Configuration & HSN Mapping
Indian e-commerce requires tax calculation based on Harmonized System of Nomenclature (HSN) codes:

| Product Category | HSN Code | CGST Rate | SGST Rate | IGST Rate (Interstate) | Tax Exemption / Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Vegetable & Flower Seeds** | `1209` | 0% | 0% | 0% | **Exempt** under GST Notification No. 2/2017-Central Tax |
| **Live Plants & Trees** | `0602` | 0% | 0% | 0% | **Exempt** (Live trees and other plants; bulbs, roots) |
| **Plastic / Ceramic Planters**| `6912` / `3926` | 6% or 9% | 6% or 9% | 12% or 18% | Standard GST taxable rate |
| **Organic Fertilizers / Potting Mix**| `3101` / `3105` | 2.5% | 2.5% | 5% | Concessional agricultural rate |
| **Gardening Tools & Accessories** | `8201` | 9% | 9% | 18% | Standard industrial rate |

### 11.2 Tax Resolution Logic
- **Intrastate Supply (e.g., Warehouse in Maharashtra $\rightarrow$ Customer in Maharashtra):** Total Tax splits into equal **CGST** and **SGST** portions.
- **Interstate Supply (e.g., Warehouse in Maharashtra $\rightarrow$ Customer in Karnataka):** Total Tax levied as **IGST**.
- Medusa's tax calculation workflow resolves the customer shipping state, compares it to the stock location state, and produces compliant itemized tax totals on order receipts.

---

## 12. Environment Conventions, Secrets & CI/CD Pipeline

### 12.1 Environment Matrix

| Environment | Purpose | Database Host | Backend Host | Storefront Host |
| :--- | :--- | :--- | :--- | :--- |
| **Development** | Local feature building & testing | Local Docker PostgreSQL / Supabase Dev | `http://localhost:9000` | `http://localhost:3000` |
| **Staging** | Pre-production testing, QA & client review | Supabase Staging Branch (ap-south-1) | Cloud Container (Railway/Render) | Vercel Preview Deployments |
| **Production** | Live consumer transactions | Supabase Production / RDS (ap-south-1) | Multi-replica Node.js Containers | Vercel Production CDN |

### 12.2 Secrets & Environment Variables Manifest

#### Backend (`apps/backend/.env`)
```bash
# Server & Runtime
PORT=9000
NODE_ENV=production
MEDUSA_BACKEND_URL=https://api.glorov.in

# Database & Cache
DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require
REDIS_URL=rediss://default:[PASSWORD]@redis-cluster.ap-south-1.cache.amazonaws.com:6379

# Security & Tokens
JWT_SECRET=generated-random-32-byte-hex-string
COOKIE_SECRET=generated-random-32-byte-hex-string
STORE_CORS=https://glorov.in,https://www.glorov.in
ADMIN_CORS=https://admin.glorov.in
AUTH_CORS=https://glorov.in,https://admin.glorov.in

# Payment Integrations (India)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxx

# Shipping Integrations (Shiprocket)
SHIPROCKET_EMAIL=operations@glorov.in
SHIPROCKET_PASSWORD=xxxxxxxxxxxxxxxx
SHIPROCKET_WEBHOOK_TOKEN=xxxxxxxxxxxxxx

# Media Storage (S3 / Supabase Storage)
S3_URL=https://[ref].supabase.co/storage/v1/s3
S3_BUCKET=glorov-catalog-media
S3_REGION=ap-south-1
S3_ACCESS_KEY_ID=xxxxxxxxxxxxxxxx
S3_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

#### Storefront (`apps/storefront/.env.local`)
```bash
# Public API Endpoints
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.glorov.in
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=https://glorov.in

# Payment Public Key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx

# Analytics & Monitoring
NEXT_PUBLIC_SITE_NAME="GLOROV — Indian Seeds & Live Plants"
```

---

## 13. Security, Performance & Scalability Architecture

### 13.1 Security Invariants
1. **Zero Secret Leakage:** Storefront client bundles will never include backend database URLs, Razorpay Key Secrets, or Admin API Tokens. Only `NEXT_PUBLIC_` prefixed non-sensitive variables are accessible in browser bundles.
2. **Webhook Integrity Verification:** All inbound webhooks (Razorpay, Shiprocket) must pass cryptographic signature verification before body payload parsing.
3. **CORS Hardening:** Backend strictly restricts allowed origins via `STORE_CORS` and `ADMIN_CORS`. Wildcard CORS (`*`) is prohibited.
4. **Rate Limiting:** Protect public Storefront endpoints (`/store/carts`, `/store/pincode-check`, `/store/auth`) with IP-based rate limiting via Redis token bucket middleware to protect against brute-force and scraping.
5. **PII Protection (Indian DPDP Act):** Customer phone numbers, delivery addresses, and purchase histories encrypted in transit (TLS 1.3) and at rest (PostgreSQL Transparent Data Encryption / AES-256).

### 13.2 Performance & Caching Strategy
1. **ISR & Edge Caching:** Static catalog pages (categories, plant care guides) utilize Incremental Static Regeneration (ISR) with revalidation intervals (e.g., 1 hour), invalidated via on-demand webhooks when products are updated in Medusa Admin.
2. **Optimistic Cart UI:** Cart quantity increments and line item removals update locally in React state immediately with background sync to the Medusa API.
3. **Image Optimization:** Botanical photography served via Next.js `next/image` in modern formats (AVIF/WebP) with responsive `srcset` generation to ensure fast rendering over Indian 4G mobile networks.

---

## 14. Key Risks, Compatibility Concerns & Decisions Requiring Confirmation

### 14.1 Key Risks & Technical Mitigations

| Risk | Impact | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **High RTO on COD Plant Deliveries** | Complete write-off of plant inventory; packaging and forward/reverse shipping cost loss. | High | Enforce strict rules: COD disabled for live plants on routes exceeding 48 hours; require WhatsApp verification for all COD orders; limit max COD to ₹2,500. |
| **Supabase Connection Exhaustion** | Backend crashes during traffic spikes due to limited direct PostgreSQL connection slots. | Medium | Use Supabase Session Mode Pooler on port `5432`; configure Medusa pool limit `max: 10`; deploy Redis for caching to offload DB queries. |
| **Courier Transit Delay & Heat Mortality** | Live plants arrive withered or dead during summer months (April–June). | High | Integrate weather-aware warning on PDP; mandate express air courier for live plants; pack with moisture retention gel and aerated boxes. |
| **Shiprocket API Latency in Checkout** | Slow checkout response times if third-party courier rate API experiences downtime. | Medium | Cache PIN code serviceability lists locally in Redis with a 24-hour TTL; fall back to pre-computed default regional shipping rates if Shiprocket times out after 1500ms. |

### 14.2 Decisions Requiring Stakeholder Confirmation
1. **Initial Nursery Dispatch Locations:** Confirm the physical origin warehouse/nursery addresses and 6-digit PIN codes for Shiprocket pickup configuration (e.g., Pune, Bangalore, or Delhi NCR).
2. **Strict COD Policy for Live Plants:** Confirm whether COD will be completely prohibited for potted plants pan-India or permitted only within same-city / metro express zones.
3. **WhatsApp Provider Selection:** Confirm the preferred official WhatsApp Business API BSP (e.g., Gupshup, Interakt, or Wati) for automated order confirmation alerts and COD verification messages.
4. **Hosting Topology:** Confirm preferred production deployment targets (e.g., Medusa backend on Railway / AWS ECS; Storefront on Vercel; Database on Supabase Pro Mumbai `ap-south-1`).

---
*End of Architecture Document. Refer to `docs/implementation-roadmap.md` for the sequential 30-task execution plan.*

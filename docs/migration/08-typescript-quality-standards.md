# 08 — TypeScript & Quality Standards

> **Audit date:** 2026-11-03  
> **Status:** Standards document only. No implementation has started.

---

## 1. TypeScript Configuration

### Current state

`packages/config/typescript/base.json` already enables:
```json
{
  "strict": true,
  "strictNullChecks": true,
  "esModuleInterop": true,
  "forceConsistentCasingInFileNames": true,
  "isolatedModules": true
}
```

This is a solid foundation. The storefront needs a **Next.js-specific extension**.

### Required: `packages/config/typescript/nextjs.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Next.js",
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "allowJs": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Storefront `tsconfig.json`

```json
{
  "extends": "@glorov/config/typescript/nextjs",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 2. The No-`any` Policy

**`any` is completely banned.** There are no exceptions.

This applies to:

| Context | Banned | Required instead |
|---|---|---|
| Component props | `props: any` | Explicit interface |
| API responses | `response: any` | Typed interface matching actual response |
| Function arguments | `(value: any)` | Correct type or `unknown` |
| Function return values | `(): any` | Correct return type |
| React state | `useState<any>()` | `useState<CartItem[]>()` |
| Event handlers | `(e: any)` | `(e: React.ChangeEvent<HTMLInputElement>)` |
| Context values | `createContext<any>()` | Typed context value interface |
| Hook return values | Implicit `any` | Explicit return type annotation |
| Form values | `values: any` | Typed form values object |
| URL params | `params: any` | `{ handle: string }` or equivalent |
| `JSON.parse()` result | Assigned to `any` | Assign to `unknown`, then validate |
| Dynamic imports | Implicit `any` | Type the imported module |

### When the input type is truly unknown

Use `unknown` and narrow it:

```ts
// ✅ Correct
function parseApiResponse(raw: unknown): StoreCatalogProduct {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid API response')
  }
  const r = raw as Record<string, unknown>
  if (typeof r.id !== 'string' || typeof r.title !== 'string') {
    throw new Error('Missing required fields')
  }
  return r as StoreCatalogProduct
}

// ❌ Banned
function parseApiResponse(raw: any): any {
  return raw
}
```

### Handling `catch` blocks

```ts
// ✅ Correct
try {
  await addToCart(variantId, quantity)
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  setError(message)
}

// ❌ Banned
} catch (error: any) {
  setError(error.message)
}
```

---

## 3. Strict Rules Summary

| Rule | Requirement |
|---|---|
| `"strict": true` | Enabled in tsconfig |
| `"noUnusedLocals": true` | Enabled in storefront tsconfig |
| `"noUnusedParameters": true` | Enabled in storefront tsconfig |
| `"exactOptionalPropertyTypes": true` | Enabled in storefront tsconfig |
| `"strictNullChecks": true` | Inherited from base config |
| `any` | Never |
| `@ts-ignore` | Never |
| `@ts-expect-error` | Only with a comment explaining why it is unavoidable; must be removed when the underlying issue is fixed |
| Unsafe type assertions (`as SomeType` without validation) | Avoid; only after narrowing |
| Non-null assertion `!` | Only when null/undefined is provably impossible; add an inline comment explaining why |

---

## 4. Component Prop Typing

Every component must export its props interface:

```ts
// ✅ Correct

export interface ButtonProps {
  /** Button label text */
  children: React.ReactNode
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Whether the button is in a loading state */
  isLoading?: boolean
  /** Whether the button is disabled */
  disabled?: boolean
  /** Click handler */
  onClick?: () => void
  /** Type attribute — defaults to 'button' to prevent accidental form submission */
  type?: 'button' | 'submit' | 'reset'
  /** Additional CSS classes */
  className?: string
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  className,
}: ButtonProps) { ... }
```

Rules:
- All props must have JSDoc comments
- Discriminated unions where variants change the required shape
- Optional props get default values via destructuring defaults
- Never use `React.FC<Props>` — prefer plain function syntax with explicit return type annotation when needed

---

## 5. API Response Typing

### Rule: Never invent types without inspecting the real API

All API response types must be derived from:
1. The actual Medusa v2 API response (inspected via the backend source)
2. `packages/types/src/` (`@glorov/types`)
3. The Medusa JS SDK types (if used)

**Do not guess or approximate response shapes.**

### API client function signature pattern

```ts
// src/lib/api/products.ts

import type { StoreCatalogProduct, StoreProductFilterParams } from '@glorov/types'

export interface ProductListResponse {
  products: StoreCatalogProduct[]
  count: number
  offset: number
  limit: number
}

/**
 * Fetches a paginated list of products from the Medusa store API.
 * @param params - Filter and pagination parameters
 * @returns Typed product list response
 * @throws Error when the API request fails
 */
export async function listProducts(
  params: StoreProductFilterParams = {}
): Promise<ProductListResponse> {
  const url = new URL('/store/products', process.env.NEXT_PUBLIC_MEDUSA_URL)
  // ... append params
  const res = await fetch(url.toString(), { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`)
  const data: unknown = await res.json()
  return validateProductListResponse(data)
}
```

### Validation at API boundaries

Raw API data must be validated before it enters the typed domain:

```ts
function validateProductListResponse(raw: unknown): ProductListResponse {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid product list response')
  const r = raw as Record<string, unknown>
  if (!Array.isArray(r.products)) throw new Error('products must be an array')
  if (typeof r.count !== 'number') throw new Error('count must be a number')
  return raw as ProductListResponse
}
```

> [!NOTE]
> Full schema validation with Zod is recommended once it is added as a dependency. Until then, use manual narrowing. `zod` is already a dependency of `@glorov/backend` in the monorepo — evaluate adding it to a shared package.

---

## 6. React State Typing

```ts
// ✅ Correct
const [cartItems, setCartItems] = useState<CartItem[]>([])
const [isLoading, setIsLoading] = useState<boolean>(false)
const [error, setError] = useState<string | null>(null)
const [selectedVariant, setSelectedVariant] = useState<StoreCatalogVariant | null>(null)

// ❌ Banned
const [cartItems, setCartItems] = useState([])         // implicit any[]
const [error, setError] = useState(null)               // implicit null | never
```

---

## 7. Event Handler Typing

```ts
// ✅ Correct
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
  setPincode(e.target.value)
}

const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
  e.preventDefault()
  void submitOrder()
}

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
  if (e.key === 'Enter') void handleSearch()
}
```

---

## 8. Context Typing

```ts
// ✅ Correct
interface CartContextValue {
  items: CartItem[]
  totalItems: number
  totalPaise: number
  addItem: (variantId: string, quantity: number) => Promise<void>
  removeItem: (lineItemId: string) => Promise<void>
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>
  clearCart: () => void
  isLoading: boolean
  error: string | null
}

const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
```

---

## 9. URL Params and Search Params Typing

Next.js App Router passes params and searchParams as plain objects. Always type them explicitly:

```ts
// Page props typing
interface ProductPageProps {
  params: { handle: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { handle } = params
  // ...
}

// For search params, use a helper to safely extract typed values
function getStringParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const val = searchParams[key]
  return typeof val === 'string' ? val : undefined
}
```

---

## 10. Shared Type Responsibilities

| Type source | Used for |
|---|---|
| `@glorov/types` (shared package) | `StoreCatalogProduct`, `StoreCatalogVariant`, `SeedMetadata`, `PincodeServiceabilityResponse`, `InventoryAvailability`, `CatalogDiscoveryQuery` |
| `src/types/cart.ts` (storefront-local) | `CartItem`, `CartState`, `CartTotals` — frontend cart state shape |
| `src/types/auth.ts` (storefront-local) | `AuthState`, `CustomerSession` — auth context shape |
| `src/types/search.ts` (storefront-local) | `SearchState`, `SuggestionResult` — search UI state |
| `src/types/ui.ts` (storefront-local) | `ButtonVariant`, `Size`, `LoadingState` — UI primitive types |

**Do not duplicate** types that already exist in `@glorov/types`. Import from the shared package first.

---

## 11. ESLint Configuration

### Required: `packages/config/eslint/react.js`

```js
module.exports = {
  extends: [
    './base.js',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'next/core-web-vitals',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',     // Not needed with Next.js
    'react/prop-types': 'off',             // TypeScript handles this
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'jsx-a11y/anchor-is-valid': 'off',     // Next.js Link handles this
  },
}
```

### Storefront `eslint.config.ts`

```ts
import { FlatCompat } from '@eslint/eslintrc'
const compat = new FlatCompat()

export default [
  ...compat.extends('@glorov/config/eslint/react'),
  // Storefront-specific overrides here
]
```

---

## 12. Code Quality Rules

### Comments

```ts
// ✅ Good comment — explains WHY, not WHAT
// Divide by 100 because Medusa stores all prices in paise (smallest INR unit)
const displayPrice = priceInPaise / 100

// ❌ Bad comment — just repeats the code
// Set display price to paise divided by 100
const displayPrice = priceInPaise / 100
```

### Functions

- Maximum function length: ~50 lines; extract helpers if longer
- One responsibility per function
- Prefer `async/await` over `.then()` chains
- Always `await` promises; never fire-and-forget unless intentional (mark with `void`)

### Imports

- External packages first, then `@/` internal, then relative
- No default exports from component files that export multiple things
- No barrel re-exports from `components/ui/index.ts` (prevents accidental deep imports and aids tree-shaking)

### Naming

| Concern | Convention |
|---|---|
| Components | `PascalCase` |
| Hooks | `camelCase` starting with `use` |
| Utilities | `camelCase` |
| Constants | `SCREAMING_SNAKE_CASE` for truly constant module-level values; `camelCase` for config objects |
| TypeScript interfaces | `PascalCase` |
| TypeScript type aliases | `PascalCase` |
| Boolean variables | `is`, `has`, `can`, `should` prefix |

---

## 13. Component JSDoc Standard

Every reusable component must include this JSDoc block:

```ts
/**
 * @component ProductCard
 *
 * @description
 * Displays a single product in catalog grids and featured product rails.
 * Shows the product thumbnail, title, price, discount badge, and optional
 * wishlist toggle.
 *
 * @example
 * // Catalog grid usage
 * <ProductCard product={product} showWishlist size="md" />
 *
 * // Featured rail usage (smaller, no wishlist button)
 * <ProductCard product={product} showWishlist={false} size="sm" />
 *
 * @see ProductGallery — for the full-image gallery on the product detail page
 * @see ProductPrice — for the standalone price display component
 */
```

Hooks must document their return value:

```ts
/**
 * Provides access to the global cart state and cart mutation methods.
 *
 * @returns {CartContextValue} Cart items, totals, and mutation functions
 * @throws {Error} When used outside CartProvider
 *
 * @example
 * const { items, addItem, totalItems } = useCart()
 */
export function useCart(): CartContextValue { ... }
```

---

## 14. Pre-Commit Quality Gate

The following must pass before any commit is accepted:

```bash
pnpm typecheck     # tsc --noEmit — zero type errors
pnpm lint          # eslint — zero errors (warnings allowed during development)
pnpm test          # vitest — zero failing unit tests
```

These are enforced as CI checks in `.github/workflows/ci.yml`.

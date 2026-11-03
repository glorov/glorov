# GLOROV Design System — Component Documentation & Catalog

This document details the migrated design system components in `apps/storefront`, their canonical Flutter counterparts, design token alignments, accessibility implementations, TypeScript interfaces, and usage patterns.

---

## 1. Design Token Architecture

All tokens are defined as CSS variables in `src/styles/tokens.css` and exposed via Tailwind CSS utilities in `tailwind.config.ts`.

### 1.1 Color Tokens
Migrated from Flutter `lib/core/theme/colors.dart` (`GlorovColors`):

| Token Name | CSS Custom Property | Value | Tailwind Class | Semantic Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | `--color-brand-primary` | `#1B4332` | `bg-brand-primary` | Main brand dark emerald green, CTA buttons, active state |
| **Primary Hover** | `--color-brand-primary-hover` | `#2D6A4F` | `bg-brand-primary-hover` | Button hover, interactive card highlight |
| **Primary Dark** | `--color-brand-primary-dark` | `#081C15` | `bg-brand-primary-dark` | Deepest brand green, contrast text, dark accents |
| **Secondary Accent** | `--color-brand-secondary` | `#52B788` | `bg-brand-secondary` | Secondary buttons, interactive badges, focus rings |
| **Muted Accent** | `--color-brand-secondary-light` | `#B7E4C7` | `bg-brand-secondary-light` | Light tint backgrounds, soft badges |
| **Accent Tint** | `--color-brand-accent` | `#D8F3DC` | `bg-brand-accent` | Subtle chip background, highlighted table rows |
| **Tag Blue** | `--color-brand-tag` | `#0C2340` | `bg-brand-tag` | Brand dark navy for categorical badges |
| **Background** | `--color-surface-bg` | `#F9FAF8` | `bg-surface-bg` | Canvas background, off-white with warm/green tint |
| **Surface** | `--color-surface-card` | `#FFFFFF` | `bg-surface-card` | Pure white card/modal/dialog backgrounds |
| **Muted Surface** | `--color-surface-muted` | `#F3F4F6` | `bg-surface-muted` | Inactive elements, secondary card fills |
| **Text Primary** | `--color-text-primary` | `#111827` | `text-text-primary` | Highest contrast text (headings, body copy) |
| **Text Secondary** | `--color-text-secondary` | `#4B5563` | `text-text-secondary` | Subheadings, descriptions, metadata |
| **Text Muted** | `--color-text-muted` | `#9CA3AF` | `text-text-muted` | Placeholder text, helper text, disabled states |
| **Border Default** | `--color-border-default` | `#E5E7EB` | `border-border-default` | Standard hairline dividers and card borders |
| **Border Focused** | `--color-border-focused` | `#1B4332` | `border-border-focused` | Active input field borders |
| **Success** | `--color-status-success` | `#16A34A` | `text-status-success` | Success alerts, completed order badges |
| **Warning** | `--color-status-warning` | `#D97706` | `text-status-warning` | Low stock alerts, pending actions |
| **Error** | `--color-status-error` | `#DC2626` | `text-status-error` | Validation errors, failed transactions |
| **Info** | `--color-status-info` | `#2563EB` | `text-status-info` | System informational notices |

### 1.2 Radii and Spacing Scale
- **Radii**:
  - `xs`: `4px` (`rounded-glorov-xs`)
  - `sm`: `8px` (`rounded-glorov-sm`)
  - `md`: `12px` (`rounded-glorov-md`, canonical card/button border radius in Flutter)
  - `lg`: `16px` (`rounded-glorov-lg`, canonical modal/bottom sheet radius)
  - `full`: `9999px` (`rounded-glorov-full`, pill badges, chips, icon buttons)
- **Minimum Touch Target**: `44px` on mobile (< 640px) to comply with WCAG 2.5.5 and mobile thumb-zone ergonomics.

---

## 2. Component Catalog & API Reference

### 2.1 Button (`src/components/ui/Button.tsx`)
Ported from Flutter `ElevatedButton` and `GlorovButton`.

- **Props**:
  - `variant`: `'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'` (default: `'primary'`)
  - `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
  - `isLoading`: `boolean` (renders spinner and sets `aria-busy="true"`)
  - `leftIcon`: `React.ReactNode`
  - `rightIcon`: `React.ReactNode`
  - Standard `React.ButtonHTMLAttributes<HTMLButtonElement>`
- **Accessibility**: Focus rings (`focus-visible:ring-2 focus-visible:ring-brand-primary`), `aria-busy` when loading, minimum `44px` height on mobile.

```tsx
<Button variant="primary" size="md" isLoading={isSubmitting}>
  Place Order
</Button>
```

### 2.2 IconButton (`src/components/ui/IconButton.tsx`)
Ported from Flutter `IconButton`.

- **Props**:
  - `aria-label`: `string` (**Mandatory** for screen readers)
  - `icon`: `React.ReactNode`
  - `variant`: `'primary' | 'secondary' | 'outline' | 'ghost'` (default: `'ghost'`)
  - `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
  - `isLoading`: `boolean`
  - Standard `React.ButtonHTMLAttributes<HTMLButtonElement>`
- **Accessibility**: Enforces `aria-label`, 44px touch target on mobile viewports.

```tsx
<IconButton
  aria-label="Add to wishlist"
  icon={<HeartIcon />}
  variant="ghost"
  size="md"
/>
```

### 2.3 Input (`src/components/ui/Input.tsx`)
Ported from Flutter `TextFormField` and `GlorovTextField`.

- **Props**:
  - `label`: `string` (rendered as accessible `<label>`)
  - `error`: `string` (triggers `aria-invalid="true"` and `aria-describedby`)
  - `helperText`: `string`
  - `leftIcon`: `React.ReactNode`
  - `rightIcon`: `React.ReactNode`
  - Standard `React.InputHTMLAttributes<HTMLInputElement>`
- **Accessibility**: Automatically generates unique IDs linking `<label>` with input `id`, and error/helper text with `aria-describedby`.

```tsx
<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  error={errors.email}
  required
/>
```

### 2.4 Textarea (`src/components/ui/Textarea.tsx`)
Ported from Flutter multiline `TextFormField`.

- **Props**:
  - `label`: `string`
  - `error`: `string`
  - `helperText`: `string`
  - Standard `React.TextareaHTMLAttributes<HTMLTextAreaElement>`
- **Accessibility**: Automatic ID associations, `aria-invalid`, clear visual focus ring.

```tsx
<Textarea
  label="Delivery Instructions"
  placeholder="Leave at front door..."
  rows={4}
/>
```

### 2.5 Select (`src/components/ui/Select.tsx`)
Ported from Flutter `DropdownButtonFormField`.

- **Props**:
  - `label`: `string`
  - `error`: `string`
  - `helperText`: `string`
  - `options`: `Array<{ value: string; label: string; disabled?: boolean }>`
  - `placeholder`: `string`
  - Standard `React.SelectHTMLAttributes<HTMLSelectElement>`
- **Styling**: Native `<select>` for full mobile accessibility, styled with SVG custom chevron.

```tsx
<Select
  label="Country / Region"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'gb', label: 'United Kingdom' },
  ]}
  value={selectedCountry}
  onChange={(e) => setSelectedCountry(e.target.value)}
/>
```

### 2.6 Checkbox (`src/components/ui/Checkbox.tsx`)
Ported from Flutter `CheckboxListTile`.

- **Props**:
  - `label`: `React.ReactNode`
  - `description`: `React.ReactNode`
  - `error`: `string`
  - Standard `React.InputHTMLAttributes<HTMLInputElement>`
- **Accessibility**: Custom SVG checkmark with hidden accessible `<input type="checkbox">` maintaining keyboard focusability.

```tsx
<Checkbox
  label="I agree to Terms & Conditions"
  description="Receive SMS tracking updates"
  checked={agreeTerms}
  onChange={(e) => setAgreeTerms(e.target.checked)}
/>
```

### 2.7 Radio (`src/components/ui/Radio.tsx`)
Ported from Flutter `RadioListTile`.

- **Props**:
  - `label`: `React.ReactNode`
  - `description`: `React.ReactNode`
  - Standard `React.InputHTMLAttributes<HTMLInputElement>`

```tsx
<Radio
  name="payment-method"
  value="credit_card"
  label="Credit / Debit Card"
  description="Visa, Mastercard, American Express"
  checked={paymentMethod === 'credit_card'}
  onChange={() => setPaymentMethod('credit_card')}
/>
```

### 2.8 Badge (`src/components/ui/Badge.tsx`)
Ported from Flutter `Chip` and category badges.

- **Props**:
  - `variant`: `'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'error' | 'tag'`
  - `size`: `'sm' | 'md'`
  - Standard `React.HTMLAttributes<HTMLSpanElement>`

```tsx
<Badge variant="tag">New Arrival</Badge>
<Badge variant="success">In Stock</Badge>
```

### 2.9 Card (`src/components/ui/Card.tsx`)
Ported from Flutter `Card` and `GlorovCard`.

- **Props**:
  - `header`: `React.ReactNode`
  - `footer`: `React.ReactNode`
  - `padding`: `'none' | 'sm' | 'md' | 'lg'` (default: `'md'`)
  - `interactive`: `boolean` (adds hover shadow and transform)
  - Standard `React.HTMLAttributes<HTMLDivElement>`

```tsx
<Card
  interactive
  header={<h3 className="font-semibold text-lg">Product Details</h3>}
  footer={<Button variant="outline" size="sm">Read More</Button>}
>
  <p className="text-sm text-text-secondary">High quality organic ingredients.</p>
</Card>
```

### 2.10 Divider (`src/components/ui/Divider.tsx`)
Ported from Flutter `Divider` and `VerticalDivider`.

- **Props**:
  - `orientation`: `'horizontal' | 'vertical'` (default: `'horizontal'`)
  - `label`: `string` (renders centered text divider, e.g., "OR")
  - Standard `React.HTMLAttributes<HTMLDivElement>`

```tsx
<Divider label="OR SIGN IN WITH" />
```

### 2.11 Modal (`src/components/ui/Modal.tsx`)
Ported from Flutter `showDialog` / `AlertDialog`.

- **Props**:
  - `isOpen`: `boolean`
  - `onClose`: `() => void`
  - `title`: `React.ReactNode`
  - `footer`: `React.ReactNode`
  - `size`: `'sm' | 'md' | 'lg' | 'xl' | 'full'`
  - `closeOnOverlayClick`: `boolean` (default: `true`)
  - `closeOnEsc`: `boolean` (default: `true`)
- **Accessibility**:
  - Traps keyboard focus inside dialog
  - Listens to `Escape` key
  - Applies `aria-modal="true"`, `role="dialog"`
  - Freezes body scroll while open

```tsx
<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Confirm Action"
  footer={
    <div className="flex justify-end gap-2">
      <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
    </div>
  }
>
  <p>Are you sure you want to proceed with this operation?</p>
</Modal>
```

### 2.12 Drawer (`src/components/ui/Drawer.tsx`)
Ported from Flutter `showModalBottomSheet` / `Scaffold.drawer`.

- **Props**:
  - `isOpen`: `boolean`
  - `onClose`: `() => void`
  - `placement`: `'left' | 'right' | 'bottom'` (default: `'right'`)
  - `title`: `React.ReactNode`
  - `footer`: `React.ReactNode`
  - `closeOnOverlayClick`: `boolean`
- **Accessibility**: Traps focus, handles `Escape` key dismissal, locks body scroll, slide animations on open/close.

```tsx
<Drawer
  isOpen={isCartOpen}
  onClose={() => setIsCartOpen(false)}
  placement="right"
  title="Your Shopping Cart"
>
  <CartItemList items={items} />
</Drawer>
```

### 2.13 Tooltip (`src/components/ui/Tooltip.tsx`)
Ported from Flutter `Tooltip`.

- **Props**:
  - `content`: `React.ReactNode`
  - `placement`: `'top' | 'bottom' | 'left' | 'right'` (default: `'top'`)
  - `delayMs`: `number` (default: `200`)
  - `children`: Single React element trigger
- **Accessibility**: Connects trigger to tooltip with `aria-describedby`, activates on hover and keyboard focus.

```tsx
<Tooltip content="Add item to your personal wishlist">
  <IconButton aria-label="Wishlist" icon={<HeartIcon />} />
</Tooltip>
```

### 2.14 Alert (`src/components/feedback/Alert.tsx`)
Ported from Flutter custom banners and snackbar notifications.

- **Props**:
  - `variant`: `'info' | 'success' | 'warning' | 'error'` (default: `'info'`)
  - `title`: `string`
  - `onDismiss`: `() => void`
  - `icon`: `React.ReactNode`
  - Standard `React.HTMLAttributes<HTMLDivElement>`
- **Accessibility**: `role="alert"` for high priority announcements, accessible close button with `aria-label="Dismiss alert"`.

```tsx
<Alert variant="warning" title="Stock Running Low" onDismiss={() => setShowAlert(false)}>
  Only 3 items remaining in stock. Order soon.
</Alert>
```

### 2.15 Skeleton (`src/components/feedback/Skeleton.tsx`)
Ported from Flutter shimmer loaders (`Shimmer.fromColors`).

- **Props**:
  - `variant`: `'text' | 'circular' | 'rectangular'` (default: `'text'`)
  - `width`: `string | number`
  - `height`: `string | number`
  - Standard `React.HTMLAttributes<HTMLDivElement>`
- **Animation**: CSS shimmer using `bg-gradient-to-r` and pulse keyframe.
- **Accessibility**: Sets `aria-hidden="true"`.

```tsx
<div className="flex gap-3 items-center">
  <Skeleton variant="circular" width={40} height={40} />
  <div className="space-y-2 flex-1">
    <Skeleton variant="text" width="60%" height={16} />
    <Skeleton variant="text" width="40%" height={12} />
  </div>
</div>
```

### 2.16 Spinner (`src/components/feedback/Spinner.tsx`)
Ported from Flutter `CircularProgressIndicator`.

- **Props**:
  - `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
  - `label`: `string` (default: `'Loading...'`)
  - Standard `React.SVGAttributes<SVGSVGElement>`
- **Accessibility**: Emits `<span className="sr-only">Loading...</span>`, `role="status"`.

```tsx
<Spinner size="lg" label="Processing transaction..." />
```

### 2.17 EmptyState (`src/components/feedback/EmptyState.tsx`)
Ported from Flutter empty view widgets across cart, wishlist, orders.

- **Props**:
  - `title`: `string`
  - `description`: `string`
  - `icon`: `React.ReactNode`
  - `action`: `React.ReactNode`
  - Standard `React.HTMLAttributes<HTMLDivElement>`

```tsx
<EmptyState
  title="Your cart is empty"
  description="Looks like you haven't added anything to your cart yet."
  action={<Button variant="primary" onClick={() => router.push('/products')}>Start Shopping</Button>}
/>
```

---

## 3. Interactive Showcase Page

The complete component showcase is available at:
`apps/storefront/src/app/dev/design-system/page.tsx`
Route: `http://localhost:3000/dev/design-system`

This page includes live interactive tests for:
1. Color palette swatches with CSS hex values.
2. Typography scales with desktop and mobile sizes.
3. Buttons with all variants, sizes, icon slots, and loading states.
4. Form inputs (Input, Textarea, Select, Checkbox, Radio) with error and helper states.
5. Badges across all semantic variants.
6. Feedback indicators (Alerts, Skeletons, Spinners, Empty States).
7. Overlay triggers with active live tests for Modal and Drawer.
8. Cards in standard and interactive states.

# GLOROV Storefront: Troubleshooting & Operations Guide

## 1. Development & Runtime Troubleshooting

### 1.1 Port 3000 or Port 9000 Already in Use
- **Symptom**: `Error: listen EADDRINUSE: address already in use :::3000`
- **Cause**: A previous Next.js dev server or test process is still running in the background.
- **Solution**:
  ```bash
  # Check which process is occupying Port 3000
  lsof -i :3000
  
  # Terminate the lingering process
  kill -9 $(lsof -t -i:3000)
  ```

---

### 1.2 Medusa Backend Connection & CORS Blockage
- **Symptom**: Browser console logs `Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource...` or network requests to Port 9000 fail with status `CORS Preflight Did Not Succeed`.
- **Cause**: The Medusa backend has not whitelisted the storefront origin in its `STORE_CORS` environment variable.
- **Solution**:
  1. Open `apps/backend/.env`.
  2. Ensure `STORE_CORS` includes the exact protocol and port of the storefront:
     ```bash
     STORE_CORS="http://localhost:3000,https://glorov.in,https://www.glorov.in"
     ```
  3. Restart the Medusa server: `pnpm backend:dev`.

---

### 1.3 Next.js Image Optimization Error (`next/image`)
- **Symptom**: `Error: Invalid src prop on `next/image`, hostname "res.cloudinary.com" is not configured under images in your next.config.js`
- **Cause**: An image URL was loaded from a domain not explicitly whitelisted in `remotePatterns`.
- **Solution**:
  Check `apps/storefront/next.config.mjs` to ensure Cloudinary is configured:
  ```js
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/naodmm8w/**',
      },
    ],
  }
  ```

---

### 1.4 Client-Side Hydration Mismatch
- **Symptom**: `Unhandled Runtime Error: Hydration failed because the initial UI does not match what was rendered on the server.`
- **Cause**: Accessing `localStorage`, `window.innerWidth`, or client-only tokens during initial SSR rendering before mounting.
- **Solution**:
  Wrap client-only reads inside `useEffect` or check a hydration flag:
  ```tsx
  const [isHydrated, setIsHydrated] = useState(false)
  useEffect(() => {
    setIsHydrated(true)
  }, [])
  if (!isHydrated) return null // or fallback skeleton
  ```

---

### 1.5 Razorpay Payment Modal Fails to Open
- **Symptom**: Clicking "Pay via Razorpay" does nothing or throws `Razorpay is not defined`.
- **Cause**: Razorpay checkout script (`https://checkout.razorpay.com/v1/checkout.js`) was blocked by an ad-blocker or failed to load.
- **Solution**:
  1. Ensure `apps/storefront/src/app/checkout/page.tsx` loads the script via `next/script` or safe dynamic script injection.
  2. Confirm `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set in `.env.local`.
  3. Check browser devtools console for CSP or script blocker alerts.

---

### 1.6 Turborepo / pnpm Stale Build Cache
- **Symptom**: Changes to shared packages or design tokens are not reflected in Next.js.
- **Solution**:
  ```bash
  # Clean Next.js and Turbo build caches
  rm -rf apps/storefront/.next
  rm -rf .turbo
  
  # Rebuild with fresh dependencies
  pnpm storefront:build
  ```

---

### 1.7 Debugging Horizontal Scroll & Mobile Overflow (350px Viewport)
- **Symptom**: Page scrolls horizontally by a few pixels on mobile screens.
- **Solution**:
  Open Chrome DevTools, toggle Device Mode (`350×800`), and run this in the console to find the overflowing element:
  ```js
  document.querySelectorAll('*').forEach((el) => {
    if (el.scrollWidth > document.documentElement.clientWidth) {
      console.warn('Overflowing element:', el, 'Width:', el.scrollWidth);
    }
  });
  ```
  Fix by adding `min-w-0`, `truncate`, or `max-w-full` to the offending container.

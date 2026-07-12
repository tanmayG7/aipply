# Bundle Optimization Report

Date: 2026-07-12
Build: `next build` (Next.js 15.1.9, production)

## Summary

| Metric | Before | After | Change |
|---|---|---|---|
| `/dashboard/home` First Load JS | 484 kB | 343 kB | **−141 kB (−29%)** |
| `/dashboard/home` route-specific JS | 115 kB | 10.6 kB | **−104 kB (−91%)** |
| `/dashboard/subscription` First Load JS | 357 kB | 295 kB | −62 kB (−17%) |
| `/dashboard/job-board` First Load JS | 362 kB | 341 kB | −21 kB (−6%) |
| `/` (landing) First Load JS | 145 kB | 142 kB | −3 kB, plus GA moved off the critical path and page is now a server component |
| Hidden runtime download on `/dashboard/home` | 160 kB (skill-tree debug chunk fetched on every visit) | 0 kB | **−160 kB** |
| Total client chunk output (`.next/static/chunks`) | 3.7 MB | 3.5 MB | −0.2 MB (recharts moved from route bundle to on-demand async chunk) |
| npm dependencies | — | — | 9 unused packages removed |

## Top 5 largest client modules (before)

1. **recharts + @tabler/icons** — 396 kB chunk, loaded eagerly in `/dashboard/home`'s First Load
2. **firebase/firestore** — 248 kB chunk (required by all authenticated dashboard pages)
3. **Next.js/vendor shared chunk** — 200 kB (`1517-*.js`, part of the 106 kB gz shared baseline)
4. **React framework chunk** — 180 kB
5. **firebase/auth + app** — 160 kB

(Additionally: a 160 kB skill-tree data chunk was downloaded at runtime by leftover debug code.)

After optimization, recharts (344 kB chunk) is an **async chunk** fetched only when the dashboard charts render; the Firestore/framework chunks remain because every authenticated page genuinely needs them.

## Changes made

### 1. Code splitting (dashboard)

Next.js App Router already code-splits every route (each `page.tsx` is its own entry, loaded only on navigation — the App Router equivalent of `React.lazy` + route splitting). The remaining problem was *within* the dashboard route, fixed with `next/dynamic` (the App Router equivalent of `React.lazy` + `Suspense`, with the `loading` option as the Suspense fallback):

- `app/dashboard/home/page.tsx`: `DashboardBarChart`, `DashboardChart` (recharts) and `HeroSection` (framer-motion) are now dynamically imported with skeleton fallbacks (`ssr: false`). Recharts no longer blocks first paint of the dashboard.

### 2. Deferred non-critical JavaScript

- `app/layout.tsx`: Google Analytics moved from `strategy="afterInteractive"` to `strategy="lazyOnload"` — it now loads during idle time after the page is fully loaded.
- The environment-check inline script and `<EnvironmentChecker />` are now rendered only in development builds; production ships neither.
- `app/page.tsx` (landing): converted from a client component to a **server component** (its only client-side logic was a commented-out auth check). Hero, features section, testimonials, footer now render as zero-JS server components. Critical content (hero, navigation, CTA) is server-rendered HTML; the FAQ section (stateful accordion) and scroll-to-top button are code-split via `next/dynamic`. The hero image got `priority` for better LCP.

### 3. Tree-shaking / dead code removal

Tree-shaking is enabled by default in Next.js production builds (webpack `usedExports` + `sideEffects`); Next 15 also applies `optimizePackageImports` automatically to icon libraries (`@tabler/icons-react`, `lucide-react`, `@heroicons/react`), so only the icons actually imported are bundled. Removed dead code that tree-shaking cannot catch:

- **Deleted files** (no inbound imports anywhere):
  - `components/loader/loader.tsx` (only consumer of `react-lottie`)
  - `components/debug/EnvChecker.tsx`, `components/debug/ButtonDebugger.tsx` (duplicates of `EnvironmentChecker`)
  - `components/charts/lineChart.tsx` (unused recharts component)
  - `lib/store/store.ts`, `lib/slices/userSlices.ts` (Redux store never wired into the app)
  - `lib/test-skill-tree.ts` (debug harness)
- **Removed debug code**: the `useEffect` in the dashboard home page that dynamically imported the 160 kB skill-tree module and ran test logging on every page view; assorted `console.log` blocks; dead `next/head` usage (a no-op in the App Router — the page title is now set properly via route `metadata` in `app/dashboard/home/layout.tsx`).
- **Removed 9 unused npm packages**: `@reduxjs/toolkit`, `react-redux`, `react-lottie`, `@types/react-lottie`, `lottie-react`, `keyword-extractor`, `react-use-draggable-scroll`, `mini-svg-data-uri`, `net`. Both `bun.lock` and `package-lock.json` regenerated.

### 4. Dynamic imports for heavy libraries

- **recharts** (~100 kB gz): dashboard charts load on demand (see §1).
- **framer-motion**: dashboard `HeroSection` loads on demand.
- **sweetalert2**: new `lib/lazySwal.ts` helper; the job board now imports sweetalert2 only at the moment a dialog is shown (error toast / "did you apply" prompt). `sweetalert2-react-content` was dropped from the job board — its dialogs use plain strings.
- **CancellationWizard** (sweetalert2 + framer-motion): on `/dashboard/subscription` it's now `next/dynamic` and mounted only when the user clicks "Cancel subscription".

## Expected Core Web Vitals impact

- **LCP**: landing hero is server-rendered with a `priority` hero image and no GA on the critical path; dashboard home ships 141 kB less JS before first paint.
- **FID/INP**: ~104 kB less JS to parse/execute on dashboard home main thread at startup; analytics executes at idle.
- **CLS**: all dynamically loaded sections render fixed-size skeleton placeholders (chart/hero skeletons, FAQ min-height), so late-loading content doesn't shift layout.

## Verification

- `next build` passes; all 53 pages generate successfully.
- Shared First Load JS baseline unchanged at 106 kB (this is React + Next runtime + Firebase auth bootstrap, needed everywhere).

## Recommendations (not done in this pass)

- `/dashboard/complete-profile` (388 kB) and `/dashboard/onboarding/profile-setup` (351 kB) statically import `lib/jobRoles.tsx` (216 kB source data file) for dropdowns — loading it on demand would cut both routes substantially.
- Test/debug routes (`/test-subscription`, `/test-webhook`, `/user-id-test`, `/api/test-*`) ship in production; consider removing or gating them.
- `firebase/firestore` (248 kB chunk) is the biggest remaining cost on authenticated pages; Firestore Lite or REST calls for read-only paths would shrink it.

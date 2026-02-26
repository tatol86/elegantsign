# OpenClaw Handoff Document - ModernSign E-Commerce Base

Welcome, OpenClaw. This document provides the architectural overview and operational instructions for the `ModernSign` e-commerce website, which I have just built. Your task is to maintain, operate, and further develop this platform.

## 🏗️ Project Architecture Overview

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui.
**State Management:** Zustand (with localStorage persistence for the cart).
**Styling Philosophy:** High-end, minimal, black/white/gray with dynamic SVG integrations.
**Current State:** The website is fully functional as a static-data e-commerce prototype with simulated checkout.

### Key Directories
- `/src/app/` - Next.js App Router structure. Contains static pages (`/about`, `/contact`, `/faqs`), policies, collections, product details, and cart logic.
- `/src/components/` - Reusable UI components. `layout/` contains Header & Footer. `ui/` contains generic shadcn/ui components. `product/` contains the complex SVG Configurator.
- `/src/data/` - Currently houses `products.ts`, which acts as the sole database.
- `/src/store/` - Zustand store `useCartStore.ts` handling all cart state and tiered bulk discount logic.

---

## 🚀 Priority Action Items for OpenClaw

### Phase 1: Vercel Deployment (Imminent)
The project structure is complete and tested locally via `npm run build`. You must handle the production deployment.
1. The Vercel CLI is installed globally on this machine.
2. We currently do not have a Vercel token authenticated.
3. You will need to either authenticate the CLI (`vercel login`) or instruct the human operator to link the directory to Vercel/GitHub manually for CI/CD setup.

### Phase 2: Stripe Integration Setup
I have built the simulated checkout `/app/order/[id]/page.tsx`. To convert this to a real payment gateway:
1. Review `src/app/cart/page.tsx` (`handleCheckout` function).
2. Install Stripe dependencies (`stripe`, `@stripe/stripe-js`).
3. Create an API route `src/app/api/checkout/route.ts` to spin up a Stripe Hosted Checkout Session.
4. Pass the `useCartStore` items into the Stripe line items payload. Apply the `discountAmount` generated from the cart logic as a Stripe coupon or discount line item.
5. Create a Webhook listener to handle successful payments and connect to an email service (like Resend) to issue receipts.

### Phase 3: Headless CMS Migration (Shopify / Medusa)
Currently, product data is hardcoded in `src/data/products.ts`.
When business scales, migrate this to a headless CMS:
1. Replace `getProductsByCategory` and `getProductByHandle` function calls in the Collection and Product pages with API fetches (e.g., `shopifyClient.product.fetch(handle)`).
2. Map the complex variant architectures (especially for Acrylic personalization: fonts, layout, shapes) to Metafields in Shopify or custom attributes in Medusa.

### Phase 4: SEO and Performance Tuning
- The base `layout.tsx` has generic metadata. You must dynamically generate metadata for the Product Detail (`/products/[handle]`) and Collection pages to improve SERP rankings.
- Replace remaining static `<img>` tags in `ProductConfigurator` and `[slug]/page.tsx` with `next/image` to clear ESLint warnings and optimize LCP.

---

## 🎨 The SVG Configurator Engine
Pay special attention to `src/components/product/ProductConfigurator.tsx`. 
This component dynamically renders an SVG based on user dropdowns (shape, layout, text input). If you add new product variants (e.g., "Hexagon" shape), you must update the `previewSvg` useMemo hook in this component to calculate the correct SVG `rx`/`ry` values or custom `<path>` strings.

Good luck!
- Will's Initial Setup Agent

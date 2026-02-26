# ModernSign - Premium E-Commerce Website

A high-end, responsive Next.js 14 e-commerce application designed for custom architectural signage and 3D printed decor. Built with a focus on advanced aesthetics, minimal design, and dynamic product configuration.

## Features

- **Next.js 14 App Router:** utilizing React Server Components for fast load times and SEO friendliness.
- **Dynamic Customization & Live SVG Preview:** Users can configure shapes, text, fonts, and layouts for acrylic signs, receiving real-time, accurate SVG visual feedback.
- **Zustand Cart & LocalStorage:** Global state management for the shopping cart with automatic persistence.
- **Tiered Bulk Discounts:** Automatically applied tiered pricing in the cart (e.g., 5+ items = 15% off).
- **Responsive & Accessible Design:** Minimalist black/white/gray aesthetic built with TailwindCSS, shadcn/ui, and Radix UI primitives.

---

## 🚀 Getting Started

### 1. Requirements
- Node.js 18+
- npm or pnpm or yarn

### 2. Installation
Clone this repository or extract the project folder, then run:

```bash
npm install
```

### 3. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📦 Data Architecture & Extensibility

Currently, the application operates entirely without an external database, pulling everything from local typescript files to ensure it works completely out of the box.

### Managing Products
Products are defined in `src/data/products.ts`. You can add, edit, or remove products and their variants here. 
To transition to a Headless CMS (like Shopify or Medusa), you simply need to replace the data fetching logic in `src/app/collections/[slug]/page.tsx` and `src/app/products/[handle]/page.tsx`.

### Extending to Shopify / Medusa
1. **Initialize API Client:** Place your Shopify storefront or Medusa client initialization in `src/lib/api.ts` (create this).
2. **Replace Data Fills:** In `app/products/[handle]/page.tsx`, replace the `getProductByHandle` function call with `await medusaClient.products.retrieve(handle)`.
3. **Checkout Swap:** Hook the 'Checkout' button in `app/cart/page.tsx` to initiate a Medusa/Shopify checkout session using their respective APIs, rather than the local simulated route.

---

## 💳 Checkout Modes

### 1. Default (Simulated Checkout)
Out of the box, clicking "Checkout" in the Cart page will clear your local cart and redirect you to a simulated success page (`/order/[id]`). This allows full testing of the UI flows without configuring payment gateways.

### 2. Enabling Stripe Checkout
To integrate real payments using Stripe:
1. Install Stripe: `npm install stripe @stripe/stripe-js`
2. Create `src/app/api/checkout_sessions/route.ts`.
3. Set your internal `.env.local`:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```
4. Update the checkout handler in `src/app/cart/page.tsx` to POST to your new API route and redirect the user to the Stripe hosted checkout URL.

---

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to a GitHub repository.
2. Link the repository to your Vercel account.
3. Vercel will automatically detect the Next.js framework, build, and deploy the application. No extra configuration needed!

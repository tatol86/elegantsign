# ElegantSign

Next.js 14 storefront for custom signage, now wired for a real PostgreSQL-backed product catalog instead of local JSON writes.

## Stack

- Next.js 14 App Router
- PostgreSQL
- Prisma ORM
- Vercel Blob for production image storage
- Zustand cart state
- Tailwind CSS + shadcn/ui

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables from `.env.example` into `.env` and set real admin credentials.

If you want uploads to use production storage locally, also set:

```env
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

Without that token, uploads fall back to local disk under `public/products/uploads`.

3. Start PostgreSQL.

If you have Docker installed:

```bash
docker compose up -d
```

If you do not use Docker, create a local PostgreSQL database named `elegantsign` and point `DATABASE_URL` at it.

4. Generate the Prisma client, run migrations, and seed products:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Commands

```bash
npm run db:generate
npm run db:migrate
npm run db:migrate:dev
npm run db:push
npm run db:seed
npm run db:studio
```

The initial SQL migration is committed at [prisma/migrations/0001_init/migration.sql](/C:/Users/Will/Downloads/New%20folder/web/prisma/migrations/0001_init/migration.sql).

## Current Data Model

The database schema now includes the base tables needed for a production commerce flow:

- `products`, `product_images`, `product_size_options`
- `users`, `accounts`, `sessions`, `verification_tokens`
- `addresses`
- `orders`, `order_items`, `order_status_history`

Legacy product content still lives in [src/data/products.json](/C:/Users/Will/Downloads/New%20folder/web/src/data/products.json), but only as a seed source for local bootstrap.

## Admin Access

Admin login is now server-validated through `/api/admin/login` and stored in an `httpOnly` signed cookie. Set these values in `.env`:

```env
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="replace-me"
ADMIN_SESSION_SECRET="long-random-secret"
```

This is a transitional admin auth layer. Customer registration, password reset, and account management should move to Auth.js or another full auth system in the next phase.

## Deployment Notes

- Deploy the app on Vercel.
- Keep PostgreSQL outside the Vercel filesystem.
- Product image uploads now use Vercel Blob when `BLOB_READ_WRITE_TOKEN` is configured.
- Local development still falls back to `public/products/uploads`, but that fallback should not be treated as production storage.
- Payment is still simulated. Real checkout should create and update `orders` rows instead of redirecting directly to a fake success page.

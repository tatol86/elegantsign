import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';

type LegacySizeOption = {
  label: string;
  width: number;
  height: number;
  price: number;
};

type LegacyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  category: string;
  tags?: string[];
  startingPrice?: number;
  images?: string[];
  rating?: number;
  reviews?: number;
  leadTimeDays?: string;
  buildStyle?: string;
  shape?: string;
  mountingOptions?: string[];
  materials?: string[];
  colors?: string[];
  sizeOptions?: LegacySizeOption[];
};

const prisma = new PrismaClient();

const LEGACY_TEXT_REPLACEMENTS: Record<string, string> = {
  'â€”': '\u2014',
  'Ã—': '\u00D7',
  'Ã˜': '\u00D8',
};

function repairLegacyText(value: unknown): unknown {
  if (typeof value === 'string') {
    return Object.entries(LEGACY_TEXT_REPLACEMENTS).reduce(
      (result, [broken, fixed]) => result.replaceAll(broken, fixed),
      value,
    );
  }

  if (Array.isArray(value)) {
    return value.map(repairLegacyText);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, repairLegacyText(nested)]),
    );
  }

  return value;
}

function dollarsToCents(amount: number): number {
  return Math.round(amount * 100);
}

async function readLegacyProducts(): Promise<LegacyProduct[]> {
  const sourcePath = path.join(process.cwd(), 'src', 'data', 'products.json');
  const raw = await fs.readFile(sourcePath, 'utf-8');
  const parsed = JSON.parse(raw) as LegacyProduct[];
  return repairLegacyText(parsed) as LegacyProduct[];
}

async function main() {
  const products = await readLegacyProducts();

  await prisma.product.deleteMany();

  for (const product of products) {
    const sizeOptions = product.sizeOptions ?? [];
    const startingPrice =
      sizeOptions.length > 0
        ? Math.min(...sizeOptions.map((option) => option.price))
        : product.startingPrice ?? 0;

    await prisma.product.create({
      data: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        description: product.description,
        category: product.category,
        tags: product.tags ?? [],
        startingPriceCents: dollarsToCents(startingPrice),
        rating: product.rating ?? 0,
        reviewsCount: product.reviews ?? 0,
        leadTimeDays: product.leadTimeDays ?? '1-2',
        buildStyle: product.buildStyle ?? null,
        shape: product.shape ?? null,
        mountingOptions: product.mountingOptions ?? [],
        materials: product.materials ?? [],
        colors: product.colors ?? [],
        images: {
          create: (product.images ?? []).map((url, index) => ({
            url,
            sortOrder: index,
          })),
        },
        sizeOptions: {
          create: sizeOptions.map((option, index) => ({
            label: option.label,
            widthMm: option.width,
            heightMm: option.height,
            priceCents: dollarsToCents(option.price),
            sortOrder: index,
          })),
        },
      },
    });
  }

  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

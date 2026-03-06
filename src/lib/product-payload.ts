import { z } from 'zod';

const sizeOptionSchema = z.object({
  label: z.string().trim().min(1),
  width: z.coerce.number().int().positive(),
  height: z.coerce.number().int().positive(),
  price: z.coerce.number().nonnegative(),
});

export const productInputSchema = z.object({
  title: z.string().trim().min(1),
  handle: z.string().trim().optional().default(''),
  description: z.string().trim().default(''),
  category: z.string().trim().min(1),
  tags: z.array(z.string().trim()).default([]),
  startingPrice: z.coerce.number().nonnegative().default(0),
  images: z.array(z.string().trim().min(1)).default([]),
  rating: z.coerce.number().min(0).max(5).default(0),
  reviews: z.coerce.number().int().min(0).default(0),
  leadTimeDays: z.string().trim().min(1).default('1-2'),
  buildStyle: z.string().trim().optional().nullable(),
  shape: z.string().trim().optional().nullable(),
  mountingOptions: z.array(z.string().trim()).default([]),
  materials: z.array(z.string().trim()).default([]),
  colors: z.array(z.string().trim()).default([]),
  sizeOptions: z.array(sizeOptionSchema).default([]),
});

export type ProductInput = z.infer<typeof productInputSchema>;

function cleanStringArray(values: string[]): string[] {
  const seen = new Set<string>();

  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => {
      if (seen.has(value)) {
        return false;
      }

      seen.add(value);
      return true;
    });
}

function dollarsToCents(amount: number): number {
  return Math.round(amount * 100);
}

export function normalizeHandle(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function buildProductWriteData(input: ProductInput) {
  const handle = normalizeHandle(input.handle || input.title);
  const sizeOptions = input.sizeOptions.map((option) => ({
    label: option.label.trim(),
    widthMm: option.width,
    heightMm: option.height,
    priceCents: dollarsToCents(option.price),
  }));

  const startingPrice =
    sizeOptions.length > 0
      ? Math.min(...sizeOptions.map((option) => option.priceCents))
      : dollarsToCents(input.startingPrice);

  return {
    handle,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category.trim(),
    tags: cleanStringArray(input.tags),
    startingPriceCents: startingPrice,
    rating: input.rating,
    reviewsCount: input.reviews,
    leadTimeDays: input.leadTimeDays.trim(),
    buildStyle: input.buildStyle?.trim() || null,
    shape: input.shape?.trim() || null,
    mountingOptions: cleanStringArray(input.mountingOptions),
    materials: cleanStringArray(input.materials),
    colors: cleanStringArray(input.colors),
    imageRows: input.images.map((url, index) => ({
      url,
      sortOrder: index,
    })),
    sizeOptionRows: sizeOptions.map((option, index) => ({
      ...option,
      sortOrder: index,
    })),
  };
}

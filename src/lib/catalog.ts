import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { Product } from '@/types/catalog';

export const productDetailInclude = {
  images: {
    orderBy: {
      sortOrder: 'asc',
    },
  },
  sizeOptions: {
    orderBy: {
      sortOrder: 'asc',
    },
  },
} satisfies Prisma.ProductInclude;

type ProductRecord = Prisma.ProductGetPayload<{
  include: typeof productDetailInclude;
}>;

function centsToDollars(amountInCents: number): number {
  return Number((amountInCents / 100).toFixed(2));
}

export function mapProductRecord(product: ProductRecord): Product {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description,
    category: product.category,
    tags: product.tags,
    startingPrice: centsToDollars(product.startingPriceCents),
    images: product.images.map((image) => image.url),
    rating: product.rating,
    reviews: product.reviewsCount,
    leadTimeDays: product.leadTimeDays,
    buildStyle: product.buildStyle as Product['buildStyle'],
    shape: product.shape as Product['shape'],
    mountingOptions: product.mountingOptions as Product['mountingOptions'],
    materials: product.materials,
    colors: product.colors,
    sizeOptions: product.sizeOptions.map((option) => ({
      label: option.label,
      width: option.widthMm,
      height: option.heightMm,
      price: centsToDollars(option.priceCents),
    })),
    price: centsToDollars(product.startingPriceCents),
  };
}

export async function getCatalogProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
    include: productDetailInclude,
  });

  return products.map(mapProductRecord);
}

export async function getCatalogProductByHandle(handle: string): Promise<Product | undefined> {
  const product = await prisma.product.findUnique({
    where: {
      handle,
    },
    include: productDetailInclude,
  });

  return product ? mapProductRecord(product) : undefined;
}

import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logAdminAudit } from '@/lib/admin-audit';
import { requireAdminRequest } from '@/lib/admin-route';
import { prisma } from '@/lib/prisma';
import { productDetailInclude, mapProductRecord } from '@/lib/catalog';
import { buildProductWriteData, productInputSchema } from '@/lib/product-payload';

export const dynamic = 'force-dynamic';

function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Invalid product payload',
        issues: error.flatten(),
      },
      { status: 400 },
    );
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    return NextResponse.json(
      { error: 'A product with that handle already exists.' },
      { status: 409 },
    );
  }

  console.error(error);
  return NextResponse.json({ error: 'Failed to process products' }, { status: 500 });
}

export async function GET(req: NextRequest) {
  const admin = await requireAdminRequest(req, 'catalog');
  if (admin instanceof NextResponse) {
    return admin;
  }
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'asc',
      },
      include: productDetailInclude,
    });

    return NextResponse.json(products.map(mapProductRecord), {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdminRequest(req, 'catalog');

  if (admin instanceof NextResponse) {
    return admin;
  }

  try {
    const input = productInputSchema.parse(await req.json());
    const data = buildProductWriteData(input);

    const product = await prisma.product.create({
      data: {
        handle: data.handle,
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags,
        startingPriceCents: data.startingPriceCents,
        rating: data.rating,
        reviewsCount: data.reviewsCount,
        leadTimeDays: data.leadTimeDays,
        buildStyle: data.buildStyle,
        shape: data.shape,
        mountingOptions: data.mountingOptions,
        materials: data.materials,
        colors: data.colors,
        images: {
          create: data.imageRows,
        },
        sizeOptions: {
          create: data.sizeOptionRows,
        },
      },
      include: productDetailInclude,
    });

    await logAdminAudit({
      actorUserId: admin.userId,
      action: 'PRODUCT_CREATED',
      entityType: 'product',
      entityId: product.id,
      summary: `Created product ${product.title}.`,
      metadata: {
        productId: product.id,
        handle: product.handle,
        title: product.title,
        category: product.category,
      },
    });

    return NextResponse.json(mapProductRecord(product), { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

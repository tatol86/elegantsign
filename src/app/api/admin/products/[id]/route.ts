import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logAdminAudit } from '@/lib/admin-audit';
import { requireAdminRequest } from '@/lib/admin-route';
import { prisma } from '@/lib/prisma';
import { productDetailInclude, mapProductRecord } from '@/lib/catalog';
import { buildProductWriteData, productInputSchema } from '@/lib/product-payload';
import { deleteProductAssets } from '@/lib/storage';

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
  return NextResponse.json({ error: 'Failed to process product' }, { status: 500 });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdminRequest(_req, 'catalog');

  if (admin instanceof NextResponse) {
    return admin;
  }

  try {
    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
      },
      include: productDetailInclude,
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(mapProductRecord(product));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdminRequest(req, 'catalog');

  if (admin instanceof NextResponse) {
    return admin;
  }

  try {
    const input = productInputSchema.parse(await req.json());
    const data = buildProductWriteData(input);

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: params.id,
      },
      include: {
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = await prisma.product.update({
      where: {
        id: params.id,
      },
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
          deleteMany: {},
          create: data.imageRows,
        },
        sizeOptions: {
          deleteMany: {},
          create: data.sizeOptionRows,
        },
      },
      include: productDetailInclude,
    });

    const removedImageUrls = existingProduct.images
      .map((image) => image.url)
      .filter((url) => !data.imageRows.some((image) => image.url === url));

    if (removedImageUrls.length > 0) {
      await deleteProductAssets(removedImageUrls);
    }

    await logAdminAudit({
      actorUserId: admin.userId,
      action: 'PRODUCT_UPDATED',
      entityType: 'product',
      entityId: product.id,
      summary: `Updated product ${product.title}.`,
      metadata: {
        productId: product.id,
        previousHandle: existingProduct.handle,
        handle: product.handle,
        title: product.title,
        removedImageCount: removedImageUrls.length,
      },
    });

    return NextResponse.json(mapProductRecord(product));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdminRequest(req, 'catalog');

  if (admin instanceof NextResponse) {
    return admin;
  }

  try {
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: params.id,
      },
      include: {
        images: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await prisma.product.delete({
      where: {
        id: params.id,
      },
    });

    await deleteProductAssets(existingProduct.images.map((image) => image.url));

    await logAdminAudit({
      actorUserId: admin.userId,
      action: 'PRODUCT_DELETED',
      entityType: 'product',
      entityId: existingProduct.id,
      summary: `Deleted product ${existingProduct.title}.`,
      metadata: {
        productId: existingProduct.id,
        handle: existingProduct.handle,
        title: existingProduct.title,
        deletedImageCount: existingProduct.images.length,
      },
    });

    return NextResponse.json({ success: true, message: `Product ${params.id} deleted` });
  } catch (error) {
    return handleRouteError(error);
  }
}

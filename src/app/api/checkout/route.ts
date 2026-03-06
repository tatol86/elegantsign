import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentCustomer } from '@/lib/customer-auth';
import { generateUniqueOrderNumber } from '@/lib/order-utils';
import { prisma } from '@/lib/prisma';

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
        selectedColor: z.string().optional(),
        selectedSize: z.string().optional(),
        selectedMaterial: z.string().optional(),
        selectedMounting: z.string().optional(),
        personalization: z
          .object({
            text1: z.string().trim().max(32).optional(),
            text2: z.string().trim().max(48).optional(),
            font: z.enum(['modern', 'serif', 'stencil', 'mono']).optional(),
            layout: z.enum(['center', 'left']).optional(),
            shape: z.enum(['Square', 'Rectangle', 'Circle', 'Arch', 'Rounded Rectangle']).optional(),
          })
          .optional(),
      }),
    )
    .min(1),
  shippingMethod: z.enum(['standard', 'express']),
  shippingAddress: z.object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    line1: z.string().trim().min(1),
    line2: z.string().trim().optional(),
    city: z.string().trim().min(1),
    state: z.string().trim().min(1),
    postalCode: z.string().trim().min(1),
    country: z.string().trim().min(1),
    phone: z.string().trim().optional(),
  }),
});

function getDiscountPercentage(totalItems: number) {
  if (totalItems >= 20) return 0.3;
  if (totalItems >= 10) return 0.2;
  if (totalItems >= 5) return 0.15;
  return 0;
}

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();

  if (!customer) {
    return NextResponse.json({ error: 'Please sign in before checking out.' }, { status: 401 });
  }

  try {
    const input = checkoutSchema.parse(await req.json());
    const productIds = Array.from(new Set(input.items.map((item) => item.productId)));
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        isActive: true,
      },
      include: {
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
        sizeOptions: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'One or more products are unavailable.' }, { status: 400 });
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const orderItems = input.items.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error('Missing product');
      }

      const matchedSize = item.selectedSize
        ? product.sizeOptions.find((option) => option.label === item.selectedSize)
        : null;
      const unitPriceCents = matchedSize?.priceCents ?? product.startingPriceCents;

      return {
        product,
        quantity: item.quantity,
        unitPriceCents,
        selectedColor: item.selectedColor || null,
        selectedSizeLabel: item.selectedSize || null,
        selectedMaterial: item.selectedMaterial || null,
        selectedMounting: item.selectedMounting || null,
        personalization: item.personalization ?? undefined,
      };
    });

    const subtotalCents = orderItems.reduce(
      (total, item) => total + item.unitPriceCents * item.quantity,
      0,
    );
    const totalQuantity = orderItems.reduce((total, item) => total + item.quantity, 0);
    const discountCents = Math.round(subtotalCents * getDiscountPercentage(totalQuantity));
    const shippingCents = input.shippingMethod === 'express' ? 1000 : 0;
    const totalCents = subtotalCents - discountCents + shippingCents;
    const orderNumber = await generateUniqueOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const shippingAddress = await tx.address.create({
        data: {
          userId: customer.id,
          firstName: input.shippingAddress.firstName,
          lastName: input.shippingAddress.lastName,
          line1: input.shippingAddress.line1,
          line2: input.shippingAddress.line2 || null,
          city: input.shippingAddress.city,
          state: input.shippingAddress.state,
          postalCode: input.shippingAddress.postalCode,
          country: input.shippingAddress.country,
          phone: input.shippingAddress.phone || null,
        },
      });

      const billingAddress = await tx.address.create({
        data: {
          userId: customer.id,
          firstName: input.shippingAddress.firstName,
          lastName: input.shippingAddress.lastName,
          line1: input.shippingAddress.line1,
          line2: input.shippingAddress.line2 || null,
          city: input.shippingAddress.city,
          state: input.shippingAddress.state,
          postalCode: input.shippingAddress.postalCode,
          country: input.shippingAddress.country,
          phone: input.shippingAddress.phone || null,
        },
      });

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: customer.id,
          email: customer.email,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          fulfillmentStatus: 'UNFULFILLED',
          subtotalCents,
          discountCents,
          shippingCents,
          totalCents,
          shippingMethod: input.shippingMethod,
          shippingAddressId: shippingAddress.id,
          billingAddressId: billingAddress.id,
          placedAt: new Date(),
          items: {
            create: orderItems.map((item) => ({
              productId: item.product.id,
              titleSnapshot: item.product.title,
              handleSnapshot: item.product.handle,
              imageSnapshot: item.product.images[0]?.url || null,
              unitPriceCents: item.unitPriceCents,
              quantity: item.quantity,
              selectedColor: item.selectedColor,
              selectedSizeLabel: item.selectedSizeLabel,
              selectedMaterial: item.selectedMaterial,
              selectedMounting: item.selectedMounting,
              personalization: item.personalization,
            })),
          },
          statusHistory: {
            create: {
              status: 'PENDING',
              paymentStatus: 'PENDING',
              fulfillmentStatus: 'UNFULFILLED',
              note: 'Order created from storefront checkout.',
            },
          },
        },
        select: {
          orderNumber: true,
        },
      });

      return createdOrder;
    });

    return NextResponse.json({ success: true, orderNumber: order.orderNumber });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to create order.' }, { status: 400 });
  }
}

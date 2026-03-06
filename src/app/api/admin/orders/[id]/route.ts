import { FulfillmentStatus, OrderStatus, PaymentStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logAdminAudit } from '@/lib/admin-audit';
import { requireAdminRequest } from '@/lib/admin-route';
import { prisma } from '@/lib/prisma';

const orderUpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  paymentStatus: z.nativeEnum(PaymentStatus),
  fulfillmentStatus: z.nativeEnum(FulfillmentStatus),
  shippingCarrier: z.string().trim().max(255).optional().nullable(),
  trackingNumber: z.string().trim().max(255).optional().nullable(),
  internalNotes: z.string().trim().max(4000).optional().nullable(),
  note: z.string().trim().max(1000).optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const admin = await requireAdminRequest(req, 'operations');

  if (admin instanceof NextResponse) {
    return admin;
  }

  try {
    const input = orderUpdateSchema.parse(await req.json());
    const existingOrder = await prisma.order.findUnique({
      where: {
        orderNumber: params.id,
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        fulfillmentStatus: true,
        shippingCarrier: true,
        trackingNumber: true,
        internalNotes: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const order = await prisma.order.update({
      where: {
        id: existingOrder.id,
      },
      data: {
        status: input.status,
        paymentStatus: input.paymentStatus,
        fulfillmentStatus: input.fulfillmentStatus,
        shippingCarrier: input.shippingCarrier || null,
        trackingNumber: input.trackingNumber || null,
        internalNotes: input.internalNotes || null,
        shippedAt:
          input.fulfillmentStatus === 'FULFILLED' || input.fulfillmentStatus === 'PARTIAL'
            ? new Date()
            : null,
        deliveredAt: input.fulfillmentStatus === 'FULFILLED' && input.status === 'DELIVERED'
          ? new Date()
          : null,
        statusHistory: {
          create: {
            status: input.status,
            paymentStatus: input.paymentStatus,
            fulfillmentStatus: input.fulfillmentStatus,
            note: input.note || 'Updated from admin order management.',
          },
        },
      },
      select: {
        orderNumber: true,
        status: true,
        paymentStatus: true,
        fulfillmentStatus: true,
        shippingCarrier: true,
        trackingNumber: true,
        internalNotes: true,
      },
    });

    await logAdminAudit({
      actorUserId: admin.userId,
      action: 'ORDER_UPDATED',
      entityType: 'order',
      entityId: existingOrder.id,
      summary: `Updated order ${existingOrder.orderNumber}.`,
      metadata: {
        orderNumber: existingOrder.orderNumber,
        before: {
          status: existingOrder.status,
          paymentStatus: existingOrder.paymentStatus,
          fulfillmentStatus: existingOrder.fulfillmentStatus,
          shippingCarrier: existingOrder.shippingCarrier,
          trackingNumber: existingOrder.trackingNumber,
          internalNotes: existingOrder.internalNotes,
        },
        after: order,
        note: input.note || null,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to update order.' }, { status: 400 });
  }
}

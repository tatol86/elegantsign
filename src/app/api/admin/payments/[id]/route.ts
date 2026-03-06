import { PaymentStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logAdminAudit } from '@/lib/admin-audit';
import { requireAdminRequest } from '@/lib/admin-route';
import { getOrderStatusFromPaymentStatus, getPaymentTimestampPatch } from '@/lib/payment-admin';
import { prisma } from '@/lib/prisma';

const updatePaymentSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
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
    const input = updatePaymentSchema.parse(await req.json());
    const existingPayment = await prisma.payment.findUnique({
      where: {
        id: params.id,
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            fulfillmentStatus: true,
          },
        },
      },
    });

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found.' }, { status: 404 });
    }

    const nextOrderStatus = getOrderStatusFromPaymentStatus(
      existingPayment.order.status,
      input.status,
    );

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: {
          id: existingPayment.id,
        },
        data: {
          status: input.status,
          note: input.note || existingPayment.note,
          ...getPaymentTimestampPatch(input.status),
        },
        select: {
          id: true,
          status: true,
          note: true,
          orderId: true,
        },
      });

      const updatedOrder = await tx.order.update({
        where: {
          id: existingPayment.order.id,
        },
        data: {
          status: nextOrderStatus,
          paymentStatus: input.status,
          statusHistory: {
            create: {
              status: nextOrderStatus,
              paymentStatus: input.status,
              fulfillmentStatus: existingPayment.order.fulfillmentStatus,
              note:
                input.note ||
                `Payment ${existingPayment.id} manually marked as ${input.status.toLowerCase()} from admin payments.`,
            },
          },
        },
        select: {
          orderNumber: true,
          status: true,
          paymentStatus: true,
        },
      });

      return {
        payment: updatedPayment,
        order: updatedOrder,
      };
    });

    await logAdminAudit({
      actorUserId: admin.userId,
      action: 'PAYMENT_UPDATED',
      entityType: 'payment',
      entityId: existingPayment.id,
      summary: `Updated payment ${existingPayment.id} on order ${existingPayment.order.orderNumber} to ${input.status}.`,
      metadata: {
        paymentId: existingPayment.id,
        orderNumber: existingPayment.order.orderNumber,
        before: {
          paymentStatus: existingPayment.status,
          orderStatus: existingPayment.order.status,
          orderPaymentStatus: existingPayment.order.paymentStatus,
          note: existingPayment.note,
        },
        after: {
          paymentStatus: result.payment.status,
          orderStatus: result.order.status,
          orderPaymentStatus: result.order.paymentStatus,
          note: result.payment.note,
        },
      },
    });

    return NextResponse.json({
      success: true,
      payment: result.payment,
      order: result.order,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid payment update payload.' },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Unable to update payment.' }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logAdminAudit } from '@/lib/admin-audit';
import { getCurrentCustomer } from '@/lib/customer-auth';
import { MOCK_PAYMENT_OPTIONS } from '@/lib/mock-payment';
import { getOrderStatusFromPaymentStatus, getPaymentTimestampPatch } from '@/lib/payment-admin';
import { prisma } from '@/lib/prisma';

const paymentRequestSchema = z.object({
  outcome: z.enum(['success', 'failed', 'bank_transfer']),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const customer = await getCurrentCustomer();

  if (!customer) {
    return NextResponse.json({ error: 'Please sign in before paying.' }, { status: 401 });
  }

  try {
    const input = paymentRequestSchema.parse(await req.json());
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: params.id,
        userId: customer.id,
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalCents: true,
        currency: true,
        paymentStatus: true,
        fulfillmentStatus: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ error: 'Order is already marked as paid.' }, { status: 409 });
    }

    const selectedOption = MOCK_PAYMENT_OPTIONS[input.outcome];
    const externalReference = `mock_${input.outcome}_${Date.now()}`;
    const nextOrderStatus = getOrderStatusFromPaymentStatus(
      order.status,
      selectedOption.paymentStatus,
    );
    const payment = await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.payment.create({
        data: {
          orderId: order.id,
          method: selectedOption.method,
          status: selectedOption.paymentStatus,
          amountCents: order.totalCents,
          currency: order.currency,
          externalReference,
          note: selectedOption.note,
          metadata: {
            outcome: input.outcome,
            source: 'mock-checkout',
          },
          ...getPaymentTimestampPatch(selectedOption.paymentStatus),
        },
        select: {
          id: true,
          status: true,
        },
      });

      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: nextOrderStatus,
          paymentStatus: selectedOption.paymentStatus,
          placedAt: new Date(),
          statusHistory: {
            create: {
              status: nextOrderStatus,
              paymentStatus: selectedOption.paymentStatus,
              fulfillmentStatus: order.fulfillmentStatus,
              note: selectedOption.note,
            },
          },
        },
      });

      return createdPayment;
    });

    await logAdminAudit({
      actorUserId: customer.id,
      action: 'CUSTOMER_MOCK_PAYMENT',
      entityType: 'payment',
      entityId: payment.id,
      summary: `Customer mock payment ${input.outcome} on order ${order.orderNumber}.`,
      metadata: {
        outcome: input.outcome,
        orderNumber: order.orderNumber,
        paymentId: payment.id,
        paymentStatus: payment.status,
        customerEmail: customer.email,
      },
    });

    return NextResponse.json({
      success: true,
      orderNumber: params.id,
      paymentId: payment.id,
      paymentStatus: payment.status,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to process mock payment.' }, { status: 400 });
  }
}

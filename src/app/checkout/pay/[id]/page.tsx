import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { CreditCard, Landmark, ShieldCheck } from 'lucide-react';
import MockPaymentActions from '@/app/checkout/pay/[id]/MockPaymentActions';
import { Button } from '@/components/ui/button';
import { getCurrentCustomer } from '@/lib/customer-auth';
import { formatMoneyFromCents, formatOrderStatus, getPaymentStatusTone } from '@/lib/order-utils';
import { prisma } from '@/lib/prisma';

export default async function MockPaymentPage({ params }: { params: { id: string } }) {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect(`/account/login?next=/checkout/pay/${params.id}`);
  }

  const order = await prisma.order.findFirst({
    where: {
      orderNumber: params.id,
      userId: customer.id,
    },
    include: {
      items: {
        orderBy: {
          createdAt: 'asc',
        },
      },
      payments: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Test Payment</p>
            <h1 className="text-4xl font-bold tracking-tight">Mock Checkout for {order.orderNumber}</h1>
            <p className="text-neutral-600 max-w-2xl">
              This page simulates payment outcomes without a real gateway. Use it to validate
              order status changes, account history, and customer flows before connecting live payments.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border bg-white p-5">
              <CreditCard className="w-5 h-5 text-neutral-500" />
              <p className="font-semibold mt-4">Mock Card</p>
              <p className="text-sm text-neutral-500 mt-1">Approve or decline an instant card payment.</p>
            </div>
            <div className="rounded-3xl border bg-white p-5">
              <Landmark className="w-5 h-5 text-neutral-500" />
              <p className="font-semibold mt-4">Bank Transfer</p>
              <p className="text-sm text-neutral-500 mt-1">Leave the order awaiting offline funds.</p>
            </div>
            <div className="rounded-3xl border bg-white p-5">
              <ShieldCheck className="w-5 h-5 text-neutral-500" />
              <p className="font-semibold mt-4">State Sync</p>
              <p className="text-sm text-neutral-500 mt-1">Writes payment records and order history.</p>
            </div>
          </div>

          <MockPaymentActions orderNumber={order.orderNumber} isPaid={order.paymentStatus === 'PAID'} />
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border bg-neutral-50 p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Order Status</p>
                <p className="font-semibold mt-2">{formatOrderStatus(order.status)}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusTone(order.paymentStatus)}`}>
                {formatOrderStatus(order.paymentStatus)}
              </span>
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span>${formatMoneyFromCents(order.subtotalCents).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Discount</span>
                <span>-${formatMoneyFromCents(order.discountCents).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Shipping</span>
                <span>${formatMoneyFromCents(order.shippingCents).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>Total</span>
                <span>${formatMoneyFromCents(order.totalCents).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-semibold">Items</p>
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 text-sm">
                  <div>
                    <p className="font-medium">{item.titleSnapshot}</p>
                    <p className="text-neutral-500">Qty {item.quantity}</p>
                  </div>
                  <p>${formatMoneyFromCents(item.unitPriceCents * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {order.payments.length > 0 ? (
            <div className="rounded-3xl border bg-white p-6 space-y-3">
              <p className="font-semibold">Recent Payment Attempts</p>
              {order.payments.map((payment) => (
                <div key={payment.id} className="rounded-2xl border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium">{formatOrderStatus(payment.method)}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusTone(payment.status)}`}>
                      {formatOrderStatus(payment.status)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-2">{payment.note || 'No note recorded.'}</p>
                </div>
              ))}
            </div>
          ) : null}

          <Button asChild variant="outline" className="w-full bg-white">
            <Link href={`/order/${order.orderNumber}`}>Back to Order</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}

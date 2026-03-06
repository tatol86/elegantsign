import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AlertCircle, CheckCircle2, MapPin, Package, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentCustomer } from '@/lib/customer-auth';
import { formatMoneyFromCents, formatOrderStatus, getPaymentStatusTone } from '@/lib/order-utils';
import { prisma } from '@/lib/prisma';

export default async function OrderPage({ params }: { params: { id: string } }) {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect(`/account/login?next=/order/${params.id}`);
  }

  const order = await prisma.order.findFirst({
    where: {
      orderNumber: params.id,
      userId: customer.id,
    },
    include: {
      shippingAddress: true,
      items: {
        orderBy: {
          createdAt: 'asc',
        },
      },
      payments: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const paymentPending = order.paymentStatus !== 'PAID';
  const latestPayment = order.payments[0] || null;

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="flex justify-center mb-6">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center ${
            paymentPending ? 'bg-amber-100' : 'bg-green-100'
          }`}
        >
          {paymentPending ? (
            <AlertCircle className="w-10 h-10 text-amber-600" />
          ) : (
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          )}
        </div>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          {paymentPending ? 'Payment Required' : 'Order Confirmed'}
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          {paymentPending
            ? 'Your order is saved. Complete a test payment to move it into the confirmed workflow.'
            : 'Your test payment succeeded and the order is now marked as confirmed.'}
        </p>
      </div>

      {paymentPending ? (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-amber-700">Awaiting Payment</p>
            <p className="font-semibold text-amber-900 mt-2">
              Use the test payment screen to simulate a card approval, decline, or bank transfer.
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link href={`/checkout/pay/${order.orderNumber}`}>Go to Test Payment</Link>
          </Button>
        </div>
      ) : null}

      <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-8 mb-10 text-left space-y-8">
        <div className="flex flex-col sm:flex-row justify-between pb-6 border-b border-neutral-200 gap-4">
          <div>
            <span className="text-neutral-500 text-sm font-medium uppercase tracking-wider mb-1 block">
              Order Number
            </span>
            <span className="text-xl font-bold">{order.orderNumber}</span>
          </div>
          <div className="sm:text-right">
            <span className="text-neutral-500 text-sm font-medium uppercase tracking-wider mb-1 block">
              Created
            </span>
            <span className="font-medium text-neutral-900">
              {new Date(order.createdAt).toLocaleDateString('en-AU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-neutral-400" /> Shipping Address
            </h3>
            {order.shippingAddress ? (
              <div className="text-sm text-neutral-600 leading-relaxed">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                <br />
                {order.shippingAddress.line1}
                <br />
                {order.shippingAddress.line2 ? (
                  <>
                    {order.shippingAddress.line2}
                    <br />
                  </>
                ) : null}
                {order.shippingAddress.city} {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
              </div>
            ) : (
              <div className="text-sm text-neutral-600">No shipping address recorded.</div>
            )}
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-neutral-400" /> Order Status
            </h3>
            <div className="text-sm text-neutral-600 leading-relaxed space-y-2">
              <p>
                Status: <span className="font-medium text-black">{formatOrderStatus(order.status)}</span>
              </p>
              <p>
                Payment:
                <span
                  className={`ml-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusTone(
                    order.paymentStatus,
                  )}`}
                >
                  {formatOrderStatus(order.paymentStatus)}
                </span>
              </p>
              <p>
                Shipping method:{' '}
                <span className="font-medium text-black">{order.shippingMethod || 'standard'}</span>
              </p>
              {latestPayment ? (
                <p>
                  Latest attempt:{' '}
                  <span className="font-medium text-black">
                    {latestPayment.note || 'Payment attempt recorded.'}
                  </span>
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Receipt className="w-4 h-4 text-neutral-400" /> Items
          </h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-neutral-100 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="font-medium">{item.titleSnapshot}</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    Qty {item.quantity}
                    {item.selectedSizeLabel ? ` - ${item.selectedSizeLabel}` : ''}
                    {item.selectedColor ? ` - ${item.selectedColor}` : ''}
                  </p>
                </div>
                <p className="font-semibold">
                  ${formatMoneyFromCents(item.unitPriceCents * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-100 space-y-2">
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
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span>${formatMoneyFromCents(order.totalCents).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button asChild size="lg" className="h-14 font-semibold px-8">
          <Link href="/account">View Account</Link>
        </Button>
        {paymentPending ? (
          <Button asChild size="lg" className="h-14 font-semibold px-8">
            <Link href={`/checkout/pay/${order.orderNumber}`}>Go to Test Payment</Link>
          </Button>
        ) : null}
        <Button
          asChild
          size="lg"
          variant="outline"
          className="h-14 font-semibold px-8 bg-white border-neutral-300"
        >
          <Link href="/collections/all">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}

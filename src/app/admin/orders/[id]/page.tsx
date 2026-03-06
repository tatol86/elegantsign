import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdminTopBar from '@/components/admin/AdminTopBar';
import AdminOrderUpdateForm from '@/app/admin/orders/[id]/AdminOrderUpdateForm';
import { requireAdmin } from '@/lib/admin-server';
import { formatMoneyFromCents, formatOrderStatus, getPaymentStatusTone } from '@/lib/order-utils';
import { prisma } from '@/lib/prisma';

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const admin = await requireAdmin('operations');
  const order = await prisma.order.findUnique({
    where: {
      orderNumber: params.id,
    },
    include: {
      user: true,
      shippingAddress: true,
      billingAddress: true,
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
      statusHistory: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <AdminTopBar />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Order Detail</p>
            <h1 className="text-4xl font-bold tracking-tight mt-2">{order.orderNumber}</h1>
            <p className="text-neutral-400 mt-2">
              {order.user?.name || order.user?.email || order.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {admin.role === 'SUPER_ADMIN' ? (
              <Link
                href={`/admin/audit?q=${encodeURIComponent(order.orderNumber)}`}
                className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-semibold hover:bg-neutral-900 transition-colors"
              >
                View Audit Trail
              </Link>
            ) : null}
            <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getPaymentStatusTone(order.paymentStatus)}`}>
              Payment: {formatOrderStatus(order.paymentStatus)}
            </span>
            <span className="inline-flex rounded-full bg-neutral-800 px-4 py-2 text-sm font-semibold">
              Order: {formatOrderStatus(order.status)}
            </span>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <AdminOrderUpdateForm
              orderNumber={order.orderNumber}
              currentStatus={order.status}
              currentPaymentStatus={order.paymentStatus}
              currentFulfillmentStatus={order.fulfillmentStatus}
              currentShippingCarrier={order.shippingCarrier}
              currentTrackingNumber={order.trackingNumber}
              currentInternalNotes={order.internalNotes}
            />

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">Fulfillment</h2>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300 space-y-2">
                <p>Status: <span className="font-semibold text-white">{formatOrderStatus(order.fulfillmentStatus)}</span></p>
                <p>Carrier: <span className="font-semibold text-white">{order.shippingCarrier || 'Not set'}</span></p>
                <p>Tracking: <span className="font-semibold text-white">{order.trackingNumber || 'Not set'}</span></p>
                <p>Shipped: <span className="font-semibold text-white">{order.shippedAt ? new Date(order.shippedAt).toLocaleString('en-AU') : 'Not set'}</span></p>
                <p>Delivered: <span className="font-semibold text-white">{order.deliveredAt ? new Date(order.deliveredAt).toLocaleString('en-AU') : 'Not set'}</span></p>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">Customer</h2>
              <div className="space-y-2 text-sm text-neutral-300">
                <p>{order.user?.name || 'No customer name'}</p>
                <p>{order.email}</p>
                {order.user ? (
                  <Link href={`/admin/customers/${order.user.id}`} className="text-neutral-300 underline underline-offset-4 hover:text-white">
                    Open customer record
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">Addresses</h2>
              <div className="grid gap-4 md:grid-cols-2 text-sm text-neutral-300">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                  <p className="font-semibold text-white">Shipping</p>
                  {order.shippingAddress ? (
                    <div className="mt-3 space-y-1">
                      <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                      <p>{order.shippingAddress.line1}</p>
                      {order.shippingAddress.line2 ? <p>{order.shippingAddress.line2}</p> : null}
                      <p>{order.shippingAddress.city} {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  ) : (
                    <p className="mt-3 text-neutral-500">No shipping address.</p>
                  )}
                </div>
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                  <p className="font-semibold text-white">Billing</p>
                  {order.billingAddress ? (
                    <div className="mt-3 space-y-1">
                      <p>{order.billingAddress.firstName} {order.billingAddress.lastName}</p>
                      <p>{order.billingAddress.line1}</p>
                      {order.billingAddress.line2 ? <p>{order.billingAddress.line2}</p> : null}
                      <p>{order.billingAddress.city} {order.billingAddress.state} {order.billingAddress.postalCode}</p>
                      <p>{order.billingAddress.country}</p>
                    </div>
                  ) : (
                    <p className="mt-3 text-neutral-500">No billing address.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">Order Summary</h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{item.titleSnapshot}</p>
                      <p className="text-sm text-neutral-500 mt-1">
                        Qty {item.quantity}
                        {item.selectedSizeLabel ? ` · ${item.selectedSizeLabel}` : ''}
                        {item.selectedColor ? ` · ${item.selectedColor}` : ''}
                      </p>
                    </div>
                    <p className="font-semibold">${formatMoneyFromCents(item.unitPriceCents * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal</span>
                  <span>${formatMoneyFromCents(order.subtotalCents).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Discount</span>
                  <span>-${formatMoneyFromCents(order.discountCents).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Shipping</span>
                  <span>${formatMoneyFromCents(order.shippingCents).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-800 pt-3 text-lg font-bold">
                  <span>Total</span>
                  <span>${formatMoneyFromCents(order.totalCents).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">Payments</h2>
              {order.payments.length > 0 ? (
                <div className="space-y-3">
                  {order.payments.map((payment) => (
                    <div key={payment.id} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold">{formatOrderStatus(payment.method)}</p>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusTone(payment.status)}`}>
                          {formatOrderStatus(payment.status)}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500 mt-2">
                        {payment.note || 'No payment note.'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500">No payment attempts recorded.</p>
              )}
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">History</h2>
              <div className="space-y-3">
                {order.statusHistory.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold">{formatOrderStatus(entry.status)}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                        {new Date(entry.createdAt).toLocaleString('en-AU')}
                      </p>
                    </div>
                    <p className="text-sm text-neutral-500 mt-2">
                      Payment: {entry.paymentStatus ? formatOrderStatus(entry.paymentStatus) : 'No change'} · Fulfillment: {entry.fulfillmentStatus ? formatOrderStatus(entry.fulfillmentStatus) : 'No change'}
                    </p>
                    {entry.note ? <p className="text-sm text-neutral-300 mt-2">{entry.note}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

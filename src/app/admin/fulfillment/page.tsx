import Link from 'next/link';
import { FulfillmentStatus, Prisma } from '@prisma/client';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { formatMoneyFromCents, formatOrderStatus, getPaymentStatusTone } from '@/lib/order-utils';
import { prisma } from '@/lib/prisma';

function getStringParam(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : '';
}

export default async function AdminFulfillmentPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const query = getStringParam(searchParams.q);
  const fulfillmentStatus = getStringParam(searchParams.fulfillmentStatus);

  const where: Prisma.OrderWhereInput = {
    ...(query
      ? {
          OR: [
            { orderNumber: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(fulfillmentStatus ? { fulfillmentStatus: fulfillmentStatus as FulfillmentStatus } : {}),
  };

  const [orders, orderCount] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        items: { select: { id: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <AdminTopBar />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Shipping</p>
            <h1 className="text-4xl font-bold tracking-tight mt-2">Fulfillment Management</h1>
            <p className="text-neutral-400 mt-2">
              Track outgoing orders, shipping carriers, and delivery progress.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-4">
            <p className="text-sm text-neutral-500">Orders</p>
            <p className="text-3xl font-bold mt-2">{orderCount}</p>
          </div>
        </section>

        <form className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-3">
            <label className="text-sm text-neutral-400 block mb-2">Search</label>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Order number or customer email"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm placeholder:text-neutral-600"
            />
          </div>
          <div>
            <label className="text-sm text-neutral-400 block mb-2">Fulfillment Status</label>
            <select name="fulfillmentStatus" defaultValue={fulfillmentStatus} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm">
              <option value="">All</option>
              {Object.values(FulfillmentStatus).map((option) => (
                <option key={option} value={option}>
                  {formatOrderStatus(option)}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 xl:col-span-4 flex gap-3">
            <button type="submit" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors">
              Apply Filters
            </button>
            <Link href="/admin/fulfillment" className="rounded-xl border border-neutral-700 px-5 py-3 text-sm font-semibold hover:bg-neutral-950 transition-colors">
              Reset
            </Link>
          </div>
        </form>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden">
          <div className="grid grid-cols-[0.9fr_0.8fr_0.7fr_0.9fr_0.9fr_0.6fr] gap-4 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 border-b border-neutral-800">
            <span>Order</span>
            <span>Customer</span>
            <span>Payment</span>
            <span>Fulfillment</span>
            <span>Tracking</span>
            <span>Total</span>
          </div>
          <div className="divide-y divide-neutral-800">
            {orders.map((order) => (
              <div key={order.id} className="grid grid-cols-[0.9fr_0.8fr_0.7fr_0.9fr_0.9fr_0.6fr] gap-4 px-6 py-5 items-center">
                <div>
                  <Link href={`/admin/orders/${order.orderNumber}`} className="font-semibold hover:text-neutral-300">
                    {order.orderNumber}
                  </Link>
                  <p className="text-sm text-neutral-500 mt-1">
                    {order.items.length} item{order.items.length === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="text-sm text-neutral-300">{order.email}</div>
                <div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusTone(order.paymentStatus)}`}>
                    {formatOrderStatus(order.paymentStatus)}
                  </span>
                </div>
                <div className="text-sm">{formatOrderStatus(order.fulfillmentStatus)}</div>
                <div className="text-sm text-neutral-400">
                  {order.shippingCarrier || order.trackingNumber
                    ? `${order.shippingCarrier || 'Carrier'} / ${order.trackingNumber || 'No tracking'}`
                    : 'Not assigned'}
                </div>
                <div className="font-semibold">${formatMoneyFromCents(order.totalCents).toFixed(2)}</div>
              </div>
            ))}
            {orders.length === 0 ? (
              <div className="px-6 py-12 text-center text-neutral-500">No fulfillment records matched the current filters.</div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

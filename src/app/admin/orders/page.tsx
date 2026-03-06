import Link from 'next/link';
import { FulfillmentStatus, OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { formatMoneyFromCents, formatOrderStatus, getPaymentStatusTone } from '@/lib/order-utils';
import { prisma } from '@/lib/prisma';

const orderStatusOptions = Object.values(OrderStatus);
const paymentStatusOptions = Object.values(PaymentStatus);
const fulfillmentStatusOptions = Object.values(FulfillmentStatus);

function getStringParam(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : '';
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const query = getStringParam(searchParams.q);
  const status = getStringParam(searchParams.status);
  const paymentStatus = getStringParam(searchParams.paymentStatus);
  const fulfillmentStatus = getStringParam(searchParams.fulfillmentStatus);

  const where: Prisma.OrderWhereInput = {
    ...(query
      ? {
          OR: [
            { orderNumber: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { user: { name: { contains: query, mode: 'insensitive' } } },
          ],
        }
      : {}),
    ...(status ? { status: status as OrderStatus } : {}),
    ...(paymentStatus ? { paymentStatus: paymentStatus as PaymentStatus } : {}),
    ...(fulfillmentStatus ? { fulfillmentStatus: fulfillmentStatus as FulfillmentStatus } : {}),
  };

  const [orders, orderCount] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: { select: { id: true, name: true, email: true } },
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
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Operations</p>
            <h1 className="text-4xl font-bold tracking-tight mt-2">Order Management</h1>
            <p className="text-neutral-400 mt-2">
              Review customer orders, payment outcomes, and fulfillment progress.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-4">
            <p className="text-sm text-neutral-500">Results</p>
            <p className="text-3xl font-bold mt-2">{orderCount}</p>
          </div>
        </section>

        <form className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <label className="text-sm text-neutral-400 block mb-2">Search</label>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Order number, email, customer name"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm placeholder:text-neutral-600"
            />
          </div>
          <div>
            <label className="text-sm text-neutral-400 block mb-2">Order Status</label>
            <select name="status" defaultValue={status} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm">
              <option value="">All</option>
              {orderStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {formatOrderStatus(option)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-neutral-400 block mb-2">Payment</label>
            <select name="paymentStatus" defaultValue={paymentStatus} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm">
              <option value="">All</option>
              {paymentStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {formatOrderStatus(option)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-neutral-400 block mb-2">Fulfillment</label>
            <select name="fulfillmentStatus" defaultValue={fulfillmentStatus} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm">
              <option value="">All</option>
              {fulfillmentStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {formatOrderStatus(option)}
                </option>
              ))}
            </select>
          </div>
          <div className="xl:col-span-5 flex gap-3">
            <button type="submit" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors">
              Apply Filters
            </button>
            <Link href="/admin/orders" className="rounded-xl border border-neutral-700 px-5 py-3 text-sm font-semibold hover:bg-neutral-950 transition-colors">
              Reset
            </Link>
          </div>
        </form>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden">
          <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr_0.6fr] gap-4 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 border-b border-neutral-800">
            <span>Order</span>
            <span>Customer</span>
            <span>Total</span>
            <span>Order Status</span>
            <span>Payment</span>
            <span></span>
          </div>

          <div className="divide-y divide-neutral-800">
            {orders.map((order) => (
              <div key={order.id} className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr_0.6fr] gap-4 px-6 py-5 items-center">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('en-AU')}
                  </p>
                </div>
                <div>
                  <p className="font-medium">{order.user?.name || order.user?.email || order.email}</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {order.items.length} item{order.items.length === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="font-semibold">
                  ${formatMoneyFromCents(order.totalCents).toFixed(2)}
                </div>
                <div className="text-sm">{formatOrderStatus(order.status)}</div>
                <div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusTone(order.paymentStatus)}`}>
                    {formatOrderStatus(order.paymentStatus)}
                  </span>
                </div>
                <div className="text-right">
                  <Link href={`/admin/orders/${order.orderNumber}`} className="text-sm font-semibold text-neutral-300 hover:text-white">
                    Open
                  </Link>
                </div>
              </div>
            ))}

            {orders.length === 0 ? (
              <div className="px-6 py-12 text-center text-neutral-500">No orders matched the current filters.</div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

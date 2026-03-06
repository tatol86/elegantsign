import Link from 'next/link';
import { ArrowRight, CreditCard, Package, ShoppingCart, Users } from 'lucide-react';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { formatMoneyFromCents, formatOrderStatus, getPaymentStatusTone } from '@/lib/order-utils';
import { prisma } from '@/lib/prisma';

export default async function AdminDashboardPage() {
  const [productCount, customerCount, orderCount, pendingOrders, pendingPayments, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { paymentStatus: { in: ['PENDING', 'FAILED'] } } }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { id: true } },
        },
      }),
    ]);

  const totalRevenue = await prisma.order.aggregate({
    _sum: { totalCents: true },
    where: { paymentStatus: 'PAID' },
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <AdminTopBar />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Overview</p>
            <h1 className="text-4xl font-bold tracking-tight mt-2">Operations Dashboard</h1>
            <p className="text-neutral-400 mt-2 max-w-2xl">
              Use this as the control room for orders, customers, payments, and catalog updates.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/orders" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors">
              Review Orders
            </Link>
            <Link href="/admin/products" className="rounded-xl border border-neutral-700 px-5 py-3 text-sm font-semibold hover:bg-neutral-900 transition-colors">
              Manage Products
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
            <ShoppingCart className="w-5 h-5 text-neutral-500" />
            <p className="text-sm text-neutral-500 mt-4">Orders</p>
            <p className="text-3xl font-bold mt-2">{orderCount}</p>
          </div>
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
            <Package className="w-5 h-5 text-neutral-500" />
            <p className="text-sm text-neutral-500 mt-4">Products</p>
            <p className="text-3xl font-bold mt-2">{productCount}</p>
          </div>
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
            <Users className="w-5 h-5 text-neutral-500" />
            <p className="text-sm text-neutral-500 mt-4">Customers</p>
            <p className="text-3xl font-bold mt-2">{customerCount}</p>
          </div>
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
            <CreditCard className="w-5 h-5 text-neutral-500" />
            <p className="text-sm text-neutral-500 mt-4">Payment Follow-up</p>
            <p className="text-3xl font-bold mt-2">{pendingPayments}</p>
          </div>
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
            <p className="text-sm text-neutral-500">Paid Revenue</p>
            <p className="text-3xl font-bold mt-6">
              ${formatMoneyFromCents(totalRevenue._sum.totalCents || 0).toFixed(2)}
            </p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Recent Orders</h2>
                <p className="text-sm text-neutral-500 mt-1">Latest activity requiring attention.</p>
              </div>
              <Link href="/admin/orders" className="text-sm font-medium text-neutral-300 hover:text-white">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.orderNumber}`}
                  className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 transition-colors hover:border-neutral-600"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold">{order.orderNumber}</p>
                      <p className="text-sm text-neutral-500 mt-1">
                        {order.user?.name || order.user?.email || order.email}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusTone(order.paymentStatus)}`}>
                        {formatOrderStatus(order.paymentStatus)}
                      </span>
                      <p className="text-sm text-neutral-400 mt-2">
                        {order.items.length} item{order.items.length === 1 ? '' : 's'} · ${formatMoneyFromCents(order.totalCents).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
              <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">Priority Queue</p>
              <div className="mt-5 space-y-4">
                <Link href="/admin/orders?status=PENDING" className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-4 hover:border-neutral-600 transition-colors">
                  <div>
                    <p className="font-semibold">Pending Orders</p>
                    <p className="text-sm text-neutral-500 mt-1">Orders waiting for payment or review.</p>
                  </div>
                  <span className="text-2xl font-bold">{pendingOrders}</span>
                </Link>
                <Link href="/admin/orders?paymentStatus=PENDING" className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-4 hover:border-neutral-600 transition-colors">
                  <div>
                    <p className="font-semibold">Payment Follow-up</p>
                    <p className="text-sm text-neutral-500 mt-1">Pending and failed payment attempts.</p>
                  </div>
                  <span className="text-2xl font-bold">{pendingPayments}</span>
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
              <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">Modules</p>
              <div className="mt-5 space-y-3">
                {[
                  { href: '/admin/orders', label: 'Order management', description: 'Review orders, payments, and fulfillment states.' },
                  { href: '/admin/payments', label: 'Payment management', description: 'Inspect payment attempts, methods, and references.' },
                  { href: '/admin/fulfillment', label: 'Fulfillment management', description: 'Track carrier details, tracking numbers, and shipped orders.' },
                  { href: '/admin/customers', label: 'Customer management', description: 'Inspect customer records, addresses, and order history.' },
                  { href: '/admin/products', label: 'Product management', description: 'Maintain catalog, pricing, and storefront visibility.' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-start justify-between rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-4 hover:border-neutral-600 transition-colors"
                  >
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-sm text-neutral-500 mt-1">{item.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-500 mt-1" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

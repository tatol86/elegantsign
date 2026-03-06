import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { formatMoneyFromCents, formatOrderStatus, getPaymentStatusTone } from '@/lib/order-utils';
import { prisma } from '@/lib/prisma';

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await prisma.user.findUnique({
    where: {
      id: params.id,
    },
    include: {
      addresses: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      orders: {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          items: {
            select: {
              id: true,
            },
          },
        },
      },
      sessions: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      },
    },
  });

  if (!customer || customer.role !== 'CUSTOMER') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <AdminTopBar />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Customer Record</p>
            <h1 className="text-4xl font-bold tracking-tight mt-2">{customer.name || 'Unnamed Customer'}</h1>
            <p className="text-neutral-400 mt-2">{customer.email}</p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-4">
            <p className="text-sm text-neutral-500">Orders</p>
            <p className="text-3xl font-bold mt-2">{customer.orders.length}</p>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
              <div className="space-y-2 text-sm text-neutral-300">
                <p>Email: {customer.email}</p>
                <p>Name: {customer.name || 'Not set'}</p>
                <p>Created: {new Date(customer.createdAt).toLocaleDateString('en-AU')}</p>
                <p>Last updated: {new Date(customer.updatedAt).toLocaleDateString('en-AU')}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">Addresses</h2>
              <div className="space-y-3">
                {customer.addresses.map((address) => (
                  <div key={address.id} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300">
                    <p className="font-semibold text-white">
                      {address.firstName} {address.lastName}
                    </p>
                    <p className="mt-2">{address.line1}</p>
                    {address.line2 ? <p>{address.line2}</p> : null}
                    <p>{address.city} {address.state} {address.postalCode}</p>
                    <p>{address.country}</p>
                  </div>
                ))}
                {customer.addresses.length === 0 ? (
                  <p className="text-sm text-neutral-500">No addresses recorded.</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">Order History</h2>
              <div className="space-y-3">
                {customer.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.orderNumber}`}
                    className="block rounded-2xl border border-neutral-800 bg-neutral-950 p-4 hover:border-neutral-600 transition-colors"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold">{order.orderNumber}</p>
                        <p className="text-sm text-neutral-500 mt-1">
                          {order.items.length} item{order.items.length === 1 ? '' : 's'} · {new Date(order.createdAt).toLocaleDateString('en-AU')}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusTone(order.paymentStatus)}`}>
                          {formatOrderStatus(order.paymentStatus)}
                        </span>
                        <p className="text-sm text-neutral-500 mt-2">{formatOrderStatus(order.status)}</p>
                        <p className="font-semibold mt-2">${formatMoneyFromCents(order.totalCents).toFixed(2)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
                {customer.orders.length === 0 ? (
                  <p className="text-sm text-neutral-500">No orders yet.</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">Recent Sessions</h2>
              <div className="space-y-3">
                {customer.sessions.map((session) => (
                  <div key={session.id} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300">
                    <p>Created: {new Date(session.createdAt).toLocaleString('en-AU')}</p>
                    <p className="mt-1">Expires: {new Date(session.expires).toLocaleString('en-AU')}</p>
                  </div>
                ))}
                {customer.sessions.length === 0 ? (
                  <p className="text-sm text-neutral-500">No sessions recorded.</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

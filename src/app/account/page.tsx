import Link from 'next/link';
import { redirect } from 'next/navigation';
import AccountLogoutButton from '@/app/account/AccountLogoutButton';
import { getCurrentCustomer } from '@/lib/customer-auth';
import { formatMoneyFromCents, formatOrderStatus, getPaymentStatusTone } from '@/lib/order-utils';
import { prisma } from '@/lib/prisma';

export default async function AccountPage() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect('/account/login?next=/account');
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: customer.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      items: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  return (
    <div className="container mx-auto px-4 py-12 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b pb-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Account</p>
          <h1 className="text-4xl font-bold tracking-tight mt-2">{customer.name || customer.email}</h1>
          <p className="text-neutral-500 mt-2">{customer.email}</p>
        </div>
        <AccountLogoutButton />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Your Orders</h2>
          <Link href="/collections/all" className="text-sm font-medium text-neutral-600 hover:text-black">
            Continue shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border bg-neutral-50 p-8 text-center">
            <h3 className="text-xl font-semibold">No orders yet</h3>
            <p className="text-neutral-500 mt-2">Your completed checkouts will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/order/${order.orderNumber}`}
                className="block rounded-3xl border bg-white p-6 transition-colors hover:border-black"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Order</p>
                    <h3 className="text-xl font-semibold mt-1">{order.orderNumber}</h3>
                    <p className="text-sm text-neutral-500 mt-2">
                      {order.items.length} item{order.items.length === 1 ? '' : 's'} -{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-AU')}
                    </p>
                    {order.paymentStatus !== 'PAID' ? (
                      <p className="text-sm text-amber-700 mt-3">Open this order to complete the test payment.</p>
                    ) : null}
                  </div>
                  <div className="text-left md:text-right space-y-2">
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">Order Status</p>
                      <p className="font-semibold mt-1">{formatOrderStatus(order.status)}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusTone(order.paymentStatus)}`}>
                      Payment: {formatOrderStatus(order.paymentStatus)}
                    </span>
                    <p className="text-lg font-bold mt-2">${formatMoneyFromCents(order.totalCents).toFixed(2)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

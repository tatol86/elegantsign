import Link from 'next/link';
import { Prisma } from '@prisma/client';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { formatMoneyFromCents } from '@/lib/order-utils';
import { prisma } from '@/lib/prisma';

function getStringParam(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : '';
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const query = getStringParam(searchParams.q);

  const where: Prisma.UserWhereInput = {
    role: 'CUSTOMER',
    ...(query
      ? {
          OR: [
            { email: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [customers, customerCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            orderNumber: true,
            totalCents: true,
          },
        },
        _count: {
          select: {
            orders: true,
            addresses: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <AdminTopBar />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Relationships</p>
            <h1 className="text-4xl font-bold tracking-tight mt-2">Customer Management</h1>
            <p className="text-neutral-400 mt-2">
              Search customers, inspect their addresses, and review order history.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-4">
            <p className="text-sm text-neutral-500">Customers</p>
            <p className="text-3xl font-bold mt-2">{customerCount}</p>
          </div>
        </section>

        <form className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 flex flex-col gap-4 md:flex-row">
          <input type="text" name="q" defaultValue={query} placeholder="Name or email" className="flex-1 rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm placeholder:text-neutral-600" />
          <div className="flex gap-3">
            <button type="submit" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors">
              Search
            </button>
            <Link href="/admin/customers" className="rounded-xl border border-neutral-700 px-5 py-3 text-sm font-semibold hover:bg-neutral-950 transition-colors">
              Reset
            </Link>
          </div>
        </form>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden">
          <div className="grid grid-cols-[1fr_0.7fr_0.7fr_0.8fr_0.5fr] gap-4 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 border-b border-neutral-800">
            <span>Customer</span>
            <span>Orders</span>
            <span>Addresses</span>
            <span>Latest Order</span>
            <span></span>
          </div>

          <div className="divide-y divide-neutral-800">
            {customers.map((customer) => (
              <div key={customer.id} className="grid grid-cols-[1fr_0.7fr_0.7fr_0.8fr_0.5fr] gap-4 px-6 py-5 items-center">
                <div>
                  <p className="font-semibold">{customer.name || 'Unnamed Customer'}</p>
                  <p className="text-sm text-neutral-500 mt-1">{customer.email}</p>
                </div>
                <div>{customer._count.orders}</div>
                <div>{customer._count.addresses}</div>
                <div>
                  {customer.orders[0] ? (
                    <>
                      <p className="font-medium">{customer.orders[0].orderNumber}</p>
                      <p className="text-sm text-neutral-500 mt-1">${formatMoneyFromCents(customer.orders[0].totalCents).toFixed(2)}</p>
                    </>
                  ) : (
                    <p className="text-sm text-neutral-500">No orders yet</p>
                  )}
                </div>
                <div className="text-right">
                  <Link href={`/admin/customers/${customer.id}`} className="text-sm font-semibold text-neutral-300 hover:text-white">
                    Open
                  </Link>
                </div>
              </div>
            ))}

            {customers.length === 0 ? (
              <div className="px-6 py-12 text-center text-neutral-500">No customers matched the current search.</div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

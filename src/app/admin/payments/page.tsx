import Link from 'next/link';
import { PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import AdminTopBar from '@/components/admin/AdminTopBar';
import AdminPaymentActions from '@/app/admin/payments/AdminPaymentActions';
import { requireAdmin } from '@/lib/admin-server';
import { formatMoneyFromCents, formatOrderStatus, getPaymentStatusTone } from '@/lib/order-utils';
import { prisma } from '@/lib/prisma';

function getStringParam(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : '';
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const admin = await requireAdmin('operations');
  const query = getStringParam(searchParams.q);
  const status = getStringParam(searchParams.status);
  const method = getStringParam(searchParams.method);

  const where: Prisma.PaymentWhereInput = {
    ...(query
      ? {
          OR: [
            { externalReference: { contains: query, mode: 'insensitive' } },
            { order: { orderNumber: { contains: query, mode: 'insensitive' } } },
            { order: { email: { contains: query, mode: 'insensitive' } } },
          ],
        }
      : {}),
    ...(status ? { status: status as PaymentStatus } : {}),
    ...(method ? { method: method as PaymentMethod } : {}),
  };

  const [payments, paymentCount] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        order: {
          select: {
            orderNumber: true,
            email: true,
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <AdminTopBar />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Finance</p>
            <h1 className="text-4xl font-bold tracking-tight mt-2">Payment Management</h1>
            <p className="text-neutral-400 mt-2">
              Review every payment attempt, apply manual status changes, and jump straight to linked audit history.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-4">
            <p className="text-sm text-neutral-500">Payments</p>
            <p className="text-3xl font-bold mt-2">{paymentCount}</p>
          </div>
        </section>

        <form className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-2">
            <label className="text-sm text-neutral-400 block mb-2">Search</label>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Order number, email, external reference"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm placeholder:text-neutral-600"
            />
          </div>
          <div>
            <label className="text-sm text-neutral-400 block mb-2">Status</label>
            <select name="status" defaultValue={status} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm">
              <option value="">All</option>
              {Object.values(PaymentStatus).map((option) => (
                <option key={option} value={option}>
                  {formatOrderStatus(option)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-neutral-400 block mb-2">Method</label>
            <select name="method" defaultValue={method} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm">
              <option value="">All</option>
              {Object.values(PaymentMethod).map((option) => (
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
            <Link href="/admin/payments" className="rounded-xl border border-neutral-700 px-5 py-3 text-sm font-semibold hover:bg-neutral-950 transition-colors">
              Reset
            </Link>
          </div>
        </form>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden">
          <div className="grid grid-cols-[0.9fr_0.9fr_0.8fr_0.8fr_1fr_0.6fr_1fr] gap-4 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 border-b border-neutral-800">
            <span>Order</span>
            <span>Customer</span>
            <span>Method</span>
            <span>Status</span>
            <span>Reference</span>
            <span>Amount</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-neutral-800">
            {payments.map((payment) => (
              <div key={payment.id} className="grid grid-cols-[0.9fr_0.9fr_0.8fr_0.8fr_1fr_0.6fr_1fr] gap-4 px-6 py-5 items-center">
                <div>
                  <Link href={`/admin/orders/${payment.order.orderNumber}`} className="font-semibold hover:text-neutral-300">
                    {payment.order.orderNumber}
                  </Link>
                  <p className="text-sm text-neutral-500 mt-1">
                    {new Date(payment.createdAt).toLocaleString('en-AU')}
                  </p>
                </div>
                <div className="text-sm text-neutral-300">{payment.order.email}</div>
                <div className="text-sm">{formatOrderStatus(payment.method)}</div>
                <div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusTone(payment.status)}`}>
                    {formatOrderStatus(payment.status)}
                  </span>
                </div>
                <div className="text-sm text-neutral-400">{payment.externalReference || 'No reference'}</div>
                <div className="font-semibold">${formatMoneyFromCents(payment.amountCents).toFixed(2)}</div>
                <AdminPaymentActions
                  paymentId={payment.id}
                  paymentStatus={payment.status}
                  canViewAudit={admin.role === 'SUPER_ADMIN'}
                />
              </div>
            ))}
            {payments.length === 0 ? (
              <div className="px-6 py-12 text-center text-neutral-500">No payments matched the current filters.</div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { Prisma } from '@prisma/client';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { requireAdmin } from '@/lib/admin-server';
import { prisma } from '@/lib/prisma';

function getStringParam(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : '';
}

function formatTimestamp(value: Date) {
  return new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireAdmin('manage_admins');

  const query = getStringParam(searchParams.q);
  const action = getStringParam(searchParams.action);
  const entityType = getStringParam(searchParams.entityType);
  const actor = getStringParam(searchParams.actor);

  const where: Prisma.AdminAuditLogWhereInput = {
    ...(action ? { action } : {}),
    ...(entityType ? { entityType } : {}),
    ...(actor
      ? {
          actor: {
            OR: [
              { email: { contains: actor, mode: 'insensitive' } },
              { name: { contains: actor, mode: 'insensitive' } },
            ],
          },
        }
      : {}),
    ...(query
      ? {
          OR: [
            { summary: { contains: query, mode: 'insensitive' } },
            { action: { contains: query, mode: 'insensitive' } },
            { entityType: { contains: query, mode: 'insensitive' } },
            { entityId: { contains: query, mode: 'insensitive' } },
            { actor: { email: { contains: query, mode: 'insensitive' } } },
            { actor: { name: { contains: query, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const [logs, totalCount, recentCount] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        actor: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.adminAuditLog.count({ where }),
    prisma.adminAuditLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  const actionOptions = await prisma.adminAuditLog.findMany({
    select: { action: true },
    distinct: ['action'],
    orderBy: { action: 'asc' },
  });

  const entityOptions = await prisma.adminAuditLog.findMany({
    select: { entityType: true },
    distinct: ['entityType'],
    orderBy: { entityType: 'asc' },
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <AdminTopBar />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Security</p>
            <h1 className="text-4xl font-bold tracking-tight mt-2">Admin Audit Log</h1>
            <p className="text-neutral-400 mt-2 max-w-3xl">
              Review who changed what across admin accounts, catalog operations, uploads, payments, and order management.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-4">
              <p className="text-sm text-neutral-500">Filtered Results</p>
              <p className="text-3xl font-bold mt-2">{totalCount}</p>
            </div>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-4">
              <p className="text-sm text-neutral-500">Last 24 Hours</p>
              <p className="text-3xl font-bold mt-2">{recentCount}</p>
            </div>
          </div>
        </section>

        <form className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-2">
            <label className="text-sm text-neutral-400 block mb-2">Search</label>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Actor, action, entity, id, summary"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm placeholder:text-neutral-600"
            />
          </div>
          <div>
            <label className="text-sm text-neutral-400 block mb-2">Actor</label>
            <input
              type="text"
              name="actor"
              defaultValue={actor}
              placeholder="Admin email or name"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm placeholder:text-neutral-600"
            />
          </div>
          <div>
            <label className="text-sm text-neutral-400 block mb-2">Action</label>
            <select
              name="action"
              defaultValue={action}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm"
            >
              <option value="">All</option>
              {actionOptions.map((option) => (
                <option key={option.action} value={option.action}>
                  {option.action}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-neutral-400 block mb-2">Entity</label>
            <select
              name="entityType"
              defaultValue={entityType}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm"
            >
              <option value="">All</option>
              {entityOptions.map((option) => (
                <option key={option.entityType} value={option.entityType}>
                  {option.entityType}
                </option>
              ))}
            </select>
          </div>
          <div className="xl:col-span-4 flex gap-3">
            <button type="submit" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors">
              Apply Filters
            </button>
            <Link href="/admin/audit" className="rounded-xl border border-neutral-700 px-5 py-3 text-sm font-semibold hover:bg-neutral-950 transition-colors">
              Reset
            </Link>
          </div>
        </form>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden">
          <div className="grid grid-cols-[0.9fr_0.9fr_0.7fr_1.5fr_0.8fr] gap-4 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 border-b border-neutral-800">
            <span>When</span>
            <span>Actor</span>
            <span>Action</span>
            <span>Summary</span>
            <span>Entity</span>
          </div>

          <div className="divide-y divide-neutral-800">
            {logs.map((log) => (
              <div key={log.id} className="grid grid-cols-[0.9fr_0.9fr_0.7fr_1.5fr_0.8fr] gap-4 px-6 py-5">
                <div className="text-sm text-neutral-300">
                  <p>{formatTimestamp(log.createdAt)}</p>
                </div>
                <div>
                  <p className="font-medium">{log.actor?.name || 'Unknown user'}</p>
                  <p className="text-sm text-neutral-500 mt-1">{log.actor?.email || 'Deleted / unavailable'}</p>
                </div>
                <div className="text-sm">
                  <span className="inline-flex rounded-full border border-neutral-700 px-3 py-1 text-xs font-semibold text-neutral-200">
                    {log.action}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-neutral-200">{log.summary}</p>
                  {log.metadata ? (
                    <pre className="mt-3 overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-500">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  ) : null}
                </div>
                <div className="text-sm text-neutral-400">
                  <p className="font-medium text-neutral-200">{log.entityType}</p>
                  <p className="mt-1 break-all">{log.entityId || '-'}</p>
                </div>
              </div>
            ))}

            {logs.length === 0 ? (
              <div className="px-6 py-12 text-center text-neutral-500">No audit events matched the current filters.</div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

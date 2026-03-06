import AdminTopBar from '@/components/admin/AdminTopBar';
import AdminCreateForm from '@/app/admin/admins/AdminCreateForm';
import AdminTeamManager from '@/app/admin/admins/AdminTeamManager';
import { requireAdmin } from '@/lib/admin-server';
import { prisma } from '@/lib/prisma';

const ROLE_EXPLANATIONS = [
  {
    role: 'SUPER_ADMIN',
    description: 'Full access. Can manage admin accounts, orders, customers, payments, fulfillment, and products.',
  },
  {
    role: 'OPS_MANAGER',
    description: 'Operational access. Can manage orders, customers, payments, and fulfillment, but not admin accounts.',
  },
  {
    role: 'CATALOG_MANAGER',
    description: 'Catalog access. Can manage products and media, but not orders, payments, or admin accounts.',
  },
];

export default async function AdminAccountsPage() {
  const admin = await requireAdmin('manage_admins');
  const admins = await prisma.user.findMany({
    where: {
      role: 'ADMIN',
      adminRole: {
        not: null,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      id: true,
      name: true,
      email: true,
      adminRole: true,
      isActive: true,
    },
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <AdminTopBar />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section>
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Admin Accounts</p>
          <h1 className="text-4xl font-bold tracking-tight mt-2">Team & Permissions</h1>
          <p className="text-neutral-400 mt-2 max-w-3xl">
            Super admins manage backend accounts, role assignments, and activation state.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {ROLE_EXPLANATIONS.map((item) => (
            <div key={item.role} className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">{item.role}</p>
              <p className="font-semibold text-white mt-4">{item.description}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <AdminCreateForm />
          <AdminTeamManager
            admins={admins.map((entry) => ({
              id: entry.id,
              name: entry.name,
              email: entry.email,
              adminRole: entry.adminRole!,
              isActive: entry.isActive,
            }))}
            currentAdminId={admin.userId}
          />
        </div>
      </div>
    </div>
  );
}

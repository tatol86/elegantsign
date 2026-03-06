import AdminTopBar from '@/components/admin/AdminTopBar';
import AdminProfileForm from '@/app/admin/profile/AdminProfileForm';
import { requireAdmin } from '@/lib/admin-server';

export default async function AdminProfilePage() {
  const admin = await requireAdmin('dashboard');

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <AdminTopBar />

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <section>
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Profile</p>
          <h1 className="text-4xl font-bold tracking-tight mt-2">Admin Account</h1>
          <p className="text-neutral-400 mt-2">
            Signed in as {admin.email} with role {admin.role}.
          </p>
        </section>

        <AdminProfileForm initialName={admin.name || ''} initialEmail={admin.email} />
      </div>
    </div>
  );
}

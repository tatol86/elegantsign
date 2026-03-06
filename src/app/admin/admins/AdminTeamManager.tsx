'use client';

import Link from 'next/link';
import { useState } from 'react';

type AdminRow = {
  id: string;
  name: string | null;
  email: string;
  adminRole: 'SUPER_ADMIN' | 'OPS_MANAGER' | 'CATALOG_MANAGER';
  isActive: boolean;
};

type AdminTeamManagerProps = {
  admins: AdminRow[];
  currentAdminId: string;
};

export default function AdminTeamManager({
  admins,
  currentAdminId,
}: AdminTeamManagerProps) {
  const currentAdmin = admins.find((admin) => admin.id === currentAdminId) || null;
  const [rows, setRows] = useState(() =>
    admins
      .filter((admin) => admin.id !== currentAdminId)
      .map((admin) => ({
      ...admin,
      newPassword: '',
      message: '',
      error: '',
      submitting: false,
      })),
  );

  const updateRow = (id: string, patch: Record<string, unknown>) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const handleSave = async (id: string) => {
    const row = rows.find((entry) => entry.id === id);

    if (!row) {
      return;
    }

    updateRow(id, { submitting: true, message: '', error: '' });

    try {
      const response = await fetch(`/api/admin/admins/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: row.name || '',
          email: row.email,
          adminRole: row.adminRole,
          isActive: row.isActive,
          newPassword: row.newPassword || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        updateRow(id, { error: data?.error || 'Unable to update admin.', submitting: false });
        return;
      }

      updateRow(id, {
        newPassword: '',
        message: 'Saved.',
        error: '',
        submitting: false,
      });
    } catch {
      updateRow(id, { error: 'Unable to update admin.', submitting: false });
    }
  };

  const handleDelete = async (id: string) => {
    const row = rows.find((entry) => entry.id === id);

    if (!row) {
      return;
    }

    const confirmed = window.confirm(
      `Delete admin ${row.email}? This removes the account permanently.`,
    );

    if (!confirmed) {
      return;
    }

    updateRow(id, { submitting: true, message: '', error: '' });

    try {
      const response = await fetch(`/api/admin/admins/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        updateRow(id, {
          error: data?.error || 'Unable to delete admin.',
          submitting: false,
        });
        return;
      }

      setRows((current) => current.filter((entry) => entry.id !== id));
    } catch {
      updateRow(id, { error: 'Unable to delete admin.', submitting: false });
    }
  };

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">Admin Team</h2>
        <p className="text-sm text-neutral-400 mt-1">
          Manage other admin accounts here. Use Profile for your own email, name, and password.
        </p>
      </div>

      {currentAdmin ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-white">{currentAdmin.name || 'Unnamed Admin'}</p>
              <p className="text-sm text-neutral-500 mt-1">Current session</p>
            </div>
            <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs uppercase tracking-[0.18em] text-neutral-300">
              {currentAdmin.adminRole.replace('_', ' ')}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-neutral-500">Name</p>
              <p className="mt-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white">
                {currentAdmin.name || 'Unnamed Admin'}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Email</p>
              <p className="mt-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white">
                {currentAdmin.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
            <p className="text-sm text-amber-100">
              Your own login details are managed in Profile. Team settings here are limited to other admins.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/audit?actor=${encodeURIComponent(currentAdmin.email)}`}
                className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                View Audit
              </Link>
              <Link
                href="/admin/profile"
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-neutral-200"
              >
                Go to Profile
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950 px-4 py-6 text-sm text-neutral-400">
            No other admin accounts yet.
          </div>
        ) : null}

        {rows.map((row) => (
          <div key={row.id} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-white">{row.name || 'Unnamed Admin'}</p>
                <p className="text-sm text-neutral-500 mt-1">Managed account</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-neutral-300">
                <input type="checkbox" checked={row.isActive} onChange={(event) => updateRow(row.id, { isActive: event.target.checked })} />
                Active
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-neutral-400 block mb-2">Name</label>
                <input value={row.name || ''} onChange={(event) => updateRow(row.id, { name: event.target.value })} className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white" />
              </div>
              <div>
                <label className="text-sm text-neutral-400 block mb-2">Email</label>
                <input value={row.email} onChange={(event) => updateRow(row.id, { email: event.target.value })} className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white" />
              </div>
              <div>
                <label className="text-sm text-neutral-400 block mb-2">Role</label>
                <select value={row.adminRole} onChange={(event) => updateRow(row.id, { adminRole: event.target.value })} className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white">
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="OPS_MANAGER">Operations Manager</option>
                  <option value="CATALOG_MANAGER">Catalog Manager</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-neutral-400 block mb-2">Reset Password</label>
                <input type="password" value={row.newPassword} onChange={(event) => updateRow(row.id, { newPassword: event.target.value })} placeholder="Leave blank to keep current password" className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white placeholder:text-neutral-600" />
              </div>
            </div>

            {row.error ? <p className="text-sm text-red-400">{row.error}</p> : null}
            {row.message ? <p className="text-sm text-green-400">{row.message}</p> : null}

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/admin/audit?actor=${encodeURIComponent(row.email)}`}
                className="rounded-xl border border-neutral-700 px-5 py-3 text-sm font-semibold text-neutral-200 transition-colors hover:bg-neutral-900"
              >
                View Audit
              </Link>
              <button type="button" onClick={() => handleSave(row.id)} disabled={row.submitting} className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors disabled:opacity-50">
                {row.submitting ? 'Saving...' : 'Save Admin'}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(row.id)}
                disabled={row.submitting}
                className="rounded-xl border border-red-500/40 px-5 py-3 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
              >
                Delete Admin
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

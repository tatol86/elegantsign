'use client';

import { useState } from 'react';

const ADMIN_ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'OPS_MANAGER', label: 'Operations Manager' },
  { value: 'CATALOG_MANAGER', label: 'Catalog Manager' },
] as const;

export default function AdminCreateForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminRole, setAdminRole] = useState<(typeof ADMIN_ROLES)[number]['value']>('OPS_MANAGER');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, adminRole }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || 'Unable to create admin.');
        return;
      }

      setName('');
      setEmail('');
      setPassword('');
      setAdminRole('OPS_MANAGER');
      setMessage('Admin account created. Refresh the page to see it in the list.');
    } catch {
      setError('Unable to create admin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">Create Admin</h2>
        <p className="text-sm text-neutral-400 mt-1">
          Create a new backend account and assign one of the three role levels.
        </p>
      </div>

      <div>
        <label className="text-sm text-neutral-400 block mb-2">Name</label>
        <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white" />
      </div>
      <div>
        <label className="text-sm text-neutral-400 block mb-2">Email</label>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white" />
      </div>
      <div>
        <label className="text-sm text-neutral-400 block mb-2">Temporary Password</label>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white" />
      </div>
      <div>
        <label className="text-sm text-neutral-400 block mb-2">Role</label>
        <select value={adminRole} onChange={(event) => setAdminRole(event.target.value as (typeof ADMIN_ROLES)[number]['value'])} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white">
          {ADMIN_ROLES.map((role) => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </select>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {message ? <p className="text-sm text-green-400">{message}</p> : null}

      <button type="submit" disabled={submitting} className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors disabled:opacity-50">
        {submitting ? 'Creating...' : 'Create Admin'}
      </button>
    </form>
  );
}

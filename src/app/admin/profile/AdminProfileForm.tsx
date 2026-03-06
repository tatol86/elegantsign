'use client';

import { useState } from 'react';

type AdminProfileFormProps = {
  initialName: string;
  initialEmail: string;
};

export default function AdminProfileForm({
  initialName,
  initialEmail,
}: AdminProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          currentPassword,
          newPassword: newPassword || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || 'Unable to update profile.');
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setMessage('Profile updated.');
    } catch {
      setError('Unable to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">My Account</h2>
        <p className="text-sm text-neutral-400 mt-1">
          Update your display name, login email, or password.
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
        <label className="text-sm text-neutral-400 block mb-2">Current Password</label>
        <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white" />
      </div>
      <div>
        <label className="text-sm text-neutral-400 block mb-2">New Password</label>
        <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Leave blank to keep current password" className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white placeholder:text-neutral-600" />
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {message ? <p className="text-sm text-green-400">{message}</p> : null}

      <button type="submit" disabled={submitting} className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors disabled:opacity-50">
        {submitting ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}

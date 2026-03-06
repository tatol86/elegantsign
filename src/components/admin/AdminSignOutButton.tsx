'use client';

import { useState } from 'react';

export default function AdminSignOutButton() {
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = async () => {
    setSubmitting(true);

    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
      });
      window.location.href = '/admin/login';
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={submitting}
      className="px-4 py-2.5 border border-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
    >
      {submitting ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}

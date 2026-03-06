'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AccountLogoutButton() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = async () => {
    setSubmitting(true);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/account/login');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleLogout} disabled={submitting}>
      {submitting ? 'Signing out...' : 'Sign out'}
    </Button>
  );
}

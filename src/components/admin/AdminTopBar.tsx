'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSignOutButton from '@/components/admin/AdminSignOutButton';
import { hasAdminPermission, type AdminPermission, type AdminRole } from '@/lib/admin-auth';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard', permission: 'dashboard' as AdminPermission },
  { href: '/admin/profile', label: 'Profile', permission: 'dashboard' as AdminPermission },
  { href: '/admin/orders', label: 'Orders', permission: 'operations' as AdminPermission },
  { href: '/admin/payments', label: 'Payments', permission: 'operations' as AdminPermission },
  { href: '/admin/fulfillment', label: 'Fulfillment', permission: 'operations' as AdminPermission },
  { href: '/admin/customers', label: 'Customers', permission: 'operations' as AdminPermission },
  { href: '/admin/products', label: 'Products', permission: 'catalog' as AdminPermission },
  { href: '/admin/admins', label: 'Admins', permission: 'manage_admins' as AdminPermission },
  { href: '/admin/audit', label: 'Audit', permission: 'manage_admins' as AdminPermission },
];

type AdminSessionState = {
  role: AdminRole;
} | null;

function isActiveLink(pathname: string, href: string) {
  if (href === '/admin') {
    return pathname === '/admin';
  }

  return pathname.startsWith(href);
}

export default function AdminTopBar() {
  const pathname = usePathname();
  const [session, setSession] = useState<AdminSessionState>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const response = await fetch('/api/admin/session', {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (isMounted) {
          setSession(data?.admin?.role ? { role: data.admin.role } : null);
        }
      } catch {
        // Leave the nav in its minimal state if session fetch fails.
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleLinks = ADMIN_LINKS.filter((link) => {
    if (!session) {
      return link.permission === 'dashboard';
    }

    return hasAdminPermission(session.role, link.permission);
  });

  return (
    <div className="border-b border-neutral-800 bg-neutral-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-xl font-bold tracking-tight">
            <span className="text-neutral-500">ELEGANT</span>SIGN
            <span className="text-neutral-600 font-normal ml-3 text-sm">Admin</span>
          </Link>
          <Link href="/" className="text-sm text-neutral-500 hover:text-white transition-colors">
            View Store
          </Link>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <nav className="flex flex-wrap gap-2">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  isActiveLink(pathname, link.href)
                    ? 'bg-white text-black'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <AdminSignOutButton />
        </div>
      </div>
    </div>
  );
}

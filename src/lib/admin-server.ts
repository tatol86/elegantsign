import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ADMIN_SESSION_COOKIE,
  getAdminPermissionForPath,
  hasAdminPermission,
  type AdminPermission,
  type AdminSessionPayload,
  verifyAdminSessionToken,
} from '@/lib/admin-auth';

export async function getCurrentAdmin(): Promise<AdminSessionPayload | null> {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifyAdminSessionToken(token);
}

export async function requireAdmin(permission: AdminPermission = 'dashboard') {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect('/admin/login');
  }

  if (!hasAdminPermission(admin.role, permission)) {
    redirect('/admin');
  }

  return admin;
}

export async function requireAdminForPath(pathname: string) {
  const permission = getAdminPermissionForPath(pathname) || 'dashboard';
  return requireAdmin(permission);
}

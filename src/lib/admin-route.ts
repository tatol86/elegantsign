import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  hasAdminPermission,
  type AdminPermission,
  type AdminSessionPayload,
  verifyAdminSessionToken,
} from '@/lib/admin-auth';

export async function requireAdminRequest(
  req: NextRequest,
  permission: AdminPermission = 'dashboard',
): Promise<AdminSessionPayload | NextResponse> {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const admin = token ? await verifyAdminSessionToken(token) : null;

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasAdminPermission(admin.role, permission)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return admin;
}
